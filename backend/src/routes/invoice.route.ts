import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";
import {
  RequireActiveCompany,
  RequirePermissions,
  RequireCompanyContext,
} from "../middlewares/auth.middleware";

const router = Router();

// All invoice routes require authentication
router.use(AuthMiddleware);

// Get company invoices - finance permissions
router.get(
  "/company",
  RequireCompanyContext(),
  RequirePermissions(["accessFinancials"]),
  InvoiceController.getCompanyInvoices
);

// Get user invoices - no company context required
router.get("/user", InvoiceController.getUserInvoices);

// Get invoice by ID - user must own invoice or be in same company
router.get("/:id", InvoiceController.getInvoiceById);

// Create new invoice - finance permissions
router.post(
  "/",
  RequireCompanyContext(),
  RequirePermissions(["manageInvoices"]),
  InvoiceController.createInvoice
);

// Update invoice status - finance permissions
router.put(
  "/:id/status",
  RequireCompanyContext(),
  RequirePermissions(["manageInvoices"]),
  InvoiceController.updateInvoiceStatus
);

// Download invoice PDF - user must own invoice or be in same company
router.get("/:id/download", InvoiceController.downloadInvoice);

// Download receipt PDF - user must own invoice or be in same company
router.get("/:id/receipt", InvoiceController.downloadReceipt);

// Get invoice statistics - finance permissions
router.get(
  "/stats/company",
  RequireCompanyContext(),
  RequirePermissions(["accessFinancials"]),
  InvoiceController.getInvoiceStats
);

// Create invoice from transaction - finance permissions
router.post(
  "/from-transaction",
  RequireCompanyContext(),
  RequirePermissions(["manageInvoices"]),
  InvoiceController.createInvoiceFromTransaction
);

// Get company receipts (paid invoices) - finance permissions
router.get(
  "/receipts/company",
  RequireCompanyContext(),
  RequirePermissions(["accessFinancials"]),
  InvoiceController.getCompanyReceipts
);

// Get user receipts (paid invoices) - no company context required
router.get("/receipts/user", InvoiceController.getUserReceipts);

export default router;