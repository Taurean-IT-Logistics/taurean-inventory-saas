import { Request, Response } from "express";
import { sendSuccess, sendError, sendNotFound } from "../utils";
import { NotificationModel } from "../models/notification.model";
import { NotificationPreferencesModel } from "../models/notificationPreferences.model";

// Get user notifications
export async function getUserNotifications(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const notifications = await NotificationModel.find({
      userId,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    sendSuccess(res, "User notifications retrieved", { notifications });
  } catch (error: any) {
    sendError(res, "Failed to retrieve notifications", error.message);
  }
}

// Mark notification as read
export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      sendNotFound(res, "Notification not found");
      return;
    }

    sendSuccess(res, "Notification marked as read", { notification });
  } catch (error: any) {
    sendError(res, "Failed to mark notification as read", error.message);
  }
}

// Mark all notifications as read
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    await NotificationModel.updateMany(
      { userId, isRead: false, isDeleted: { $ne: true } },
      { isRead: true }
    );

    sendSuccess(res, "All notifications marked as read");
  } catch (error: any) {
    sendError(res, "Failed to mark all notifications as read", error.message);
  }
}

// Delete notification
export async function deleteNotification(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      sendNotFound(res, "Notification not found");
      return;
    }

    sendSuccess(res, "Notification deleted");
  } catch (error: any) {
    sendError(res, "Failed to delete notification", error.message);
  }
}

// Get user notification preferences
export async function getPreferences(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    let preferences = await NotificationPreferencesModel.findOne({ userId });

    if (!preferences) {
      // Create default preferences if none exist
      preferences = await NotificationPreferencesModel.create({
        userId,
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
export async function updatePreferences(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const updateData = req.body;

    const preferences = await NotificationPreferencesModel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    sendSuccess(res, "Preferences updated", { preferences });
  } catch (error: any) {
    sendError(res, "Failed to update preferences", error.message);
  }
}

// Get unread notification count
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const count = await NotificationModel.countDocuments({
      userId,
      isRead: false,
      isDeleted: { $ne: true },
    });

    sendSuccess(res, "Unread count retrieved", { count });
  } catch (error: any) {
    sendError(res, "Failed to get unread count", error.message);
  }
}
