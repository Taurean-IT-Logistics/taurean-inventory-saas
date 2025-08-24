import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import { TaxController } from "../controllers";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];

router.post("/", adminOnly, RequireActiveCompany(), TaxController.createTax); // Create a new tax
router.get("/", TaxController.getTaxes); // Get all taxes (with filters)

// Company-specific: Get taxes for the authenticated user's company
router.get(
  "/company",
  staffAndAbove,
  RequireActiveCompany(),
  TaxController.getCompanyTaxes
);

router.get("/:id", staffAndAbove, TaxController.getTax); // Get a single tax by ID
router.put("/:id", adminOnly, RequireActiveCompany(), TaxController.updateTax); // Update tax by ID
router.delete("/:id", adminOnly, TaxController.deleteTax); // Delete tax by ID

export default router;
