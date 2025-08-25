import { Router } from "express";
import { SuperAdminController } from "../controllers/superAdmin.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// All routes require super admin authentication
router.use(AuthMiddleware);

// Company management
router.get("/companies", SuperAdminController.getAllCompanies);
router.get("/companies/:companyId", SuperAdminController.getCompanyDetails);
router.put("/companies/:companyId/status", SuperAdminController.updateCompanyStatus);
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

export default router;
