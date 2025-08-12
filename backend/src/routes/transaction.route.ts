import { Router } from "express";
import { TransactionController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";
import { RequireActiveCompany, RequirePermissions } from "../middlewares/auth.middleware";

const router = Router();

// Webhook route - no authentication required (Paystack calls this)
router.post("/webhook", TransactionController.handlePaystackWebhookController);

// All other payment routes require authentication
router.use(AuthMiddleware);

// List all transactions (company scope) - finance permissions
router.get("/", RequireActiveCompany(), RequirePermissions(["accessFinancials"]), TransactionController.getAllTransactions);

// Initialize payment and create transaction - authenticated users
router.post("/initialize", TransactionController.initializePaymentController);

router.get("/user", AuthMiddleware, TransactionController.getUserTransactions);

// Verify payment by reference - company finance
router.get("/verify/:reference", RequireActiveCompany(), RequirePermissions(["accessFinancials"]), TransactionController.verifyPaymentController);

// Get payment details by reference - company finance
router.get("/details/:reference", RequireActiveCompany(), RequirePermissions(["accessFinancials"]), TransactionController.getPaymentDetailsController);

// Create transaction from existing payment - admin only (manual fallback)
router.post("/create-transaction", RequireActiveCompany(), RequirePermissions(["manageTransactions"]), TransactionController.createTransactionFromPaymentController);

// update transaction - staff/admin with manageTransactions
router.put("/:id", RequireActiveCompany(), RequirePermissions(["manageTransactions"]), TransactionController.updateTransaction);

export default router;
