import { Router } from "express";
import { CompanyRoleController } from "../controllers/companyRole.controller";
import {
  AuthMiddleware,
  RequireActiveCompany,
  RequirePermissions,
} from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication and active company
router.use(AuthMiddleware);
router.use(RequireActiveCompany());

// Get all company roles
router.get("/", CompanyRoleController.getCompanyRoles);

// Get a specific role by ID
router.get("/:roleId", CompanyRoleController.getRoleById);

// Create a new role (requires manageUsers permission)
router.post(
  "/",
  RequirePermissions(["manageUsers"]),
  CompanyRoleController.createRole
);

// Update a role (requires manageUsers permission)
router.put(
  "/:roleId",
  RequirePermissions(["manageUsers"]),
  CompanyRoleController.updateRole
);

// Delete a role (requires manageUsers permission)
router.delete(
  "/:roleId",
  RequirePermissions(["manageUsers"]),
  CompanyRoleController.deleteRole
);

// Assign role to user (requires manageUsers permission)
router.post(
  "/assign",
  RequirePermissions(["manageUsers"]),
  CompanyRoleController.assignRoleToUser
);

// Remove role from user (requires manageUsers permission)
router.delete(
  "/user/:userId",
  RequirePermissions(["manageUsers"]),
  CompanyRoleController.removeRoleFromUser
);

// Get users with a specific role
router.get("/:roleId/users", CompanyRoleController.getUsersWithRole);

// Initialize default roles for a company (requires manageUsers permission)
router.post(
  "/initialize-defaults",
  RequirePermissions(["manageUsers"]),
  CompanyRoleController.initializeDefaultRoles
);

export default router;
