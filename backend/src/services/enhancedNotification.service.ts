import { NotificationModel, NotificationDocument } from "../models/notification.model";
import { RentalModel } from "../models/rental.model";
import { BookingModel } from "../models/booking.model";
import { TransactionModel } from "../models/transaction.model";
import { CompanyModel } from "../models/company.model";
import { UserModel } from "../models/user.model";
import { emailService } from "./email.service";
import { Notification } from "../types";

/**
 * Enhanced Notification Service
 * Handles all notification types including in-app and email notifications
 */

/**
 * Create a notification
 */
const createNotification = async (notificationData: {
  companyId?: string;
  userId?: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  category: "booking" | "payment" | "invoice" | "system" | "support" | "rental" | "subscription";
  data?: any;
  sendEmail?: boolean;
}): Promise<NotificationDocument> => {
  try {
    const notification = new NotificationModel({
      company: notificationData.companyId,
      user: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      category: notificationData.category,
      data: notificationData.data,
    });

    await notification.save();

    // Send email notification if requested
    if (notificationData.sendEmail && notificationData.userId) {
      await sendEmailNotification(notificationData.userId, {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        category: notificationData.category,
      });
    }

    return notification;
  } catch (error) {
    throw new Error(
      `Failed to create notification: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (
  userId: string,
  notificationData: {
    title: string;
    message: string;
    type: string;
    category: string;
  }
): Promise<void> => {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.email) {
      throw new Error("User not found or email not available");
    }

    const emailSubject = `[Taurean IT] ${notificationData.title}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notificationData.title}</h2>
        <p style="color: #666; line-height: 1.6;">${notificationData.message}</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Taurean IT Facility Management System.
        </p>
      </div>
    `;

    await emailService.sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailBody,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
    // Don't throw error to prevent notification creation from failing
  }
};

/**
 * Get notifications for user or company
 */
const getNotifications = async (
  filters: {
    userId?: string;
    companyId?: string;
    type?: string;
    category?: string;
    isRead?: boolean;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{ notifications: NotificationDocument[]; total: number; totalPages: number; currentPage: number }> => {
  try {
    const query: any = { isDeleted: false };

    if (filters.userId) {
      query.user = filters.userId;
    }

    if (filters.companyId) {
      query.company = filters.companyId;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      NotificationModel.find(query)
        .populate('user', 'name email')
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(query)
    ]);

    return {
      notifications,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch notifications: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId: string, userId?: string): Promise<boolean> => {
  try {
    const query: any = { _id: notificationId, isDeleted: false };
    if (userId) {
      query.user = userId;
    }

    const result = await NotificationModel.updateOne(query, { isRead: true });
    return result.modifiedCount > 0;
  } catch (error) {
    throw new Error(
      `Failed to mark notification as read: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId?: string, companyId?: string): Promise<number> => {
  try {
    const query: any = { isRead: false, isDeleted: false };
    if (userId) {
      query.user = userId;
    }
    if (companyId) {
      query.company = companyId;
    }

    const result = await NotificationModel.updateMany(query, { isRead: true });
    return result.modifiedCount;
  } catch (error) {
    throw new Error(
      `Failed to mark all notifications as read: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId: string, userId?: string): Promise<boolean> => {
  try {
    const query: any = { _id: notificationId, isDeleted: false };
    if (userId) {
      query.user = userId;
    }

    const result = await NotificationModel.updateOne(query, { isDeleted: true });
    return result.modifiedCount > 0;
  } catch (error) {
    throw new Error(
      `Failed to delete notification: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId?: string, companyId?: string): Promise<number> => {
  try {
    const query: any = { isRead: false, isDeleted: false };
    if (userId) {
      query.user = userId;
    }
    if (companyId) {
      query.company = companyId;
    }

    return await NotificationModel.countDocuments(query);
  } catch (error) {
    throw new Error(
      `Failed to get unread count: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Create booking-related notifications
 */
const createBookingNotification = async (bookingId: string, type: "created" | "updated" | "cancelled" | "confirmed"): Promise<void> => {
  try {
    const booking = await BookingModel.findById(bookingId)
      .populate('user', 'name email')
      .populate('facility', 'name');

    if (!booking) return;

    const notificationTypes = {
      created: { type: "info" as const, title: "New Booking Created", message: `A new booking has been created for ${(booking.facility as any)?.name}` },
      updated: { type: "info" as const, title: "Booking Updated", message: `Your booking for ${(booking.facility as any)?.name} has been updated` },
      cancelled: { type: "warning" as const, title: "Booking Cancelled", message: `Your booking for ${(booking.facility as any)?.name} has been cancelled` },
      confirmed: { type: "success" as const, title: "Booking Confirmed", message: `Your booking for ${(booking.facility as any)?.name} has been confirmed` },
    };

    const notificationData = notificationTypes[type];

    await createNotification({
      companyId: booking.company as string,
      userId: booking.user as string,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      category: "booking",
      data: { bookingId },
      sendEmail: true,
    });
  } catch (error) {
    console.error("Failed to create booking notification:", error);
  }
};

/**
 * Create rental-related notifications
 */
const createRentalNotification = async (rentalId: string, type: "created" | "returned" | "overdue" | "due_soon"): Promise<void> => {
  try {
    const rental = await RentalModel.findById(rentalId)
      .populate('user', 'name email')
      .populate('item', 'name');

    if (!rental) return;

    const notificationTypes = {
      created: { type: "info" as const, title: "Item Rented", message: `You have rented ${(rental.item as any)?.name}` },
      returned: { type: "success" as const, title: "Item Returned", message: `You have returned ${(rental.item as any)?.name}` },
      overdue: { type: "error" as const, title: "Rental Overdue", message: `Your rental of ${(rental.item as any)?.name} is overdue` },
      due_soon: { type: "warning" as const, title: "Rental Due Soon", message: `Your rental of ${(rental.item as any)?.name} is due soon` },
    };

    const notificationData = notificationTypes[type];

    await createNotification({
      companyId: rental.company as string,
      userId: rental.user as string,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      category: "rental",
      data: { rentalId },
      sendEmail: true,
    });
  } catch (error) {
    console.error("Failed to create rental notification:", error);
  }
};

/**
 * Create payment-related notifications
 */
const createPaymentNotification = async (transactionId: string, type: "success" | "failed" | "pending"): Promise<void> => {
  try {
    const transaction = await TransactionModel.findById(transactionId)
      .populate('user', 'name email');

    if (!transaction) return;

    const notificationTypes = {
      success: { type: "success" as const, title: "Payment Successful", message: `Your payment of ₵${transaction.amount} has been processed successfully` },
      failed: { type: "error" as const, title: "Payment Failed", message: `Your payment of ₵${transaction.amount} has failed` },
      pending: { type: "warning" as const, title: "Payment Pending", message: `Your payment of ₵${transaction.amount} is pending` },
    };

    const notificationData = notificationTypes[type];

    await createNotification({
      companyId: transaction.company as string,
      userId: transaction.user as string,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      category: "payment",
      data: { transactionId },
      sendEmail: true,
    });
  } catch (error) {
    console.error("Failed to create payment notification:", error);
  }
};

/**
 * Create subscription-related notifications
 */
const createSubscriptionNotification = async (companyId: string, type: "expiring" | "expired" | "activated" | "trial_ending"): Promise<void> => {
  try {
    const company = await CompanyModel.findById(companyId);
    if (!company) return;

    const notificationTypes = {
      expiring: { type: "warning" as const, title: "Subscription Expiring", message: `Your subscription will expire soon. Please renew to continue using the service.` },
      expired: { type: "error" as const, title: "Subscription Expired", message: `Your subscription has expired. Please renew to continue using the service.` },
      activated: { type: "success" as const, title: "Subscription Activated", message: `Your subscription has been activated successfully.` },
      trial_ending: { type: "warning" as const, title: "Trial Ending Soon", message: `Your free trial will end soon. Please subscribe to continue using the service.` },
    };

    const notificationData = notificationTypes[type];

    // Send to all company users
    const users = await UserModel.find({ company: companyId, isDeleted: false });
    
    for (const user of users) {
      await createNotification({
        companyId,
        userId: user._id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        category: "subscription",
        data: { companyId },
        sendEmail: true,
      });
    }
  } catch (error) {
    console.error("Failed to create subscription notification:", error);
  }
};

/**
 * Check for overdue rentals and send notifications
 */
const checkOverdueRentals = async (): Promise<void> => {
  try {
    const overdueRentals = await RentalModel.find({
      status: "active",
      endDate: { $lt: new Date() },
      isDeleted: false,
    });

    for (const rental of overdueRentals) {
      // Update status to overdue
      await RentalModel.findByIdAndUpdate(rental._id, { status: "overdue" });
      
      // Send notification
      await createRentalNotification(rental._id.toString(), "overdue");
    }
  } catch (error) {
    console.error("Failed to check overdue rentals:", error);
  }
};

/**
 * Check for rentals due soon and send notifications
 */
const checkRentalsDueSoon = async (): Promise<void> => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rentalsDueSoon = await RentalModel.find({
      status: "active",
      endDate: { $lte: tomorrow, $gte: new Date() },
      isDeleted: false,
    });

    for (const rental of rentalsDueSoon) {
      await createRentalNotification(rental._id.toString(), "due_soon");
    }
  } catch (error) {
    console.error("Failed to check rentals due soon:", error);
  }
};

export {
  createNotification,
  sendEmailNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createBookingNotification,
  createRentalNotification,
  createPaymentNotification,
  createSubscriptionNotification,
  checkOverdueRentals,
  checkRentalsDueSoon,
};