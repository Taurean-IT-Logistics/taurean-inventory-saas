import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
} from "../middlewares";
import {
  getSystemStatisticsController,
  getCompanyAnalyticsController,
  updateCompanyFeeController,
  activateCompanySubscriptionController,
  deactivateCompanySubscriptionController,
  getSystemTaxManagementController,
  getSystemNotificationsController,
  sendSystemNotificationController,
  getSystemHealthController,
} from "../controllers/superAdminEnhanced.controller";

const router: Router = Router();

// Super admin only routes
const superAdminOnly = [AuthMiddleware, AuthorizeRoles("admin"), (req: any, res: any, next: any) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(403).json({ success: false, message: "Super admin access required" });
  }
  next();
}];

// System statistics and analytics
router.get(
  "/statistics",
  superAdminOnly,
  getSystemStatisticsController
);

router.get(
  "/company-analytics",
  superAdminOnly,
  getCompanyAnalyticsController
);

// Company management
router.put(
  "/company/fee",
  superAdminOnly,
  updateCompanyFeeController
);

router.post(
  "/company/activate-subscription",
  superAdminOnly,
  activateCompanySubscriptionController
);

router.post(
  "/company/deactivate-subscription",
  superAdminOnly,
  deactivateCompanySubscriptionController
);

// System management
router.get(
  "/tax-management",
  superAdminOnly,
  getSystemTaxManagementController
);

router.get(
  "/notifications",
  superAdminOnly,
  getSystemNotificationsController
);

router.post(
  "/send-notification",
  superAdminOnly,
  sendSystemNotificationController
);

router.get(
  "/health",
  superAdminOnly,
  getSystemHealthController
);

export default router;