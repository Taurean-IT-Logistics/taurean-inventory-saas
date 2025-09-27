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

// Create a pending transaction (admin/staff only)
router.post(
  "/",
  staffAndAbove,
  RequirePermissions(["manageTransactions"]),
  PendingTransactionController.createPendingTransaction
);

// Get pending transactions for a company (admin/staff only)
router.get(
  "/",
  staffAndAbove,
  RequirePermissions(["viewTransactions"]),
  PendingTransactionController.getPendingTransactions
);

// Get pending transactions for a company (admin/staff only) - alternative endpoint
router.get(
  "/company",
  staffAndAbove,
  RequirePermissions(["viewTransactions"]),
  PendingTransactionController.getPendingTransactions
);

// Get user's own pending transactions
router.get(
  "/my-transactions",
  allUsers,
  PendingTransactionController.getUserPendingTransactions
);

// Get user's own pending transactions - alternative endpoint
router.get(
  "/user",
  allUsers,
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
  PendingTransactionController.cancelPendingTransaction
);

export default router;
