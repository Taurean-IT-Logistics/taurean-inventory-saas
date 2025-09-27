import { Router } from "express";
import * as NotificationController from "../controllers/notification.controller";
import {
  AuthMiddleware,
  RequireActiveCompany,
  AuthorizeRoles,
} from "../middlewares/auth.middleware";

const router = Router();

// Define middleware combinations
const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];

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

// Enhanced notification routes
router.post(
  "/",
  staffAndAbove,
  RequireActiveCompany(),
  NotificationController.createNotificationController
);

router.get(
  "/",
  allUsers,
  RequireActiveCompany(),
  NotificationController.getNotificationsController
);

router.get(
  "/unread-count",
  allUsers,
  RequireActiveCompany(),
  NotificationController.getUnreadCountController
);

router.put(
  "/:id/read",
  allUsers,
  RequireActiveCompany(),
  NotificationController.markAsReadController
);

router.put(
  "/mark-all-read",
  allUsers,
  RequireActiveCompany(),
  NotificationController.markAllAsReadController
);

router.delete(
  "/:id",
  allUsers,
  RequireActiveCompany(),
  NotificationController.deleteNotificationController
);

// Subscription notification (admin only)
router.post(
  "/subscription",
  adminOnly,
  NotificationController.createSubscriptionNotificationController
);

export default router;
