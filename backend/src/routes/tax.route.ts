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
const allUsers = [
  AuthMiddleware,
  AuthorizeRoles("user", "staff", "admin", "super_admin"),
];

// Company-specific taxes
router.get(
  "/company",
  allUsers,
  RequireActiveCompany(),
  TaxController.getCompanyTaxes
); // Get company taxes
router.post(
  "/company",
  staffAndAbove,
  RequireActiveCompany(),
  TaxController.createCompanyTax
); // Create company tax

// Taxes available for tax schedule creation
router.get(
  "/for-schedule-creation",
  allUsers,
  RequireActiveCompany(),
  TaxController.getTaxesForScheduleCreation
); // Get taxes available for schedule creation

// Individual tax operations
router.get("/:id", allUsers, TaxController.getTax); // Get a single tax by ID
router.post(
  "/:id/replace",
  staffAndAbove,
  RequireActiveCompany(),
  TaxController.createIndependentTax
); // Create new independent tax (replaces old one)
router.post(
  "/:id/archive",
  staffAndAbove,
  RequireActiveCompany(),
  TaxController.archiveTax
); // Archive tax
router.get(
  "/:id/audit-trail",
  allUsers,
  RequireActiveCompany(),
  TaxController.getTaxAuditTrail
); // Get tax audit trail
router.get(
  "/archived",
  allUsers,
  RequireActiveCompany(),
  TaxController.getArchivedTaxes
); // Get archived taxes
router.delete(
  "/:id",
  staffAndAbove,
  RequireActiveCompany(),
  TaxController.deleteTax
); // Delete tax by ID

// Legacy routes for backward compatibility
router.get("/defaults", TaxController.getDefaultTaxes); // Get default system taxes
router.post("/defaults", superAdminOnly, TaxController.createDefaultTaxes); // Create default system taxes

export default router;
