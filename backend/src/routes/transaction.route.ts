import { Router } from "express";
import { TransactionController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";

const router = Router();

// Webhook route - no authentication required (Paystack calls this)
router.post("/webhook", TransactionController.handlePaystackWebhookController);

// All other payment routes require authentication
router.use(AuthMiddleware);

// Initialize payment and create transaction - authenticated users

router.get(
  "/",
  AuthorizeRoles("admin", "staff"),
  TransactionController.getAllTransactions
);

router.post("/initialize", TransactionController.initializePaymentController);

router.get("/user", AuthMiddleware, TransactionController.getUserTransactions);

// Verify payment by reference - authenticated users
router.get("/verify/:reference", TransactionController.verifyPaymentController);

// Get payment details by reference - admin and staff
router.get(
  "/details/:reference",
  TransactionController.getPaymentDetailsController
);

// Create transaction from existing payment - admin only (manual fallback)
router.post(
  "/create-transaction",
  AuthorizeRoles("admin"),
  TransactionController.createTransactionFromPaymentController
);

export default router;
