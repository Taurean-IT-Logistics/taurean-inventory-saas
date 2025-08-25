import { NotificationModel, NotificationDocument } from "../models/notification.model";
import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { BookingModel } from "../models/booking.model";
import { TransactionModel } from "../models/transaction.model";
import { InvoiceModel } from "../models/invoice.model";
import { emitEvent } from "../realtime/socket";
import { Events } from "../realtime/events";
import { Types } from "mongoose";

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "booking" | "payment" | "invoice" | "system" | "support";
  data?: any;
}

class NotificationService {
  // Create a new notification
  async createNotification(data: CreateNotificationData): Promise<NotificationDocument> {
    try {
      const notification = new NotificationModel({
        user: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        data: data.data || {},
        isRead: false,
      });

      const savedNotification = await notification.save();

      // Emit real-time event
      emitEvent(Events.NotificationCreated, savedNotification, `user:${data.userId}`);

      return savedNotification;
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Create notification for booking events
  async createBookingNotification(
    bookingId: string,
    event: "created" | "confirmed" | "cancelled" | "reminder" | "completed"
  ): Promise<void> {
    try {
      const booking = await BookingModel.findById(bookingId)
        .populate("user", "name email")
        .populate("facility", "name")
        .populate("company", "name");

      if (!booking) return;

      const user = booking.user as any;
      const facility = booking.facility as any;
      const company = (booking as any).company;

      let notificationData: CreateNotificationData;

      switch (event) {
        case "created":
          notificationData = {
            userId: user._id,
            title: "Booking Request Submitted",
            message: `Your booking request for ${facility.name} has been submitted and is pending confirmation.`,
            type: "info",
            category: "booking",
            data: {
              bookingId: booking._id,
              facilityName: facility.name,
              startDate: booking.startDate,
              endDate: booking.endDate,
              link: `/user/bookings/${booking._id}`,
            },
          };
          break;

        case "confirmed":
          notificationData = {
            userId: user._id,
            title: "Booking Confirmed",
            message: `Your booking for ${facility.name} has been confirmed!`,
            type: "success",
            category: "booking",
            data: {
              bookingId: booking._id,
              facilityName: facility.name,
              startDate: booking.startDate,
              endDate: booking.endDate,
              link: `/user/bookings/${booking._id}`,
            },
          };
          break;

        case "cancelled":
          notificationData = {
            userId: user._id,
            title: "Booking Cancelled",
            message: `Your booking for ${facility.name} has been cancelled.`,
            type: "warning",
            category: "booking",
            data: {
              bookingId: booking._id,
              facilityName: facility.name,
              startDate: booking.startDate,
              endDate: booking.endDate,
              link: `/user/bookings/${booking._id}`,
            },
          };
          break;

        case "reminder":
          notificationData = {
            userId: user._id,
            title: "Booking Reminder",
            message: `Reminder: Your booking for ${facility.name} is tomorrow!`,
            type: "info",
            category: "booking",
            data: {
              bookingId: booking._id,
              facilityName: facility.name,
              startDate: booking.startDate,
              endDate: booking.endDate,
              link: `/user/bookings/${booking._id}`,
            },
          };
          break;

        case "completed":
          notificationData = {
            userId: user._id,
            title: "Booking Completed",
            message: `Your booking for ${facility.name} has been completed. Thank you for using our service!`,
            type: "success",
            category: "booking",
            data: {
              bookingId: booking._id,
              facilityName: facility.name,
              startDate: booking.startDate,
              endDate: booking.endDate,
              link: `/user/bookings/${booking._id}`,
            },
          };
          break;

        default:
          return;
      }

      await this.createNotification(notificationData);
    } catch (error) {
      console.error("Error creating booking notification:", error);
    }
  }

  // Create notification for payment events
  async createPaymentNotification(
    transactionId: string,
    event: "initiated" | "successful" | "failed" | "refunded"
  ): Promise<void> {
    try {
      const transaction = await TransactionModel.findById(transactionId)
        .populate("user", "name email")
        .populate("facility", "name")
        .populate("company", "name");

      if (!transaction) return;

      const user = transaction.user as any;
      const facility = transaction.facility as any;
      const company = (transaction as any).company;

      let notificationData: CreateNotificationData;

      switch (event) {
        case "initiated":
          notificationData = {
            userId: user._id,
            title: "Payment Initiated",
            message: `Payment of ${transaction.currency} ${(transaction.amount / 100).toFixed(2)} has been initiated.`,
            type: "info",
            category: "payment",
            data: {
              transactionId: transaction._id,
              amount: transaction.amount / 100,
              currency: transaction.currency,
              facilityName: facility?.name,
              link: `/user/transactions`,
            },
          };
          break;

        case "successful":
          notificationData = {
            userId: user._id,
            title: "Payment Successful",
            message: `Payment of ${transaction.currency} ${(transaction.amount / 100).toFixed(2)} has been processed successfully!`,
            type: "success",
            category: "payment",
            data: {
              transactionId: transaction._id,
              amount: transaction.amount / 100,
              currency: transaction.currency,
              facilityName: facility?.name,
              link: `/user/transactions`,
            },
          };
          break;

        case "failed":
          notificationData = {
            userId: user._id,
            title: "Payment Failed",
            message: `Payment of ${transaction.currency} ${(transaction.amount / 100).toFixed(2)} has failed. Please try again.`,
            type: "error",
            category: "payment",
            data: {
              transactionId: transaction._id,
              amount: transaction.amount / 100,
              currency: transaction.currency,
              facilityName: facility?.name,
              link: `/user/transactions`,
            },
          };
          break;

        case "refunded":
          notificationData = {
            userId: user._id,
            title: "Payment Refunded",
            message: `A refund of ${transaction.currency} ${(transaction.amount / 100).toFixed(2)} has been processed.`,
            type: "success",
            category: "payment",
            data: {
              transactionId: transaction._id,
              amount: transaction.amount / 100,
              currency: transaction.currency,
              facilityName: facility?.name,
              link: `/user/transactions`,
            },
          };
          break;

        default:
          return;
      }

      await this.createNotification(notificationData);
    } catch (error) {
      console.error("Error creating payment notification:", error);
    }
  }

  // Create notification for invoice events
  async createInvoiceNotification(
    invoiceId: string,
    event: "created" | "paid" | "overdue" | "reminder"
  ): Promise<void> {
    try {
      const invoice = await InvoiceModel.findById(invoiceId)
        .populate("user", "name email")
        .populate("company", "name");

      if (!invoice) return;

      const user = invoice.user as any;
      const company = invoice.company as any;

      let notificationData: CreateNotificationData;

      switch (event) {
        case "created":
          notificationData = {
            userId: user._id,
            title: "New Invoice Generated",
            message: `A new invoice #${invoice.invoiceNumber} for ${invoice.currency} ${invoice.totalAmount.toFixed(2)} has been generated.`,
            type: "info",
            category: "invoice",
            data: {
              invoiceId: invoice._id,
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.totalAmount,
              currency: invoice.currency,
              dueDate: invoice.dueDate,
              link: `/user/invoices/${invoice._id}`,
            },
          };
          break;

        case "paid":
          notificationData = {
            userId: user._id,
            title: "Invoice Paid",
            message: `Invoice #${invoice.invoiceNumber} has been paid successfully!`,
            type: "success",
            category: "invoice",
            data: {
              invoiceId: invoice._id,
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.totalAmount,
              currency: invoice.currency,
              link: `/user/invoices/${invoice._id}`,
            },
          };
          break;

        case "overdue":
          notificationData = {
            userId: user._id,
            title: "Invoice Overdue",
            message: `Invoice #${invoice.invoiceNumber} is overdue. Please make payment as soon as possible.`,
            type: "warning",
            category: "invoice",
            data: {
              invoiceId: invoice._id,
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.totalAmount,
              currency: invoice.currency,
              dueDate: invoice.dueDate,
              link: `/user/invoices/${invoice._id}`,
            },
          };
          break;

        case "reminder":
          notificationData = {
            userId: user._id,
            title: "Invoice Reminder",
            message: `Reminder: Invoice #${invoice.invoiceNumber} is due soon.`,
            type: "info",
            category: "invoice",
            data: {
              invoiceId: invoice._id,
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.totalAmount,
              currency: invoice.currency,
              dueDate: invoice.dueDate,
              link: `/user/invoices/${invoice._id}`,
            },
          };
          break;

        default:
          return;
      }

      await this.createNotification(notificationData);
    } catch (error) {
      console.error("Error creating invoice notification:", error);
    }
  }

  // Create system notification
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    data?: any
  ): Promise<void> {
    try {
      const notificationData: CreateNotificationData = {
        userId,
        title,
        message,
        type,
        category: "system",
        data,
      };

      await this.createNotification(notificationData);
    } catch (error) {
      console.error("Error creating system notification:", error);
    }
  }

  // Create support notification
  async createSupportNotification(
    userId: string,
    event: "ticket_created" | "ticket_updated" | "message_received",
    ticketId: string,
    title?: string
  ): Promise<void> {
    try {
      let notificationData: CreateNotificationData;

      switch (event) {
        case "ticket_created":
          notificationData = {
            userId,
            title: "Support Ticket Created",
            message: `Your support ticket "${title}" has been created and is being reviewed.`,
            type: "info",
            category: "support",
            data: {
              ticketId,
              title,
              link: `/user/support/${ticketId}`,
            },
          };
          break;

        case "ticket_updated":
          notificationData = {
            userId,
            title: "Support Ticket Updated",
            message: `Your support ticket "${title}" has been updated.`,
            type: "info",
            category: "support",
            data: {
              ticketId,
              title,
              link: `/user/support/${ticketId}`,
            },
          };
          break;

        case "message_received":
          notificationData = {
            userId,
            title: "New Support Message",
            message: `You have received a new message on your support ticket "${title}".`,
            type: "info",
            category: "support",
            data: {
              ticketId,
              title,
              link: `/user/support/${ticketId}`,
            },
          };
          break;

        default:
          return;
      }

      await this.createNotification(notificationData);
    } catch (error) {
      console.error("Error creating support notification:", error);
    }
  }

  // Bulk notification for company events
  async createCompanyNotification(
    companyId: string,
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    data?: any
  ): Promise<void> {
    try {
      const users = await UserModel.find({ company: companyId, isDeleted: false });

      for (const user of users) {
        await this.createSystemNotification(user._id, title, message, type, data);
      }
    } catch (error) {
      console.error("Error creating company notification:", error);
    }
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ notifications: NotificationDocument[]; total: number; pages: number }> {
    try {
      const total = await NotificationModel.countDocuments({ user: userId, isDeleted: false });
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const notifications = await NotificationModel.find({ user: userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return { notifications, total, pages };
    } catch (error) {
      throw new Error(`Error fetching user notifications: ${error.message}`);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await NotificationModel.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true }
      );

      // Emit real-time event
      emitEvent(Events.NotificationUpdated, {
        notificationId,
        updates: { isRead: true },
      }, `user:${userId}`);
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await NotificationModel.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
      );

      // Emit real-time event
      emitEvent(Events.NotificationUpdated, {
        notificationId: "all",
        updates: { isRead: true },
      }, `user:${userId}`);
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await NotificationModel.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isDeleted: true }
      );

      // Emit real-time event
      emitEvent(Events.NotificationDeleted, notificationId, `user:${userId}`);
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await NotificationModel.countDocuments({
        user: userId,
        isRead: false,
        isDeleted: false,
      });
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }
}

export const notificationService = new NotificationService();