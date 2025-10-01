import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import {
  createPaymentScheduleController,
  getUserPaymentSchedulesController,
  getCompanyPaymentSchedulesController,
  processPaymentController,
  getPendingAdvancePaymentsController,
  getPendingSplitPaymentsController,
  getPendingPaymentsController,
  getPaymentScheduleByIdController,
  cancelPaymentScheduleController,
} from "../controllers/paymentSchedule.controller";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];

// Create payment schedule
router.post(
  "/create",
  allUsers,
  RequireActiveCompany(),
  createPaymentScheduleController
);

// Get user payment schedules
router.get(
  "/user",
  allUsers,
  RequireActiveCompany(),
  getUserPaymentSchedulesController
);

// Get company payment schedules (admin view)
router.get(
  "/company",
  staffAndAbove,
  RequireActiveCompany(),
  getCompanyPaymentSchedulesController
);

// Process a payment from schedule
router.post(
  "/process",
  staffAndAbove,
  RequireActiveCompany(),
  processPaymentController
);

// Get pending advance payments
router.get(
  "/pending/advance",
  allUsers,
  RequireActiveCompany(),
  getPendingAdvancePaymentsController
);

// Get pending split payments
router.get(
  "/pending/split",
  allUsers,
  RequireActiveCompany(),
  getPendingSplitPaymentsController
);

// Get all pending payments (unified endpoint)
router.get(
  "/pending",
  allUsers,
  RequireActiveCompany(),
  getPendingPaymentsController
);

// Get payment schedule by ID
router.get(
  "/:scheduleId",
  allUsers,
  RequireActiveCompany(),
  getPaymentScheduleByIdController
);

// Cancel payment schedule
router.post(
  "/:scheduleId/cancel",
  staffAndAbove,
  RequireActiveCompany(),
  cancelPaymentScheduleController
);

export default router;
