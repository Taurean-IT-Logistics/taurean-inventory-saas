import { Router } from "express";
import * as NotificationController from "../controllers/notification.controller";
import {
  AuthMiddleware,
  RequireActiveCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// User notification routes
router.get(
  "/user",
  AuthMiddleware,
  NotificationController.getUserNotifications
);
router.patch("/:id/read", AuthMiddleware, NotificationController.markAsRead);
router.patch("/read-all", AuthMiddleware, NotificationController.markAllAsRead);
router.delete(
  "/:id",
  AuthMiddleware,
  NotificationController.deleteNotification
);

// Notification preferences
router.get(
  "/preferences",
  AuthMiddleware,
  NotificationController.getPreferences
);
router.patch(
  "/preferences",
  AuthMiddleware,
  NotificationController.updatePreferences
);

// Unread count
router.get(
  "/unread-count",
  AuthMiddleware,
  NotificationController.getUnreadCount
);

export default router;
