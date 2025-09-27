import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import {
  createNotificationController,
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  getUnreadCountController,
  createBookingNotificationController,
  createRentalNotificationController,
  createPaymentNotificationController,
  createSubscriptionNotificationController,
} from "../controllers/enhancedNotification.controller";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];

// Notification CRUD operations
router.post(
  "/",
  staffAndAbove,
  RequireActiveCompany(),
  createNotificationController
);

router.get(
  "/",
  allUsers,
  RequireActiveCompany(),
  getNotificationsController
);

router.get(
  "/unread-count",
  allUsers,
  RequireActiveCompany(),
  getUnreadCountController
);

router.put(
  "/:id/read",
  allUsers,
  RequireActiveCompany(),
  markAsReadController
);

router.put(
  "/mark-all-read",
  allUsers,
  RequireActiveCompany(),
  markAllAsReadController
);

router.delete(
  "/:id",
  allUsers,
  RequireActiveCompany(),
  deleteNotificationController
);

// Specific notification types
router.post(
  "/booking",
  staffAndAbove,
  RequireActiveCompany(),
  createBookingNotificationController
);

router.post(
  "/rental",
  staffAndAbove,
  RequireActiveCompany(),
  createRentalNotificationController
);

router.post(
  "/payment",
  staffAndAbove,
  RequireActiveCompany(),
  createPaymentNotificationController
);

router.post(
  "/subscription",
  adminOnly,
  createSubscriptionNotificationController
);

export default router;