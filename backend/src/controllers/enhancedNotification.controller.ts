import { Request, Response } from "express";
import { 
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createBookingNotification,
  createRentalNotification,
  createPaymentNotification,
  createSubscriptionNotification,
} from "../services/enhancedNotification.service";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Create a notification
 */
export const createNotificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, title, message, category, data, sendEmail } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!type || !title || !message || !category) {
      sendError(res, "Type, title, message, and category are required");
      return;
    }

    const notification = await createNotification({
      companyId,
      userId,
      type,
      title,
      message,
      category,
      data,
      sendEmail: sendEmail || false,
    });

    sendSuccess(res, "Notification created successfully", notification);
  } catch (error) {
    sendError(res, "Failed to create notification", error);
  }
};

/**
 * Get notifications
 */
export const getNotificationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      userId: req.user?.id,
      companyId: req.user?.companyId,
      type: req.query.type as string,
      category: req.query.category as string,
      isRead: req.query.isRead === "true" ? true : req.query.isRead === "false" ? false : undefined,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
    };

    const result = await getNotifications(filters, pagination);
    sendSuccess(res, "Notifications fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch notifications", error);
  }
};

/**
 * Mark notification as read
 */
export const markAsReadController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const success = await markAsRead(id, userId);
    if (!success) {
      sendNotFound(res, "Notification not found");
      return;
    }

    sendSuccess(res, "Notification marked as read", { success: true });
  } catch (error) {
    sendError(res, "Failed to mark notification as read", error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsReadController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    const count = await markAllAsRead(userId, companyId);
    sendSuccess(res, "All notifications marked as read", { count });
  } catch (error) {
    sendError(res, "Failed to mark all notifications as read", error);
  }
};

/**
 * Delete notification
 */
export const deleteNotificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const success = await deleteNotification(id, userId);
    if (!success) {
      sendNotFound(res, "Notification not found");
      return;
    }

    sendSuccess(res, "Notification deleted successfully", { success: true });
  } catch (error) {
    sendError(res, "Failed to delete notification", error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCountController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    const count = await getUnreadCount(userId, companyId);
    sendSuccess(res, "Unread count fetched successfully", { count });
  } catch (error) {
    sendError(res, "Failed to get unread count", error);
  }
};

/**
 * Create booking notification
 */
export const createBookingNotificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, type } = req.body;

    if (!bookingId || !type) {
      sendError(res, "Booking ID and type are required");
      return;
    }

    await createBookingNotification(bookingId, type);
    sendSuccess(res, "Booking notification created successfully");
  } catch (error) {
    sendError(res, "Failed to create booking notification", error);
  }
};

/**
 * Create rental notification
 */
export const createRentalNotificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rentalId, type } = req.body;

    if (!rentalId || !type) {
      sendError(res, "Rental ID and type are required");
      return;
    }

    await createRentalNotification(rentalId, type);
    sendSuccess(res, "Rental notification created successfully");
  } catch (error) {
    sendError(res, "Failed to create rental notification", error);
  }
};

/**
 * Create payment notification
 */
export const createPaymentNotificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId, type } = req.body;

    if (!transactionId || !type) {
      sendError(res, "Transaction ID and type are required");
      return;
    }

    await createPaymentNotification(transactionId, type);
    sendSuccess(res, "Payment notification created successfully");
  } catch (error) {
    sendError(res, "Failed to create payment notification", error);
  }
};

/**
 * Create subscription notification
 */
export const createSubscriptionNotificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, type } = req.body;

    if (!companyId || !type) {
      sendError(res, "Company ID and type are required");
      return;
    }

    await createSubscriptionNotification(companyId, type);
    sendSuccess(res, "Subscription notification created successfully");
  } catch (error) {
    sendError(res, "Failed to create subscription notification", error);
  }
};