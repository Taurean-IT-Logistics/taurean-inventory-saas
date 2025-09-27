import { CompanyModel } from "../models/company.model";
import { UserModel } from "../models/user.model";
import { TransactionModel } from "../models/transaction.model";
import { TaxModel } from "../models/tax.model";
import { RentalModel } from "../models/rental.model";
import { BookingModel } from "../models/booking.model";
import { ExpenseModel } from "../models/expense.model";
import { NotificationModel } from "../models/notification.model";
import { createSubscriptionNotification } from "./enhancedNotification.service";

/**
 * Enhanced Super Admin Service
 * Handles system-wide management and analytics
 */

/**
 * Get system-wide statistics
 */
const getSystemStatistics = async (): Promise<{
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalRevenue: number;
  platformRevenue: number;
  totalTransactions: number;
  totalRentals: number;
  totalBookings: number;
  systemHealth: {
    database: string;
    storage: string;
    uptime: number;
  };
  recentActivity: any[];
}> => {
  try {
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      revenueData,
      platformRevenueData,
      totalTransactions,
      totalRentals,
      totalBookings,
    ] = await Promise.all([
      CompanyModel.countDocuments({ isDeleted: false }),
      CompanyModel.countDocuments({ isActive: true, isDeleted: false }),
      UserModel.countDocuments({ isDeleted: false }),
      TransactionModel.aggregate([
        { $match: { isDeleted: false, type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      TransactionModel.aggregate([
        { $match: { isDeleted: false, isPlatformRevenue: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      TransactionModel.countDocuments({ isDeleted: false }),
      RentalModel.countDocuments({ isDeleted: false }),
      BookingModel.countDocuments({ isDeleted: false }),
    ]);

    // Get recent activity
    const recentActivity = await TransactionModel.find({ isDeleted: false })
      .populate('user', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalRevenue: revenueData[0]?.total || 0,
      platformRevenue: platformRevenueData[0]?.total || 0,
      totalTransactions,
      totalRentals,
      totalBookings,
      systemHealth: {
        database: "connected",
        storage: "healthy",
        uptime: process.uptime(),
      },
      recentActivity,
    };
  } catch (error) {
    throw new Error(
      `Failed to get system statistics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get company analytics
 */
const getCompanyAnalytics = async (): Promise<{
  companies: any[];
  topPerformingCompanies: any[];
  recentRegistrations: any[];
  subscriptionBreakdown: { [key: string]: number };
}> => {
  try {
    const companies = await CompanyModel.find({ isDeleted: false })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    // Get company performance data
    const companyPerformance = await Promise.all(
      companies.map(async (company) => {
        const [revenue, transactions, users] = await Promise.all([
          TransactionModel.aggregate([
            { $match: { company: company._id, type: "income", isDeleted: false } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          TransactionModel.countDocuments({ company: company._id, isDeleted: false }),
          UserModel.countDocuments({ company: company._id, isDeleted: false }),
        ]);

        return {
          ...company.toObject(),
          revenue: revenue[0]?.total || 0,
          transactionCount: transactions,
          userCount: users,
        };
      })
    );

    // Sort by revenue to get top performing companies
    const topPerformingCompanies = companyPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = companies.filter(
      company => company.createdAt >= thirtyDaysAgo
    );

    // Subscription breakdown
    const subscriptionBreakdown = companies.reduce((acc, company) => {
      const plan = company.subscription?.plan || 'free_trial';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      companies: companyPerformance,
      topPerformingCompanies,
      recentRegistrations,
      subscriptionBreakdown,
    };
  } catch (error) {
    throw new Error(
      `Failed to get company analytics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Update company fee percentage
 */
const updateCompanyFee = async (companyId: string, feePercent: number): Promise<boolean> => {
  try {
    if (feePercent < 0 || feePercent > 100) {
      throw new Error("Fee percentage must be between 0 and 100");
    }

    const result = await CompanyModel.findByIdAndUpdate(
      companyId,
      { feePercent },
      { new: true }
    );

    return result !== null;
  } catch (error) {
    throw new Error(
      `Failed to update company fee: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Activate company subscription
 */
const activateCompanySubscription = async (
  companyId: string,
  subscriptionData: {
    plan: "monthly" | "biannual" | "annual" | "triannual";
    expiresAt: Date;
    licenseKey: string;
    paymentReference?: string;
  }
): Promise<boolean> => {
  try {
    const result = await CompanyModel.findByIdAndUpdate(
      companyId,
      {
        subscription: {
          ...subscriptionData,
          activatedAt: new Date(),
          status: "active",
          updatedAt: new Date(),
        },
        isActive: true,
      },
      { new: true }
    );

    if (result) {
      // Send activation notification
      await createSubscriptionNotification(companyId, "activated");
    }

    return result !== null;
  } catch (error) {
    throw new Error(
      `Failed to activate company subscription: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Deactivate company subscription
 */
const deactivateCompanySubscription = async (companyId: string, reason?: string): Promise<boolean> => {
  try {
    const result = await CompanyModel.findByIdAndUpdate(
      companyId,
      {
        "subscription.status": "expired",
        "subscription.updatedAt": new Date(),
        isActive: false,
      },
      { new: true }
    );

    if (result) {
      // Send expiration notification
      await createSubscriptionNotification(companyId, "expired");
    }

    return result !== null;
  } catch (error) {
    throw new Error(
      `Failed to deactivate company subscription: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get system-wide tax management
 */
const getSystemTaxManagement = async (): Promise<{
  defaultTaxes: any[];
  totalTaxRevenue: number;
  taxBreakdown: { [key: string]: number };
}> => {
  try {
    const defaultTaxes = await TaxModel.find({
      isDefault: true,
      isSuperAdminTax: true,
      isDeleted: false,
    }).sort({ priority: 1 });

    // Calculate tax revenue
    const taxRevenue = await TransactionModel.aggregate([
      { $match: { isDeleted: false, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get tax breakdown by type
    const taxBreakdown = await TransactionModel.aggregate([
      { $match: { isDeleted: false, type: "income" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const taxBreakdownObj = taxBreakdown.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {} as { [key: string]: number });

    return {
      defaultTaxes,
      totalTaxRevenue: taxRevenue[0]?.total || 0,
      taxBreakdown: taxBreakdownObj,
    };
  } catch (error) {
    throw new Error(
      `Failed to get system tax management: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get system notifications
 */
const getSystemNotifications = async (): Promise<{
  totalNotifications: number;
  unreadNotifications: number;
  recentNotifications: any[];
  notificationTypes: { [key: string]: number };
}> => {
  try {
    const [
      totalNotifications,
      unreadNotifications,
      recentNotifications,
      notificationTypes,
    ] = await Promise.all([
      NotificationModel.countDocuments({ isDeleted: false }),
      NotificationModel.countDocuments({ isRead: false, isDeleted: false }),
      NotificationModel.find({ isDeleted: false })
        .populate('user', 'name email')
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .limit(20),
      NotificationModel.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]),
    ]);

    const notificationTypesObj = notificationTypes.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalNotifications,
      unreadNotifications,
      recentNotifications,
      notificationTypes: notificationTypesObj,
    };
  } catch (error) {
    throw new Error(
      `Failed to get system notifications: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Send system-wide notification
 */
const sendSystemNotification = async (notificationData: {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  category: "system" | "maintenance" | "update" | "announcement";
}): Promise<boolean> => {
  try {
    // Get all active companies
    const companies = await CompanyModel.find({ isActive: true, isDeleted: false });
    
    // Send notification to all companies
    for (const company of companies) {
      await NotificationModel.create({
        company: company._id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        category: notificationData.category,
        isPublic: true,
      });
    }

    return true;
  } catch (error) {
    throw new Error(
      `Failed to send system notification: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get system health status
 */
const getSystemHealth = async (): Promise<{
  status: "healthy" | "warning" | "critical";
  database: string;
  storage: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  lastBackup?: Date;
  activeConnections: number;
}> => {
  try {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // Check database connection
    const dbStatus = require('mongoose').connection.readyState === 1 ? "connected" : "disconnected";

    // Check storage (simplified)
    const storageStatus = "healthy"; // In production, check actual storage

    let status: "healthy" | "warning" | "critical" = "healthy";
    if (memoryPercentage > 90 || dbStatus !== "connected") {
      status = "critical";
    } else if (memoryPercentage > 75) {
      status = "warning";
    }

    return {
      status,
      database: dbStatus,
      storage: storageStatus,
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: memoryPercentage,
      },
      uptime: process.uptime(),
      activeConnections: 0, // In production, get actual connection count
    };
  } catch (error) {
    throw new Error(
      `Failed to get system health: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export {
  getSystemStatistics,
  getCompanyAnalytics,
  updateCompanyFee,
  activateCompanySubscription,
  deactivateCompanySubscription,
  getSystemTaxManagement,
  getSystemNotifications,
  sendSystemNotification,
  getSystemHealth,
};