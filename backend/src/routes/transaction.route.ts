import { Router } from "express";
import { TransactionController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";
import {
  RequireActiveCompany,
  RequirePermissions,
} from "../middlewares/auth.middleware";

const router = Router();

// Webhook route - no authentication required (Paystack calls this)
router.post("/webhook", TransactionController.handlePaystackWebhookController);

// All other payment routes require authentication
router.use(AuthMiddleware);

// List all transactions (company scope) - finance permissions
router.get(
  "/",
  RequireActiveCompany(),
  RequirePermissions(["accessFinancials"]),
  TransactionController.getAllTransactions
);

// Initialize payment and create transaction - authenticated users
router.post("/initialize", TransactionController.initializePaymentController);

router.get("/user", AuthMiddleware, TransactionController.getUserTransactions);

router.get("/verify/:reference", TransactionController.verifyPaymentController);

// Get payment details by reference - company finance
router.get(
  "/details/:reference",
  RequireActiveCompany(),
  RequirePermissions(["accessFinancials"]),
  TransactionController.getPaymentDetailsController
);

// List all banks
router.get("/banks", TransactionController.listBanks);

// Get mobile money details by bank code and account number
router.get(
  "/momo/:bankCode/:accountNumber",
  TransactionController.getBankMomoDetails
);

// Update subaccount details - admin only
router.put(
  "/subaccount/:subaccountCode",
  RequireActiveCompany(),
  RequirePermissions(["manageTransactions"]),
  TransactionController.updateSubAccount
);

// Get subaccount details - admin only
router.get(
  "/subaccount/:subaccountCode",
  RequireActiveCompany(),
  RequirePermissions(["manageTransactions"]),
  TransactionController.getSubAccountDetails
);

// Create transaction from existing payment - admin only (manual fallback)
router.post(
  "/create-transaction",
  RequireActiveCompany(),
  RequirePermissions(["manageTransactions"]),
  TransactionController.createTransactionFromPaymentController
);

// update transaction - staff/admin with manageTransactions
router.put(
  "/:id",
  RequireActiveCompany(),
  RequirePermissions(["manageTransactions"]),
  TransactionController.updateTransaction
);

// Export routes
router.get(
  "/export",
  RequireActiveCompany(),
  RequirePermissions(["accessFinancials"]),
  TransactionController.exportTransactions
);

router.get(
  "/export/user",
  TransactionController.exportUserTransactions
);

router.get(
  "/export/bookings",
  RequireActiveCompany(),
  RequirePermissions(["accessFinancials"]),
  TransactionController.exportBookings
);

router.get(
  "/export/invoices",
  RequireActiveCompany(),
  RequirePermissions(["accessFinancials"]),
  TransactionController.exportInvoices
);

export default router;
