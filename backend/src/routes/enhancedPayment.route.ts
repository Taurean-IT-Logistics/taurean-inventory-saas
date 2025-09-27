import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import {
  processCashPaymentController,
  processSplitPaymentController,
  processAdvancePaymentController,
  applyAdvancePaymentController,
  getAdvanceBalanceController,
  getSplitPaymentDetailsController,
  completeSplitPaymentController,
} from "../controllers/enhancedPayment.controller";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];

// Cash payment routes
router.post(
  "/cash",
  staffAndAbove,
  RequireActiveCompany(),
  processCashPaymentController
);

// Split payment routes
router.post(
  "/split",
  staffAndAbove,
  RequireActiveCompany(),
  processSplitPaymentController
);

router.get(
  "/split/:splitPaymentId",
  staffAndAbove,
  RequireActiveCompany(),
  getSplitPaymentDetailsController
);

router.put(
  "/split/:splitPaymentId/complete",
  staffAndAbove,
  RequireActiveCompany(),
  completeSplitPaymentController
);

// Advance payment routes
router.post(
  "/advance",
  allUsers,
  RequireActiveCompany(),
  processAdvancePaymentController
);

router.post(
  "/advance/apply",
  staffAndAbove,
  RequireActiveCompany(),
  applyAdvancePaymentController
);

router.get(
  "/advance/balance",
  allUsers,
  RequireActiveCompany(),
  getAdvanceBalanceController
);

export default router;