import { Router } from "express";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";
import { TaxController } from "../controllers";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];

router.post("/", adminOnly, TaxController.createTax); // Create a new tax
router.get("/", AuthMiddleware, TaxController.getTaxes); // Get all taxes (with filters)
router.get("/:id", staffAndAbove, TaxController.getTax); // Get a single tax by ID
router.put("/:id", adminOnly, TaxController.updateTax); // Update tax by ID
router.delete("/:id", adminOnly, TaxController.deleteTax); // Delete tax by ID

export default router;
