import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { CompanyJoinRequestModel } from "../models/companyJoinRequest.model";
import { FacilityModel } from "../models/facility.model";
import { BookingModel } from "../models/booking.model";
import { TransactionModel } from "../models/transaction.model";
import { TaxModel } from "../models/tax.model";
import { RentalModel } from "../models/rental.model";
import { NotificationModel } from "../models/notification.model";
import { generateLicenseKey } from "./subscription.service";
import { createSubscriptionNotification } from "./notification.service";

export class SuperAdminService {
  // Get all companies with statistics
  static async getAllCompanies() {
    try {
      const companies = await CompanyModel.find()
        .populate("subscription", "plan status expiresAt")
        .populate("owner", "name email username")
        .sort({ createdAt: -1 });

      // Get statistics for each company
      const companiesWithStats = await Promise.all(
        companies.map(async (company) => {
          const userCount = await UserModel.countDocuments({
            company: company._id,
            isDeleted: false,
          });

          const facilityCount = await FacilityModel.countDocuments({
            company: company._id,
            isDeleted: false,
          });

          const bookingCount = await BookingModel.countDocuments({
            company: company._id,
            isDeleted: false,
          });

          const transactionCount = await TransactionModel.countDocuments({
            company: company._id,
            isDeleted: false,
          });

          return {
            ...company.toObject(),
            stats: {
              userCount,
              facilityCount,
              bookingCount,
              transactionCount,
            },
          };
        })
      );

      return companiesWithStats;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update company status
  static async updateCompanyStatus(companyId: string, status: string) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      // Update subscription status
      if (company.subscription) {
        company.subscription.status = status as
          | "active"
          | "expired"
          | "cancelled";
        await company.save();
      } else {
        // Create subscription if it doesn't exist
        company.subscription = {
          plan: "monthly",
          status: status as "active" | "expired" | "cancelled",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          licenseKey: `LIC-${Date.now()}`,
        };
        await company.save();
      }

      return company;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get company details with full statistics
  static async getCompanyDetails(companyId: string) {
    try {
      const company = await CompanyModel.findById(companyId)
        .populate("subscription", "plan status expiresAt")
        .populate("owner", "name email username");

      if (!company) {
        throw new Error("Company not found");
      }

      const users = await UserModel.find({
        company: companyId,
        isDeleted: false,
      }).select("name email username role createdAt lastLoginAt");

      const facilities = await FacilityModel.find({
        company: companyId,
        isDeleted: false,
      }).select("name status location createdAt");

      const recentBookings = await BookingModel.find({
        company: companyId,
        isDeleted: false,
      })
        .populate("user", "name email")
        .populate("facility", "name")
        .sort({ createdAt: -1 })
        .limit(10);

      const recentTransactions = await TransactionModel.find({
        company: companyId,
        isDeleted: false,
      })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(10);

      const taxes = await TaxModel.find({
        company: companyId,
        isDeleted: false,
      }).select("name rate type active");

      return {
        company,
        users,
        facilities,
        recentBookings,
        recentTransactions,
        taxes,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Activate company subscription
  static async activateCompanySubscription(
    companyId: string,
    plan: "monthly" | "biannual" | "annual" | "triannual",
    duration: number
  ) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);

      const licenseKey = generateLicenseKey(companyId);

      company.subscription = {
        plan,
        expiresAt,
        licenseKey: licenseKey,
        status: "active",
        activatedAt: new Date(),
        updatedAt: new Date(),
      };
      company.isActive = true;

      await company.save();

      // Send activation notification
      await createSubscriptionNotification(companyId, "activated");

      return company;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Deactivate company subscription
  static async deactivateCompanySubscription(
    companyId: string,
    reason?: string
  ) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      // Update subscription status instead of removing entirely
      if (company.subscription) {
        company.subscription.status = "expired";
        company.subscription.updatedAt = new Date();
      }
      company.isActive = false;

      await company.save();

      // Send expiration notification
      await createSubscriptionNotification(companyId, "expired");

      return company;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get all users (excluding super admins for security)
  static async getAllUsers() {
    try {
      const users = await UserModel.find({
        isSuperAdmin: { $ne: true },
      })
        .select("-password")
        .populate("company", "name")
        .populate("companyRole", "name permissions")
        .sort({ createdAt: -1 })
        .lean();

      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get unassigned users (no company)
  static async getUnassignedUsers() {
    try {
      const users = await UserModel.find({
        company: { $exists: false },
        isDeleted: false,
        role: { $ne: "superAdmin" },
      }).sort({ createdAt: -1 });

      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update user role globally
  static async updateUserRole(
    userId: string,
    role: "admin" | "staff" | "user"
  ) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Prevent changing Taurean IT super admin roles
      if (user.isSuperAdmin && role !== "admin") {
        throw new Error("Cannot change role of Taurean IT super admin");
      }

      // Update user role
      user.role = role;
      await user.save();

      return user;
    } catch (error: any) {
      throw new Error("Failed to update user role: " + error.message);
    }
  }

  // Assign user to company
  static async assignUserToCompany(userId: string, companyId: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.company) {
        throw new Error("User is already assigned to a company");
      }

      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      user.company = companyId;
      user.role = "user"; // Default role
      await user.save();

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Remove user from company
  static async removeUserFromCompany(userId: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.company) {
        throw new Error("User is not assigned to any company");
      }

      user.company = undefined;
      user.companyRole = undefined;
      user.role = "user";
      await user.save();

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get system statistics
  static async getSystemStatistics() {
    try {
      const totalCompanies = await CompanyModel.countDocuments();
      const activeCompanies = await CompanyModel.countDocuments({
        isActive: true,
      });

      const totalUsers = await UserModel.countDocuments({ isDeleted: false });
      const unassignedUsers = await UserModel.countDocuments({
        company: { $exists: false },
        isDeleted: false,
        role: { $ne: "superAdmin" },
      });

      const totalFacilities = await FacilityModel.countDocuments({
        isDeleted: false,
      });
      const totalBookings = await BookingModel.countDocuments({
        isDeleted: false,
      });
      const totalTransactions = await TransactionModel.countDocuments({
        isDeleted: false,
      });

      const pendingJoinRequests = await CompanyJoinRequestModel.countDocuments({
        status: "pending",
      });

      return {
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          inactive: totalCompanies - activeCompanies,
        },
        users: {
          total: totalUsers,
          assigned: totalUsers - unassignedUsers,
          unassigned: unassignedUsers,
        },
        facilities: totalFacilities,
        bookings: totalBookings,
        transactions: totalTransactions,
        pendingJoinRequests,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get recent activity across all companies
  static async getRecentActivity(limit: number = 20) {
    try {
      const recentBookings = await BookingModel.find({ isDeleted: false })
        .populate("user", "name email")
        .populate("facility", "name")
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .limit(limit);

      const recentTransactions = await TransactionModel.find({
        isDeleted: false,
      })
        .populate("user", "name email")
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .limit(limit);

      const recentUsers = await UserModel.find({ isDeleted: false })
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .limit(limit);

      return {
        recentBookings,
        recentTransactions,
        recentUsers,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Search across all companies
  static async searchAllCompanies(query: string) {
    try {
      const companies = await CompanyModel.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      })
        .populate("owner", "name email")
        .populate("subscription", "plan status")
        .limit(10);

      return companies;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Search across all users
  static async searchAllUsers(query: string) {
    try {
      const users = await UserModel.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { username: { $regex: query, $options: "i" } },
        ],
        isDeleted: false,
      })
        .populate("company", "name")
        .limit(10);

      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Enhanced system statistics with revenue data
  static async getEnhancedSystemStatistics() {
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
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        TransactionModel.aggregate([
          { $match: { isDeleted: false, isPlatformRevenue: true } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        TransactionModel.countDocuments({ isDeleted: false }),
        RentalModel.countDocuments({ isDeleted: false }),
        BookingModel.countDocuments({ isDeleted: false }),
      ]);

      // Get recent activity
      const recentActivity = await TransactionModel.find({ isDeleted: false })
        .populate("user", "name email")
        .populate("company", "name")
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
        `Failed to get enhanced system statistics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get company analytics with performance data
  static async getCompanyAnalytics() {
    try {
      const companies = await CompanyModel.find({ isDeleted: false })
        .populate("owner", "name email")
        .sort({ createdAt: -1 });

      // Get company performance data
      const companyPerformance = await Promise.all(
        companies.map(async (company) => {
          const [revenue, transactions, users] = await Promise.all([
            TransactionModel.aggregate([
              {
                $match: {
                  company: company._id,
                  type: "income",
                  isDeleted: false,
                },
              },
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            TransactionModel.countDocuments({
              company: company._id,
              isDeleted: false,
            }),
            UserModel.countDocuments({
              company: company._id,
              isDeleted: false,
            }),
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
        (company) => company.createdAt >= thirtyDaysAgo
      );

      // Subscription breakdown
      const subscriptionBreakdown = companies.reduce(
        (acc, company) => {
          const plan = company.subscription?.plan || "free_trial";
          acc[plan] = (acc[plan] || 0) + 1;
          return acc;
        },
        {} as { [key: string]: number }
      );

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
  }

  // Update company fee percentage
  static async updateCompanyFee(companyId: string, feePercent: number) {
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
  }

  // Get system-wide tax management
  static async getSystemTaxManagement() {
    try {
      const defaultTaxes = await TaxModel.find({
        isDefault: true,
        isSuperAdminTax: true,
        isDeleted: false,
      }).sort({ priority: 1 });

      // Calculate tax revenue
      const taxRevenue = await TransactionModel.aggregate([
        { $match: { isDeleted: false, type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      // Get tax breakdown by type
      const taxBreakdown = await TransactionModel.aggregate([
        { $match: { isDeleted: false, type: "income" } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
          },
        },
      ]);

      const taxBreakdownObj = taxBreakdown.reduce(
        (acc, item) => {
          acc[item._id] = item.total;
          return acc;
        },
        {} as { [key: string]: number }
      );

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
  }

  // Get system notifications
  static async getSystemNotifications() {
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
          .populate("user", "name email")
          .populate("company", "name")
          .sort({ createdAt: -1 })
          .limit(20),
        NotificationModel.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
      ]);

      const notificationTypesObj = notificationTypes.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as { [key: string]: number }
      );

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
  }

  // Send system-wide notification
  static async sendSystemNotification(notificationData: {
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
    category: "system" | "maintenance" | "update" | "announcement";
  }) {
    try {
      // Get all active companies
      const companies = await CompanyModel.find({
        isActive: true,
        isDeleted: false,
      });

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
  }

  // Get system health status
  static async getSystemHealth() {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = require("os").totalmem();
      const usedMemory = memoryUsage.heapUsed;
      const memoryPercentage = (usedMemory / totalMemory) * 100;

      // Check database connection
      const dbStatus =
        require("mongoose").connection.readyState === 1
          ? "connected"
          : "disconnected";

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
  }
}
