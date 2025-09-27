import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import {
  createExpenseController,
  getExpensesController,
  getExpenseStatisticsController,
  createDiscountController,
  getDiscountsController,
  applyDiscountController,
  getProfitAndLossController,
  getFinancialDashboardController,
} from "../controllers/financialTracking.controller";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];

// Expense routes
router.post(
  "/expenses",
  staffAndAbove,
  RequireActiveCompany(),
  createExpenseController
);

router.get(
  "/expenses",
  staffAndAbove,
  RequireActiveCompany(),
  getExpensesController
);

router.get(
  "/expenses/statistics",
  staffAndAbove,
  RequireActiveCompany(),
  getExpenseStatisticsController
);

// Discount routes
router.post(
  "/discounts",
  adminOnly,
  RequireActiveCompany(),
  createDiscountController
);

router.get(
  "/discounts",
  staffAndAbove,
  RequireActiveCompany(),
  getDiscountsController
);

router.post(
  "/discounts/apply",
  staffAndAbove,
  RequireActiveCompany(),
  applyDiscountController
);

// Financial analytics routes
router.get(
  "/profit-loss",
  staffAndAbove,
  RequireActiveCompany(),
  getProfitAndLossController
);

router.get(
  "/dashboard",
  staffAndAbove,
  RequireActiveCompany(),
  getFinancialDashboardController
);

export default router;