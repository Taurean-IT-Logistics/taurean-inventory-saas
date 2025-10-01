import { ExpenseModel, ExpenseDocument } from "../models/expense.model";
import { DiscountModel, DiscountDocument } from "../models/discount.model";
import { TransactionModel } from "../models/transaction.model";
import { RentalModel } from "../models/rental.model";
import { BookingModel } from "../models/booking.model";
import { Expense, Discount } from "../types";

/**
 * Financial Tracking Service
 * Handles expenses, discounts, and financial analytics
 */

/**
 * Create an expense
 */
const createExpense = async (
  expenseData: Partial<Expense>
): Promise<ExpenseDocument> => {
  try {
    const expense = new ExpenseModel(expenseData);
    return await expense.save();
  } catch (error) {
    throw new Error(
      `Failed to create expense: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get expenses with pagination and filters
 */
const getExpenses = async (
  filters: {
    companyId?: string;
    category?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    createdBy?: string;
    isRecurring?: boolean;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  expenses: ExpenseDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = { isDeleted: false };

    if (filters.companyId) {
      query.company = filters.companyId;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.createdBy) {
      query.createdBy = filters.createdBy;
    }

    if (filters.isRecurring !== undefined) {
      query.isRecurring = filters.isRecurring;
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.date.$lte = filters.endDate;
      }
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      ExpenseModel.find(query)
        .populate("createdBy", "name email")
        .populate("approvedBy", "name email")
        .populate("company", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      ExpenseModel.countDocuments(query),
    ]);

    return {
      expenses,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch expenses: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get expense statistics
 */
const getExpenseStatistics = async (
  companyId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  categoryBreakdown: { [key: string]: { count: number; amount: number } };
  monthlyTrend: { month: string; amount: number }[];
  topCategories: { category: string; amount: number; percentage: number }[];
}> => {
  try {
    const query: any = { isDeleted: false, status: "approved" };
    if (companyId) {
      query.company = companyId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    const expenses = await ExpenseModel.find(query);

    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Category breakdown
    const categoryBreakdown = expenses.reduce(
      (acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = { count: 0, amount: 0 };
        }
        acc[expense.category].count += 1;
        acc[expense.category].amount += expense.amount;
        return acc;
      },
      {} as { [key: string]: { count: number; amount: number } }
    );

    // Monthly trend
    const monthlyTrend = expenses.reduce(
      (acc, expense) => {
        const month = expense.date.toISOString().substring(0, 7); // YYYY-MM
        const existing = acc.find((item) => item.month === month);
        if (existing) {
          existing.amount += expense.amount;
        } else {
          acc.push({ month, amount: expense.amount });
        }
        return acc;
      },
      [] as { month: string; amount: number }[]
    );

    // Top categories
    const topCategories = Object.entries(categoryBreakdown)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalExpenses,
      totalAmount,
      averageAmount,
      categoryBreakdown,
      monthlyTrend,
      topCategories,
    };
  } catch (error) {
    throw new Error(
      `Failed to get expense statistics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Create a discount
 */
const createDiscount = async (
  discountData: Partial<Discount>
): Promise<DiscountDocument> => {
  try {
    const discount = new DiscountModel(discountData);
    return await discount.save();
  } catch (error) {
    throw new Error(
      `Failed to create discount: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get discounts with pagination and filters
 */
const getDiscounts = async (
  filters: {
    companyId?: string;
    isActive?: boolean;
    applicableTo?: string;
    startDate?: Date;
    endDate?: Date;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  discounts: DiscountDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const query: any = { isDeleted: false };

    if (filters.companyId) {
      query.company = filters.companyId;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.applicableTo) {
      query.applicableTo = filters.applicableTo;
    }

    if (filters.startDate || filters.endDate) {
      query.startDate = {};
      if (filters.startDate) {
        query.startDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.startDate.$lte = filters.endDate;
      }
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [discounts, total] = await Promise.all([
      DiscountModel.find(query)
        .populate("createdBy", "name email")
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DiscountModel.countDocuments(query),
    ]);

    return {
      discounts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch discounts: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Apply discount to an amount
 */
const applyDiscount = async (
  discountId: string,
  amount: number,
  applicableItemId?: string
): Promise<{
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discount: DiscountDocument;
}> => {
  try {
    const discount = await DiscountModel.findById(discountId);
    if (!discount) {
      throw new Error("Discount not found");
    }

    if (!discount.isActive) {
      throw new Error("Discount is not active");
    }

    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
      throw new Error("Discount is not valid for current date");
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      throw new Error("Discount usage limit exceeded");
    }

    if (discount.minimumAmount && amount < discount.minimumAmount) {
      throw new Error(
        `Minimum amount of ${discount.minimumAmount} required for this discount`
      );
    }

    // Check if discount applies to specific items
    if (discount.applicableTo !== "all" && applicableItemId) {
      if (!discount.applicableItems?.includes(applicableItemId)) {
        throw new Error("Discount does not apply to this item");
      }
    }

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = (amount * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    // Apply maximum discount limit if set
    if (discount.maximumDiscount && discountAmount > discount.maximumDiscount) {
      discountAmount = discount.maximumDiscount;
    }

    // Ensure discount doesn't exceed the amount
    discountAmount = Math.min(discountAmount, amount);

    const finalAmount = amount - discountAmount;

    // Update usage count
    await DiscountModel.findByIdAndUpdate(discountId, {
      $inc: { usedCount: 1 },
    });

    return {
      originalAmount: amount,
      discountAmount,
      finalAmount,
      discount,
    };
  } catch (error) {
    throw new Error(
      `Failed to apply discount: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get profit and loss statement
 */
const getProfitAndLoss = async (
  companyId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  revenue: {
    total: number;
    bookings: number;
    rentals: number;
    other: number;
  };
  expenses: {
    total: number;
    categories: { [key: string]: number };
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}> => {
  try {
    const query: any = { isDeleted: false };
    if (companyId) {
      query.company = companyId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    // Get revenue from transactions
    const revenueTransactions = await TransactionModel.find({
      ...query,
      type: "income",
      category: { $in: ["facility", "inventory_item", "booking", "rental"] },
    });

    const revenue = {
      total: revenueTransactions.reduce((sum, txn) => sum + txn.amount, 0),
      bookings: revenueTransactions
        .filter(
          (txn) => txn.category === "facility" || txn.category === "booking"
        )
        .reduce((sum, txn) => sum + txn.amount, 0),
      rentals: revenueTransactions
        .filter(
          (txn) =>
            txn.category === "inventory_item" || txn.category === "rental"
        )
        .reduce((sum, txn) => sum + txn.amount, 0),
      other: revenueTransactions
        .filter(
          (txn) =>
            !["facility", "inventory_item", "booking", "rental"].includes(
              txn.category
            )
        )
        .reduce((sum, txn) => sum + txn.amount, 0),
    };

    // Get expenses
    const expenses = await ExpenseModel.find({
      ...query,
      status: "approved",
    });

    const expenseTotal = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const expenseCategories = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      },
      {} as { [key: string]: number }
    );

    const grossProfit = revenue.total - expenseTotal;
    const netProfit = grossProfit; // Could add more calculations here
    const margin = revenue.total > 0 ? (netProfit / revenue.total) * 100 : 0;

    return {
      revenue,
      expenses: {
        total: expenseTotal,
        categories: expenseCategories,
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin,
      },
      period: {
        start: startDate || new Date(0),
        end: endDate || new Date(),
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to get profit and loss statement: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get financial dashboard data
 */
const getFinancialDashboard = async (
  companyId?: string
): Promise<{
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyRevenue: { month: string; amount: number }[];
  monthlyExpenses: { month: string; amount: number }[];
  topExpenseCategories: { category: string; amount: number }[];
  recentTransactions: any[];
  upcomingPayments: any[];
}> => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    // Get current month data
    const currentMonthRevenue = await TransactionModel.aggregate([
      {
        $match: {
          company: companyId,
          type: "income",
          createdAt: { $gte: startOfMonth },
          isDeleted: false,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const currentMonthExpenses = await ExpenseModel.aggregate([
      {
        $match: {
          company: companyId,
          status: "approved",
          date: { $gte: startOfMonth },
          isDeleted: false,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue = currentMonthRevenue[0]?.total || 0;
    const totalExpenses = currentMonthExpenses[0]?.total || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Get monthly trends
    const monthlyRevenue = await TransactionModel.aggregate([
      {
        $match: {
          company: companyId,
          type: "income",
          createdAt: { $gte: startOfYear },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyExpenses = await ExpenseModel.aggregate([
      {
        $match: {
          company: companyId,
          status: "approved",
          date: { $gte: startOfYear },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top expense categories
    const topExpenseCategories = await ExpenseModel.aggregate([
      {
        $match: {
          company: companyId,
          status: "approved",
          date: { $gte: startOfMonth },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 5 },
    ]);

    // Get recent transactions
    const recentTransactions = await TransactionModel.find({
      company: companyId,
      isDeleted: false,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get upcoming payments (bookings with pending payments)
    const upcomingPayments = await BookingModel.find({
      company: companyId,
      paymentStatus: "pending",
      isDeleted: false,
    })
      .populate("user", "name email")
      .populate("facility", "name")
      .sort({ startDate: 1 })
      .limit(10);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyRevenue: monthlyRevenue.map((item) => ({
        month: item._id,
        amount: item.amount,
      })),
      monthlyExpenses: monthlyExpenses.map((item) => ({
        month: item._id,
        amount: item.amount,
      })),
      topExpenseCategories: topExpenseCategories.map((item) => ({
        category: item._id,
        amount: item.amount,
      })),
      recentTransactions,
      upcomingPayments,
    };
  } catch (error) {
    throw new Error(
      `Failed to get financial dashboard: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get company financial performance
 */
const getCompanyFinancialPerformance = async (
  companyId: string,
  startDate?: Date,
  endDate?: Date,
  period: string = "monthly"
): Promise<any> => {
  try {
    const query: any = { company: companyId, isDeleted: false };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    // Get revenue from transactions
    const revenueTransactions = await TransactionModel.find({
      ...query,
      type: "income",
    });

    const totalRevenue = revenueTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    // Get expenses
    const expenses = await ExpenseModel.find({
      ...query,
      status: "approved",
    });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Get periodic breakdown
    const periodicData =
      period === "monthly"
        ? await getMonthlyBreakdown(companyId, startDate, endDate)
        : await getYearlyBreakdown(companyId, startDate, endDate);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      period,
      periodicData,
      startDate: startDate || new Date(0),
      endDate: endDate || new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to get company financial performance: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Helper functions for periodic breakdown
const getMonthlyBreakdown = async (
  companyId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const matchQuery: any = {
    company: companyId,
    isDeleted: false,
  };

  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) {
      matchQuery.createdAt.$gte = startDate;
    }
    if (endDate) {
      matchQuery.createdAt.$lte = endDate;
    }
  }

  const revenue = await TransactionModel.aggregate([
    { $match: { ...matchQuery, type: "income" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const expenses = await ExpenseModel.aggregate([
    { $match: { ...matchQuery, status: "approved" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { revenue, expenses };
};

const getYearlyBreakdown = async (
  companyId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const matchQuery: any = {
    company: companyId,
    isDeleted: false,
  };

  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) {
      matchQuery.createdAt.$gte = startDate;
    }
    if (endDate) {
      matchQuery.createdAt.$lte = endDate;
    }
  }

  const revenue = await TransactionModel.aggregate([
    { $match: { ...matchQuery, type: "income" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const expenses = await ExpenseModel.aggregate([
    { $match: { ...matchQuery, status: "approved" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y", date: "$date" } },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { revenue, expenses };
};

/**
 * Get fee percentage tracking
 */
const getFeePercentageTracking = async (
  companyId: string,
  startDate?: Date,
  endDate?: Date
): Promise<any> => {
  try {
    const query: any = { company: companyId, isDeleted: false };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    // Get company to get fee percentage
    const CompanyModel = await import("../models/company.model").then(
      (m) => m.CompanyModel
    );
    const company = await CompanyModel.findById(companyId);
    const feePercentage = company?.feePercent || 0;

    // Get all income transactions
    const transactions = await TransactionModel.find({
      ...query,
      type: "income",
    });

    const totalRevenue = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const totalFees = totalRevenue * (feePercentage / 100);
    const averageFeePercentage = feePercentage;

    // Breakdown by category
    const feeBreakdown = transactions.reduce((acc: any[], txn) => {
      const category = txn.category || "other";
      const existing = acc.find((item) => item.category === category);
      const categoryFees = txn.amount * (feePercentage / 100);

      if (existing) {
        existing.totalRevenue += txn.amount;
        existing.totalFees += categoryFees;
        existing.count += 1;
      } else {
        acc.push({
          category,
          totalRevenue: txn.amount,
          totalFees: categoryFees,
          count: 1,
        });
      }

      return acc;
    }, []);

    // Calculate fee percentage for each category
    feeBreakdown.forEach((item) => {
      item.feePercentage =
        item.totalRevenue > 0 ? (item.totalFees / item.totalRevenue) * 100 : 0;
    });

    return {
      totalRevenue,
      totalFees,
      averageFeePercentage,
      feeBreakdown,
      startDate: startDate || new Date(0),
      endDate: endDate || new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to get fee percentage tracking: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get tax owed summary
 */
const getTaxOwedSummary = async (
  companyId: string,
  startDate?: Date,
  endDate?: Date
): Promise<any> => {
  try {
    const query: any = { company: companyId, isDeleted: false };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    // Get all transactions with taxes
    const transactions = await TransactionModel.find({
      ...query,
      type: "income",
    }).populate("taxScheduleSnapshot.scheduleId");

    // Calculate total tax from transactions
    let totalTaxOwed = 0;
    const taxBreakdown: any[] = [];

    transactions.forEach((txn) => {
      if (txn.taxScheduleSnapshot && txn.taxScheduleSnapshot.components) {
        txn.taxScheduleSnapshot.components.forEach((tax: any) => {
          const taxAmount = (txn.amount * (tax.rate || 0)) / 100;
          totalTaxOwed += taxAmount;

          const existing = taxBreakdown.find(
            (item) => item.taxId === tax._id.toString()
          );

          if (existing) {
            existing.amount += taxAmount;
            existing.transactionCount += 1;
          } else {
            taxBreakdown.push({
              taxId: tax._id,
              name: tax.name,
              rate: tax.rate,
              amount: taxAmount,
              transactionCount: 1,
              description: tax.description || "",
            });
          }
        });
      }
    });

    return {
      totalTaxOwed,
      taxBreakdown,
      startDate: startDate || new Date(0),
      endDate: endDate || new Date(),
      taxableRevenue: transactions.reduce((sum, txn) => sum + txn.amount, 0),
    };
  } catch (error) {
    throw new Error(
      `Failed to get tax owed summary: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get revenue breakdown
 */
const getRevenueBreakdown = async (
  companyId: string,
  startDate?: Date,
  endDate?: Date,
  breakdownBy: string = "category"
): Promise<any> => {
  try {
    const matchQuery: any = {
      company: companyId,
      isDeleted: false,
      type: "income",
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = startDate;
      }
      if (endDate) {
        matchQuery.createdAt.$lte = endDate;
      }
    }

    let groupBy: any = "$category";
    if (breakdownBy === "method") {
      groupBy = "$method";
    } else if (breakdownBy === "facility") {
      groupBy = "$facility";
    } else if (breakdownBy === "month") {
      groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }

    const breakdown = await TransactionModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: "$amount" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const totalRevenue = breakdown.reduce(
      (sum, item) => sum + item.totalRevenue,
      0
    );

    // Add percentage to each breakdown item
    const breakdownWithPercentage = breakdown.map((item) => ({
      ...item,
      label: item._id || "Other",
      percentage:
        totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0,
    }));

    return {
      totalRevenue,
      breakdown: breakdownWithPercentage,
      breakdownBy,
      startDate: startDate || new Date(0),
      endDate: endDate || new Date(),
      itemCount: breakdown.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to get revenue breakdown: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export {
  createExpense,
  getExpenses,
  getExpenseStatistics,
  createDiscount,
  getDiscounts,
  applyDiscount,
  getProfitAndLoss,
  getFinancialDashboard,
  getCompanyFinancialPerformance,
  getFeePercentageTracking,
  getTaxOwedSummary,
  getRevenueBreakdown,
};
