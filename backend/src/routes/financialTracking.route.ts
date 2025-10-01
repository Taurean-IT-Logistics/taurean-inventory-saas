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
  getCompanyFinancialPerformanceController,
  getFeePercentageTrackingController,
  getTaxOwedSummaryController,
  getRevenueBreakdownController,
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

// Add summary route that maps to the same dashboard functionality
router.get(
  "/summary",
  staffAndAbove,
  RequireActiveCompany(),
  getFinancialDashboardController
);

// Enhanced financial tracking routes
router.get(
  "/performance",
  staffAndAbove,
  RequireActiveCompany(),
  getCompanyFinancialPerformanceController
);

router.get(
  "/fee-tracking",
  staffAndAbove,
  RequireActiveCompany(),
  getFeePercentageTrackingController
);

router.get(
  "/tax-summary",
  staffAndAbove,
  RequireActiveCompany(),
  getTaxOwedSummaryController
);

router.get(
  "/revenue-breakdown",
  staffAndAbove,
  RequireActiveCompany(),
  getRevenueBreakdownController
);

export default router;
