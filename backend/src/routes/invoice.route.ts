import { Router } from "express";
import * as InvoiceController from "../controllers/invoice.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RequireActiveCompany, RequirePermissions } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", AuthMiddleware, RequireActiveCompany(), RequirePermissions(["manageTransactions"]), InvoiceController.create);
router.post("/:id/pay", AuthMiddleware, RequireActiveCompany(), RequirePermissions(["manageTransactions"]), InvoiceController.pay);
router.get("/company", AuthMiddleware, RequireActiveCompany(), RequirePermissions(["viewInvoices"]), InvoiceController.listCompanyInvoices);
router.get("/me", AuthMiddleware, InvoiceController.listUserInvoices);
router.get("/company/receipts", AuthMiddleware, RequireActiveCompany(), RequirePermissions(["viewInvoices"]), InvoiceController.listCompanyReceipts);
router.get("/me/receipts", AuthMiddleware, InvoiceController.listUserReceipts);

export default router;