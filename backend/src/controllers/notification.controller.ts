import { Request, Response } from "express";
import { sendSuccess, sendError, sendNotFound } from "../utils";
import { notificationService } from "../services/notification.service";
import { NotificationPreferencesModel } from "../models/notificationPreferences.model";
import { createSubscriptionNotification } from "../services/notification.service";

// Get user notifications
async function getUserNotifications(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getUserNotifications(
      userId,
      page,
      limit
    );

    sendSuccess(res, "User notifications retrieved", result);
  } catch (error: any) {
    sendError(res, "Failed to retrieve notifications", error.message);
  }
}

// Get notifications
async function getNotifications(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getUserNotifications(
      userId,
      page,
      limit
    );

    sendSuccess(res, "Notifications fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch notifications", error);
  }
}

// Mark notification as read
async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    await notificationService.markAsRead(id, userId);
    sendSuccess(res, "Notification marked as read");
  } catch (error: any) {
    sendError(res, "Failed to mark notification as read", error.message);
  }
}

// Mark all notifications as read
async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    await notificationService.markAllAsRead(userId);
    sendSuccess(res, "All notifications marked as read");
  } catch (error: any) {
    sendError(res, "Failed to mark all notifications as read", error.message);
  }
}

// Delete notification
async function deleteNotification(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    await notificationService.deleteNotification(id, userId);
    sendSuccess(res, "Notification deleted");
  } catch (error: any) {
    sendError(res, "Failed to delete notification", error.message);
  }
}

// Get user notification preferences
async function getPreferences(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    let preferences = await NotificationPreferencesModel.findOne({
      user: userId,
    });

    if (!preferences) {
      // Create default preferences if none exist
      preferences = await NotificationPreferencesModel.create({
        user: userId,
        email: true,
        push: true,
        sms: false,
        bookingNotifications: true,
        paymentNotifications: true,
        systemNotifications: true,
        marketingNotifications: false,
      });
    }

    sendSuccess(res, "Notification preferences retrieved", { preferences });
  } catch (error: any) {
    sendError(res, "Failed to retrieve preferences", error.message);
  }
}

// Update user notification preferences
async function updatePreferences(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const updateData = req.body;

    const preferences = await NotificationPreferencesModel.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    sendSuccess(res, "Preferences updated", { preferences });
  } catch (error: any) {
    sendError(res, "Failed to update preferences", error.message);
  }
}

// Get unread notification count
async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const count = await notificationService.getUnreadCount(userId);

    sendSuccess(res, "Unread count retrieved", { count });
  } catch (error: any) {
    sendError(res, "Failed to get unread count", error.message);
  }
}

/**
 * Create a notification
 */
const createNotificationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type, title, message, category, data } = req.body;
    const userId = req.user?.id;

    if (!type || !title || !message || !category) {
      sendError(res, "Type, title, message, and category are required");
      return;
    }

    const notification = await notificationService.createNotification({
      userId,
      title,
      message,
      type,
      category,
      data,
    });

    sendSuccess(res, "Notification created successfully", notification);
  } catch (error) {
    sendError(res, "Failed to create notification", error);
  }
};

/**
 * Create subscription notification
 */
const createSubscriptionNotificationController = async (
  req: Request,
  res: Response
): Promise<void> => {
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

// Export all functions
export {
  // Basic notification operations
  getUserNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getPreferences,
  updatePreferences,
  // Enhanced notification operations
  createNotificationController,
  createSubscriptionNotificationController,
};

// Export with different names for routes
export const getNotificationsController = getNotifications;
export const markAsReadController = markAsRead;
export const markAllAsReadController = markAllAsRead;
export const deleteNotificationController = deleteNotification;
export const getUnreadCountController = getUnreadCount;
