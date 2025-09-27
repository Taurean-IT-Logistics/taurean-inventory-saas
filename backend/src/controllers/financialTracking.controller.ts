import { Request, Response } from "express";
import { 
  createExpense,
  getExpenses,
  getExpenseStatistics,
  createDiscount,
  getDiscounts,
  applyDiscount,
  getProfitAndLoss,
  getFinancialDashboard,
} from "../services/financialTracking.service";
import { sendSuccess, sendError, sendNotFound } from "../utils";

/**
 * Create an expense
 */
export const createExpenseController = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenseData = {
      ...req.body,
      company: req.user?.companyId,
      createdBy: req.user?.id,
    };

    const expense = await createExpense(expenseData);
    sendSuccess(res, "Expense created successfully", expense);
  } catch (error) {
    sendError(res, "Failed to create expense", error);
  }
};

/**
 * Get expenses
 */
export const getExpensesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      companyId: req.user?.companyId,
      category: req.query.category as string,
      status: req.query.status as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      createdBy: req.query.createdBy as string,
      isRecurring: req.query.isRecurring === "true" ? true : undefined,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await getExpenses(filters, pagination);
    sendSuccess(res, "Expenses fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch expenses", error);
  }
};

/**
 * Get expense statistics
 */
export const getExpenseStatisticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const statistics = await getExpenseStatistics(companyId, startDate, endDate);
    sendSuccess(res, "Expense statistics fetched successfully", statistics);
  } catch (error) {
    sendError(res, "Failed to fetch expense statistics", error);
  }
};

/**
 * Create a discount
 */
export const createDiscountController = async (req: Request, res: Response): Promise<void> => {
  try {
    const discountData = {
      ...req.body,
      company: req.user?.companyId,
      createdBy: req.user?.id,
    };

    const discount = await createDiscount(discountData);
    sendSuccess(res, "Discount created successfully", discount);
  } catch (error) {
    sendError(res, "Failed to create discount", error);
  }
};

/**
 * Get discounts
 */
export const getDiscountsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      companyId: req.user?.companyId,
      isActive: req.query.isActive === "true" ? true : undefined,
      applicableTo: req.query.applicableTo as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    };

    const result = await getDiscounts(filters, pagination);
    sendSuccess(res, "Discounts fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch discounts", error);
  }
};

/**
 * Apply discount
 */
export const applyDiscountController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { discountId, amount, applicableItemId } = req.body;

    if (!discountId || !amount) {
      sendError(res, "Discount ID and amount are required");
      return;
    }

    const result = await applyDiscount(discountId, amount, applicableItemId);
    sendSuccess(res, "Discount applied successfully", result);
  } catch (error) {
    sendError(res, "Failed to apply discount", error);
  }
};

/**
 * Get profit and loss statement
 */
export const getProfitAndLossController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const result = await getProfitAndLoss(companyId, startDate, endDate);
    sendSuccess(res, "Profit and loss statement fetched successfully", result);
  } catch (error) {
    sendError(res, "Failed to fetch profit and loss statement", error);
  }
};

/**
 * Get financial dashboard
 */
export const getFinancialDashboardController = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    const dashboard = await getFinancialDashboard(companyId);
    sendSuccess(res, "Financial dashboard fetched successfully", dashboard);
  } catch (error) {
    sendError(res, "Failed to fetch financial dashboard", error);
  }
};