import * as cron from "node-cron";
import { RentalModel } from "../models/rental.model";
import { BookingModel } from "../models/booking.model";
import { InventoryItemModel } from "../models/inventoryItem.model";
import { NotificationModel } from "../models/notification.model";
import { NotificationLogModel } from "../models/notificationLog.model";
import { UserModel } from "../models/user.model";
import { emitEvent } from "../utils/eventEmitter";
import { Events } from "../utils/events";
import EmailNotificationService from "./emailNotification.service";

export class CronJobService {
  private static instance: CronJobService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {}

  public static getInstance(): CronJobService {
    if (!CronJobService.instance) {
      CronJobService.instance = new CronJobService();
    }
    return CronJobService.instance;
  }

  /**
   * Start all cron jobs
   */
  public startAllJobs(): void {
    this.startRentalDueNotifications();
    this.startBookingDueNotifications();
    this.startMaintenanceDueNotifications();
    this.startOverdueNotifications();
    this.startRetryFailedNotifications();
    console.log("All cron jobs started successfully");
  }

  /**
   * Stop all cron jobs
   */
  public stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Start rental due date notifications
   * Runs every day at 9:00 AM
   */
  private startRentalDueNotifications(): void {
    const job = cron.schedule("0 9 * * *", async () => {
      try {
        console.log("Running rental due date notifications...");
        await this.checkRentalDueDates();
      } catch (error) {
        console.error("Error in rental due date notifications:", error);
      }
    });

    this.jobs.set("rentalDueNotifications", job);
    console.log("Rental due notifications cron job started");
  }

  /**
   * Start booking due date notifications
   * Runs every day at 9:00 AM
   */
  private startBookingDueNotifications(): void {
    const job = cron.schedule("0 9 * * *", async () => {
      try {
        console.log("Running booking due date notifications...");
        await this.checkBookingDueDates();
      } catch (error) {
        console.error("Error in booking due date notifications:", error);
      }
    });

    this.jobs.set("bookingDueNotifications", job);
    console.log("Booking due notifications cron job started");
  }

  /**
   * Start maintenance due notifications
   * Runs every day at 8:00 AM
   */
  private startMaintenanceDueNotifications(): void {
    const job = cron.schedule("0 8 * * *", async () => {
      try {
        console.log("Running maintenance due notifications...");
        await this.checkMaintenanceDue();
      } catch (error) {
        console.error("Error in maintenance due notifications:", error);
      }
    });

    this.jobs.set("maintenanceDueNotifications", job);
    console.log("Maintenance due notifications cron job started");
  }

  /**
   * Start overdue notifications
   * Runs every day at 10:00 AM
   */
  private startOverdueNotifications(): void {
    const job = cron.schedule("0 10 * * *", async () => {
      try {
        console.log("Running overdue notifications...");
        await this.checkOverdueItems();
      } catch (error) {
        console.error("Error in overdue notifications:", error);
      }
    });

    this.jobs.set("overdueNotifications", job);
    console.log("Overdue notifications cron job started");
  }

  /**
   * Start retry failed notifications
   * Runs every 30 minutes
   */
  private startRetryFailedNotifications(): void {
    const job = cron.schedule("*/30 * * * *", async () => {
      try {
        console.log("Running retry failed notifications...");
        await this.retryFailedNotifications();
      } catch (error) {
        console.error("Error in retry failed notifications:", error);
      }
    });

    this.jobs.set("retryFailedNotifications", job);
    console.log("Retry failed notifications cron job started");
  }

  /**
   * Check rental due dates and send notifications
   */
  private async checkRentalDueDates(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find rentals due tomorrow
    const rentalsDueTomorrow = await RentalModel.find({
      endDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow,
      },
      status: "active",
      isDeleted: false,
    }).populate("user item company");

    for (const rental of rentalsDueTomorrow) {
      await this.createRentalNotification(
        (rental.user as any)._id,
        (rental.company as any)._id,
        "rental_due_tomorrow",
        {
          rentalId: rental._id,
          itemName: (rental.item as any).name,
          dueDate: rental.endDate,
        }
      );
    }

