import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { CompanyJoinRequestModel } from "../models/companyJoinRequest.model";
import { FacilityModel } from "../models/facility.model";
import { BookingModel } from "../models/booking.model";
import { TransactionModel } from "../models/transaction.model";
import { TaxModel } from "../models/tax.model";
import { generateLicenseKey } from "./subscription.service";

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
      };

      await company.save();

      return company;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Deactivate company subscription
  static async deactivateCompanySubscription(companyId: string) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      // Remove subscription entirely when deactivating
      company.subscription = undefined;

      await company.save();

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
}
