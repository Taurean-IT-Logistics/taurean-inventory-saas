import { Request, Response } from "express";
import { sendSuccess, sendError, sendNotFound } from "../utils";
import { notificationService } from "../services/notification.service";
import { NotificationPreferencesModel } from "../models/notificationPreferences.model";

// Get user notifications
export async function getUserNotifications(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getUserNotifications(userId, page, limit);

    sendSuccess(res, "User notifications retrieved", result);
  } catch (error: any) {
    sendError(res, "Failed to retrieve notifications", error.message);
  }
}

// Mark notification as read
export async function markAsRead(req: Request, res: Response) {
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
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    await notificationService.markAllAsRead(userId);

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

    await notificationService.deleteNotification(id, userId);

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

    let preferences = await NotificationPreferencesModel.findOne({ user: userId });

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
export async function updatePreferences(req: Request, res: Response) {
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
export async function getUnreadCount(req: Request, res: Response) {
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