    // Find rentals due in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    const fourDaysFromNow = new Date(threeDaysFromNow);
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 1);

    const rentalsDueIn3Days = await RentalModel.find({
      endDate: {
        $gte: threeDaysFromNow,
        $lt: fourDaysFromNow,
      },
      status: "active",
      isDeleted: false,
    }).populate("user item company");

    for (const rental of rentalsDueIn3Days) {
      await this.createRentalNotification(
        (rental.user as any)._id,
        (rental.company as any)._id,
        "rental_due_soon",
        {
          rentalId: rental._id,
          itemName: (rental.item as any).name,
          dueDate: rental.endDate,
        }
      );
    }
  }

  /**
   * Check booking due dates and send notifications
   */
  private async checkBookingDueDates(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find bookings due tomorrow
    const bookingsDueTomorrow = await BookingModel.find({
      endDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow,
      },
      status: "confirmed",
      isDeleted: false,
    }).populate("user facility company");

    for (const booking of bookingsDueTomorrow) {
      await this.createBookingNotification(
        (booking.user as any)._id,
        (booking.company as any)._id,
        "booking_due_tomorrow",
        {
          bookingId: booking._id,
          facilityName: (booking.facility as any).name,
          dueDate: booking.endDate,
        }
      );
    }
  }

  /**
   * Check maintenance due items
   */
  private async checkMaintenanceDue(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find items due for maintenance
    const maintenanceDueItems = await InventoryItemModel.find({
      nextMaintenanceDate: {
        $gte: today,
        $lt: tomorrow,
      },
      isDeleted: false,
    }).populate("company");

    for (const item of maintenanceDueItems) {
      // Get all users in the company
      const companyUsers = await UserModel.find({
        company: (item.company as any)._id,
        isDeleted: false,
      });

      for (const user of companyUsers) {
        await this.createMaintenanceNotification(
          (user._id as any).toString(),
          (item.company as any)._id,
          "maintenance_due",
          {
            itemId: item._id,
            itemName: item.name,
            maintenanceDate: (item as any).nextMaintenanceDate || new Date(),
          }
        );
      }
    }
  }

  /**
   * Check overdue items
   */
  private async checkOverdueItems(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find overdue rentals
    const overdueRentals = await RentalModel.find({
      endDate: { $lt: today },
      status: "active",
      isDeleted: false,
    }).populate("user item company");

    for (const rental of overdueRentals) {
      await this.createRentalNotification(
        (rental.user as any)._id,
        (rental.company as any)._id,
        "rental_overdue",
        {
          rentalId: rental._id,
          itemName: (rental.item as any).name,
          dueDate: rental.endDate,
          daysOverdue: Math.ceil(
            (today.getTime() - rental.endDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        }
      );
    }

    // Find overdue bookings
    const overdueBookings = await BookingModel.find({
      endDate: { $lt: today },
      status: "confirmed",
      isDeleted: false,
    }).populate("user facility company");

    for (const booking of overdueBookings) {
      await this.createBookingNotification(
        (booking.user as any)._id,
        (booking.company as any)._id,
        "booking_overdue",
        {
          bookingId: booking._id,
          facilityName: (booking.facility as any).name,
          dueDate: booking.endDate,
          daysOverdue: Math.ceil(
            (today.getTime() - booking.endDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        }
      );
    }
  }

  /**
   * Retry failed notifications
   */
  private async retryFailedNotifications(): Promise<void> {
    const now = new Date();

    // Find notifications that need retry
    const failedNotifications = await NotificationLogModel.find({
      deliveryStatus: "failed",
      retryCount: { $lt: 3 }, // Max 3 retries
      nextRetryAt: { $lte: now },
      isDeleted: false,
    });

    for (const log of failedNotifications) {
      try {
        // Retry email notification
        if (!log.emailSent) {
          const emailService = EmailNotificationService.getInstance();
          await emailService.sendEmailNotification(
            log.userId,
            log.companyId,
            log.notificationType,
            log.category,
            log.data,
            log._id.toString()
          );
        }

        // Update retry information
        const nextRetry = this.calculateNextRetryTime(log.retryCount + 1);
        await NotificationLogModel.findByIdAndUpdate(log._id, {
          lastRetryAt: new Date(),
          nextRetryAt: nextRetry,
          $inc: { retryCount: 1 },
        });

        console.log(
          `Retried notification ${log._id} (attempt ${log.retryCount + 1})`
        );
      } catch (error) {
        console.error(`Failed to retry notification ${log._id}:`, error);

        // Mark as permanently failed if max retries reached
        if (log.retryCount >= 2) {
          await NotificationLogModel.findByIdAndUpdate(log._id, {
            deliveryStatus: "failed",
            errorMessage: error.message,
          });
        }
      }
    }
  }

  /**
   * Calculate next retry time (exponential backoff)
   */
  private calculateNextRetryTime(retryCount: number): Date {
    const baseDelay = 15; // 15 minutes
    const maxDelay = 24 * 60; // 24 hours
    const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);

    const nextRetry = new Date();
    nextRetry.setMinutes(nextRetry.getMinutes() + delay);

    return nextRetry;
  }

  /**
   * Create rental notification with tracking
   */
  private async createRentalNotification(
    userId: string,
    companyId: string,
    type: string,
    data: any
  ): Promise<void> {
    // Check if notification was already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingNotification = await NotificationLogModel.findOne({
      userId,
      notificationType: type,
      sentAt: { $gte: today, $lt: tomorrow },
      isDeleted: false,
    });

    if (existingNotification) {
      console.log(`Notification ${type} already sent to user ${userId} today`);
      return;
    }

    const notificationData = this.getRentalNotificationData(type, data);

    // Create in-app notification
    const notification = new NotificationModel({
      user: userId,
      company: companyId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.notificationType,
      category: "rental",
      isPublic: false,
      data: {
        ...data,
        notificationType: type,
        timestamp: new Date(),
      },
    });

    await notification.save();

    // Create notification log
    const notificationLog = new NotificationLogModel({
      userId,
      companyId,
      notificationType: type,
      category: "rental",
      sentAt: new Date(),
      deliveryStatus: "pending",
      inAppSent: true,
      emailSent: false,
      retryCount: 0,
      maxRetries: 3,
      data: {
        ...data,
        notificationType: type,
        timestamp: new Date(),
      },
    });

    await notificationLog.save();

    // Send email notification
    try {
      const emailService = EmailNotificationService.getInstance();
      await emailService.sendEmailNotification(
        userId,
        companyId,
        type,
        "rental",
        data,
        notificationLog._id.toString()
      );
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }

    // Emit real-time event
    emitEvent(
      Events.NotificationCreated,
      {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.notificationType,
        category: "rental",
        data: notification.data,
      },
      `user:${userId}`
    );
  }

  /**
   * Create booking notification with tracking
   */
  private async createBookingNotification(
    userId: string,
    companyId: string,
    type: string,
    data: any
  ): Promise<void> {
    // Check if notification was already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingNotification = await NotificationLogModel.findOne({
      userId,
      notificationType: type,
      sentAt: { $gte: today, $lt: tomorrow },
      isDeleted: false,
    });

    if (existingNotification) {
      console.log(`Notification ${type} already sent to user ${userId} today`);
      return;
    }

    const notificationData = this.getBookingNotificationData(type, data);

    // Create in-app notification
    const notification = new NotificationModel({
      user: userId,
      company: companyId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.notificationType,
      category: "booking",
      isPublic: false,
      data: {
        ...data,
        notificationType: type,
        timestamp: new Date(),
      },
    });

    await notification.save();

    // Create notification log
    const notificationLog = new NotificationLogModel({
      userId,
      companyId,
      notificationType: type,
      category: "booking",
      sentAt: new Date(),
      deliveryStatus: "pending",
      inAppSent: true,
      emailSent: false,
      retryCount: 0,
      maxRetries: 3,
      data: {
        ...data,
        notificationType: type,
        timestamp: new Date(),
      },
    });

    await notificationLog.save();

    // Send email notification
    try {
      const emailService = EmailNotificationService.getInstance();
      await emailService.sendEmailNotification(
        userId,
        companyId,
        type,
        "booking",
        data,
        notificationLog._id.toString()
      );
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }

    // Emit real-time event
    emitEvent(
      Events.NotificationCreated,
      {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.notificationType,
        category: "booking",
        data: notification.data,
      },
      `user:${userId}`
    );
  }

  /**
   * Create maintenance notification with tracking
   */
  private async createMaintenanceNotification(
    userId: string,
    companyId: string,
    type: string,
    data: any
  ): Promise<void> {
    // Check if notification was already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingNotification = await NotificationLogModel.findOne({
      userId,
      notificationType: type,
      sentAt: { $gte: today, $lt: tomorrow },
      isDeleted: false,
    });

    if (existingNotification) {
      console.log(`Notification ${type} already sent to user ${userId} today`);
      return;
    }

    const notificationData = this.getMaintenanceNotificationData(type, data);

    // Create in-app notification
    const notification = new NotificationModel({
      user: userId,
      company: companyId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.notificationType,
      category: "maintenance",
      isPublic: false,
      data: {
        ...data,
        notificationType: type,
        timestamp: new Date(),
      },
    });

    await notification.save();

    // Create notification log
    const notificationLog = new NotificationLogModel({
      userId,
      companyId,
      notificationType: type,
      category: "maintenance",
      sentAt: new Date(),
      deliveryStatus: "pending",
      inAppSent: true,
      emailSent: false,
      retryCount: 0,
      maxRetries: 3,
      data: {
        ...data,
        notificationType: type,
        timestamp: new Date(),
      },
    });

    await notificationLog.save();

    // Send email notification
    try {
      const emailService = EmailNotificationService.getInstance();
      await emailService.sendEmailNotification(
        userId,
        companyId,
        type,
        "maintenance",
        data,
        notificationLog._id.toString()
      );
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }

    // Emit real-time event
    emitEvent(
      Events.NotificationCreated,
      {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.notificationType,
        category: "maintenance",
        data: notification.data,
      },
      `user:${userId}`
    );
  }

  /**
   * Get rental notification data
   */
  private getRentalNotificationData(type: string, data: any) {
    const templates = {
      rental_due_tomorrow: {
        title: "Rental Due Tomorrow",
        message: `Your rental for "${data.itemName}" is due tomorrow (${new Date(
          data.dueDate
        ).toLocaleDateString()}). Please prepare for return.`,
        notificationType: "warning" as const,
      },
      rental_due_soon: {
        title: "Rental Due Soon",
        message: `Your rental for "${data.itemName}" is due in 3 days (${new Date(
          data.dueDate
        ).toLocaleDateString()}). Please plan for return.`,
        notificationType: "info" as const,
      },
      rental_overdue: {
        title: "Rental Overdue",
        message: `Your rental for "${data.itemName}" is overdue by ${data.daysOverdue} day(s). Please return immediately to avoid additional fees.`,
        notificationType: "error" as const,
      },
    };

    return templates[type] || templates.rental_due_tomorrow;
  }

  /**
   * Get booking notification data
   */
  private getBookingNotificationData(type: string, data: any) {
    const templates = {
      booking_due_tomorrow: {
        title: "Booking Ends Tomorrow",
        message: `Your booking for "${data.facilityName}" ends tomorrow (${new Date(
          data.dueDate
        ).toLocaleDateString()}). Please check out on time.`,
        notificationType: "warning" as const,
      },
      booking_overdue: {
        title: "Booking Overdue",
        message: `Your booking for "${data.facilityName}" is overdue by ${data.daysOverdue} day(s). Please check out immediately.`,
        notificationType: "error" as const,
      },
    };

    return templates[type] || templates.booking_due_tomorrow;
  }

  /**
   * Get maintenance notification data
   */
  private getMaintenanceNotificationData(type: string, data: any) {
    const templates = {
      maintenance_due: {
        title: "Maintenance Due",
        message: `Item "${data.itemName}" is due for maintenance today (${new Date(
          data.maintenanceDate
        ).toLocaleDateString()}). Please schedule maintenance.`,
        notificationType: "warning" as const,
      },
    };

    return templates[type] || templates.maintenance_due;
  }
}

export default CronJobService;
