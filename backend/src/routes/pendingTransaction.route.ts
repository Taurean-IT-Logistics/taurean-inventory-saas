import { Router } from "express";
import PendingTransactionController from "../controllers/pendingTransaction.controller";
import {
  AuthMiddleware,
  RequireCompanyContext,
  RequirePermissions,
  AuthorizeRoles,
} from "../middlewares/auth.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(AuthMiddleware);

// Apply company context middleware
router.use(RequireCompanyContext());

// Define role-based middleware
const adminOnly = [AuthorizeRoles("admin", "super_admin")];
const staffAndAbove = [AuthorizeRoles("admin", "super_admin", "staff")];
const allUsers = [AuthorizeRoles("admin", "super_admin", "staff", "user")];

// Pending Transaction Routes

// Create a pending transaction (users can create their own)
router.post(
  "/",
  allUsers,
  RequirePermissions(["createTransactions"]),
  PendingTransactionController.createPendingTransaction
);

// Get pending transactions for a company (admin/staff only)
router.get(
  "/",
  staffAndAbove,
  RequirePermissions(["viewTransactions"]),
  PendingTransactionController.getPendingTransactions
);

// Get user's own pending transactions
router.get(
  "/my-transactions",
  allUsers,
  RequirePermissions(["viewTransactions"]),
  PendingTransactionController.getUserPendingTransactions
);

// Get pending transaction by ID
router.get(
  "/:id",
  staffAndAbove,
  RequirePermissions(["viewTransactions"]),
  PendingTransactionController.getPendingTransactionById
);

// Process a pending transaction (admin/staff only)
router.put(
  "/:id/process",
  staffAndAbove,
  RequirePermissions(["manageTransactions"]),
  PendingTransactionController.processPendingTransaction
);

// Cancel a pending transaction (users can cancel their own)
router.put(
  "/:id/cancel",
  allUsers,
  RequirePermissions(["createTransactions"]),
  PendingTransactionController.cancelPendingTransaction
);

export default router;
