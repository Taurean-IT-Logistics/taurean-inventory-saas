import { Router } from "express";
import * as InvoiceController from "../controllers/invoice.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RequireActiveCompany } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", AuthMiddleware, RequireActiveCompany(), InvoiceController.create);
router.post("/:id/pay", AuthMiddleware, RequireActiveCompany(), InvoiceController.pay);
router.get("/company", AuthMiddleware, RequireActiveCompany(), InvoiceController.listCompanyInvoices);
router.get("/me", AuthMiddleware, InvoiceController.listUserInvoices);
router.get("/company/receipts", AuthMiddleware, RequireActiveCompany(), InvoiceController.listCompanyReceipts);
router.get("/me/receipts", AuthMiddleware, InvoiceController.listUserReceipts);

export default router;