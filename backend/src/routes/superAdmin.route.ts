import { Router } from "express";
import { SuperAdminController } from "../controllers/superAdmin.controller";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// All routes require super admin authentication
router.use(AuthMiddleware);

// Super admin only middleware
const superAdminOnly = [
  AuthorizeRoles("admin"),
  (req: any, res: any, next: any) => {
    if (!req.user?.isSuperAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Super admin access required" });
    }
    next();
  },
];

// Company management
router.get("/companies", SuperAdminController.getAllCompanies);
router.get("/companies/:companyId", SuperAdminController.getCompanyDetails);
router.put(
  "/companies/:companyId/status",
  SuperAdminController.updateCompanyStatus
);
router.post(
  "/companies/:companyId/subscription/activate",
  SuperAdminController.activateCompanySubscription
);
router.post(
  "/companies/:companyId/subscription/deactivate",
  SuperAdminController.deactivateCompanySubscription
);

// User management
router.get("/users", SuperAdminController.getAllUsers);
router.get("/users/unassigned", SuperAdminController.getUnassignedUsers);
router.patch("/users/:userId/role", SuperAdminController.updateUserRole);
router.post(
  "/users/:userId/assign-company",
  SuperAdminController.assignUserToCompany
);
router.delete(
  "/users/:userId/remove-company",
  SuperAdminController.removeUserFromCompany
);

// System operations
router.get("/statistics", SuperAdminController.getSystemStatistics);
router.get("/activity", SuperAdminController.getRecentActivity);
router.get("/search/companies", SuperAdminController.searchCompanies);
router.get("/search/users", SuperAdminController.searchUsers);

// Enhanced super admin routes

router.get(
  "/company-analytics",
  superAdminOnly,
  SuperAdminController.getCompanyAnalytics
);

router.put(
  "/company/fee",
  superAdminOnly,
  SuperAdminController.updateCompanyFee
);

router.post(
  "/company/activate-subscription",
  superAdminOnly,
  SuperAdminController.activateCompanySubscription
);

router.post(
  "/company/deactivate-subscription",
  superAdminOnly,
  SuperAdminController.deactivateCompanySubscription
);

router.get(
  "/tax-management",
  superAdminOnly,
  SuperAdminController.getSystemTaxManagement
);

router.get(
  "/notifications",
  superAdminOnly,
  SuperAdminController.getSystemNotifications
);

router.post(
  "/send-notification",
  superAdminOnly,
  SuperAdminController.sendSystemNotification
);

router.get("/health", superAdminOnly, SuperAdminController.getSystemHealth);

export default router;
