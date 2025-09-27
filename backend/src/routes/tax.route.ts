import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import { TaxController } from "../controllers";

const router: Router = Router();

const superAdminOnly = [AuthMiddleware, AuthorizeRoles("super_admin")];
const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware, AuthorizeRoles("user", "staff", "admin", "super_admin")];

// Global taxes (Super Admin only)
router.get("/global", superAdminOnly, TaxController.getGlobalTaxes); // Get all global taxes
router.post("/global", superAdminOnly, TaxController.createGlobalTax); // Create global tax

// Company-specific taxes
router.get("/company", allUsers, RequireActiveCompany(), TaxController.getCompanyTaxes); // Get company taxes
router.post("/company", staffAndAbove, RequireActiveCompany(), TaxController.createCompanyTax); // Create company tax

// Combined taxes (global + company for regular users)
router.get("/", allUsers, RequireActiveCompany(), TaxController.getCombinedTaxes); // Get combined taxes

// Individual tax operations
router.get("/:id", allUsers, TaxController.getTax); // Get a single tax by ID
router.put("/:id", staffAndAbove, RequireActiveCompany(), TaxController.updateTax); // Update tax by ID
router.delete("/:id", staffAndAbove, RequireActiveCompany(), TaxController.deleteTax); // Delete tax by ID

// Legacy routes for backward compatibility
router.get("/defaults", TaxController.getDefaultTaxes); // Get default system taxes
router.post("/defaults", superAdminOnly, TaxController.createDefaultTaxes); // Create default system taxes

export default router;
