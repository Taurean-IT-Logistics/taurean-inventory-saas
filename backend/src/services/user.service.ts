import { UserModel, UserDocument, CustomerAnalyticsModel } from "../models";
import { hashPassword } from "../helpers/password.helper";
import { User } from "../types";
import mongoose from "mongoose";

/**
 * Create a new user with analytics profile initialization
 */
export async function createUser(userData: User): Promise<UserDocument> {
  try {
    // Check if user already exists by email or username
    const existingUser = await UserModel.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
      isDeleted: false,
    }).exec();

    if (existingUser) {
      throw new Error("User already exists with this email or username");
    }

    // Hash the password before saving
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }

    // Set default role if not provided
    if (!userData.role) {
      userData.role = "user";
    }

    // Initialize loyalty profile for users
    if (userData.role === "user") {
      userData.loyaltyProfile = {
        totalBookings: 0,
        totalSpent: 0,
        preferredFacilities: [],
        loyaltyTier: "bronze",
      };
    }

    const user = new UserModel(userData);
    const savedUser = await user.save();

    // Create analytics profile for regular users
    if (userData.role === "user") {
      await CustomerAnalyticsModel.create([
        {
          user: savedUser._id,
          behaviorPattern: {
            preferredTimeSlots: [],
            preferredDays: [],
            averageBookingDuration: 0,
            preferredFacilities: [],
            bookingFrequency: "occasional",
          },
          financialProfile: {
            totalSpent: 0,
            averageBookingValue: 0,
            creditScore: 50,
          },
          loyaltyMetrics: {
            totalBookings: 0,
            cancellationRate: 0,
            noShowRate: 0,
            loyaltyTier: "bronze",
            pointsEarned: 0,
            pointsRedeemed: 0,
          },
          recommendations: {
            suggestedFacilities: [],
            suggestedTimeSlots: [],
            personalizedOffers: [],
          },
          insights: {
            isHighValueCustomer: false,
            churnRisk: "low",
            lifetimeValue: 0,
          },
        },
      ]);
    }

    return savedUser;
  } catch (error) {
    throw new Error("Error creating user: " + (error as Error).message);
  }
}

/**
 * Get all users with pagination and filtering
 */
export async function getAllUsers(
  options: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
): Promise<{
  users: UserDocument[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}> {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;
    const query: any = { isDeleted: false };

    // Add role filter
    if (role) {
      query.role = role;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Sort configuration
    const sortConfig: any = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select("-password") // Exclude password from results
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .exec(),
      UserModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error: any) {
    throw new Error("Error fetching users: " + error.message);
  }
}

/**
 * Get user by ID with optional analytics data
 */
export async function getUserById(
  id: string,
  includeAnalytics: boolean = false
): Promise<UserDocument | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findOne({ _id: id, isDeleted: false })
      .select("-password")
      .exec();

    if (!user) {
      return null;
    }

    // Optionally include analytics data
    if (includeAnalytics && user.role === "user") {
      const analytics = await CustomerAnalyticsModel.findOne({ user: id })
        .populate("behaviorPattern.preferredFacilities", "name")
        .populate("recommendations.suggestedFacilities", "name")
        .exec();

      // Attach analytics to user object (you might want to create a custom return type)
      (user as any).analytics = analytics;
    }

    return user;
  } catch (error: any) {
    throw new Error("Error fetching user: " + error.message);
  }
}

/**
 * Get user by username or email
 */
export async function getUserByIdentifier(
  identifier: string,
  includePassword: boolean = false
): Promise<UserDocument | null> {
  try {
    if (!identifier) {
      throw new Error("Identifier is required");
    }

    const selectFields = includePassword ? "" : "-password";

    return await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
      isDeleted: false,
    })
      .select(selectFields)
      .exec();
  } catch (error: any) {
    throw new Error("Error fetching user: " + error.message);
  }
}

/**
 * Update user with validation and analytics sync
 */
export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<UserDocument | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    // Remove fields that shouldn't be updated directly
    const { role, ...safeUpdates } = updates;

    // Handle password update separately if provided
    if (safeUpdates.password) {
      safeUpdates.password = await hashPassword(safeUpdates.password);
    }

    // Check for duplicate email/username if being updated
    if (safeUpdates.email || safeUpdates.username) {
      const duplicateQuery: any[] = [];
      if (safeUpdates.email) {
        duplicateQuery.push({ email: safeUpdates.email });
      }
      if (safeUpdates.username) {
        duplicateQuery.push({ username: safeUpdates.username });
      }

      const existingUser = await UserModel.findOne({
        $or: duplicateQuery,
        _id: { $ne: id },
        isDeleted: false,
      }).exec();

      if (existingUser) {
        throw new Error("Email or username already exists");
      }
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      safeUpdates,
      { new: true, runValidators: true }
    )
      .select("-password")
      .exec();

    return updatedUser;
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: "user" | "staff" | "admin",
  updatedBy: string
): Promise<UserDocument | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { role: newRole },
      { new: true, runValidators: true }
    )
      .select("-password")
      .exec();

    if (!user) {
      throw new Error("User not found");
    }

    // Create/remove analytics profile based on role change
    if (newRole === "user") {
      // Ensure analytics profile exists
      const existingAnalytics = await CustomerAnalyticsModel.findOne({
        user: userId,
      });
      if (!existingAnalytics) {
        await CustomerAnalyticsModel.create({
          user: userId,
          behaviorPattern: {
            preferredTimeSlots: [],
            preferredDays: [],
            averageBookingDuration: 0,
            preferredFacilities: [],
            bookingFrequency: "occasional",
          },
          financialProfile: {
            totalSpent: 0,
            averageBookingValue: 0,
            creditScore: 50,
          },
          loyaltyMetrics: {
            totalBookings: 0,
            cancellationRate: 0,
            noShowRate: 0,
            loyaltyTier: "bronze",
            pointsEarned: 0,
            pointsRedeemed: 0,
          },
          recommendations: {
            suggestedFacilities: [],
            suggestedTimeSlots: [],
            personalizedOffers: [],
          },
          insights: {
            isHighValueCustomer: false,
            churnRisk: "low",
            lifetimeValue: 0,
          },
        });
      }
    }

    return user;
  } catch (error: any) {
    throw new Error("Error fetching user: " + error.message);
  }
}

/**
 * Soft delete user and related data
 */
export async function deleteUser(id: string): Promise<UserDocument | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }
    // Soft delete user
    const deletedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    ).exec();

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return deletedUser;
  } catch (error) {
    throw new Error("Error deleting user: " + (error as Error).message);
  }
}

/**
 * Get user statistics for admin dashboard
 */
export async function getUserStatistics(): Promise<{
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  recentSignups: number;
  topCustomers: any[];
}> {
  try {
    const now = new Date();
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const [totalUsers, activeUsers, usersByRole, recentSignups, topCustomers] =
      await Promise.all([
        // Total users (not deleted)
        UserModel.countDocuments({ isDeleted: false }),

        // Active users (users with recent activity - you'd need to define this based on your business logic)
        UserModel.countDocuments({
          isDeleted: false,
          "loyaltyProfile.lastBookingDate": { $gte: lastMonth },
        }),

        // Users by role
        UserModel.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: "$role", count: { $sum: 1 } } },
          { $project: { role: "$_id", count: 1, _id: 0 } },
        ]),

        // Recent signups (last 30 days)
        UserModel.countDocuments({
          isDeleted: false,
          createdAt: { $gte: lastMonth },
        }),

        // Top customers by total spent
        UserModel.find({
          isDeleted: false,
          role: "user",
          "loyaltyProfile.totalSpent": { $gt: 0 },
        })
          .select("name email loyaltyProfile")
          .sort({ "loyaltyProfile.totalSpent": -1 })
          .limit(10)
          .exec(),
      ]);

    // Convert usersByRole array to object
    const roleStats = usersByRole.reduce((acc: any, item: any) => {
      acc[item.role] = item.count;
      return acc;
    }, {});

    return {
      totalUsers,
      activeUsers,
      usersByRole: roleStats,
      recentSignups,
      topCustomers,
    };
  } catch (error: any) {
    throw new Error("Error fetching user statistics: " + error.message);
  }
}

/**
 * Search users with advanced filters
 */
export async function searchUsers(criteria: {
  search?: string;
  role?: string;
  loyaltyTier?: string;
  minSpent?: number;
  maxSpent?: number;
  isHighValue?: boolean;
  churnRisk?: string;
  page?: number;
  limit?: number;
}): Promise<{
  users: any[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const {
      search,
      role,
      loyaltyTier,
      minSpent,
      maxSpent,
      isHighValue,
      churnRisk,
      page = 1,
      limit = 10,
    } = criteria;

    const skip = (page - 1) * limit;
    const matchStage: any = { isDeleted: false };

    // Basic filters
    if (role) matchStage.role = role;
    if (loyaltyTier) matchStage["loyaltyProfile.loyaltyTier"] = loyaltyTier;
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "customeranalytics",
          localField: "_id",
          foreignField: "user",
          as: "analytics",
        },
      },
      { $unwind: { path: "$analytics", preserveNullAndEmptyArrays: true } },
    ];

    // Add analytics-based filters
    const analyticsFilters: any = {};
    if (minSpent !== undefined)
      analyticsFilters["analytics.financialProfile.totalSpent"] = {
        $gte: minSpent,
      };
    if (maxSpent !== undefined) {
      if (analyticsFilters["analytics.financialProfile.totalSpent"]) {
        analyticsFilters["analytics.financialProfile.totalSpent"].$lte =
          maxSpent;
      } else {
        analyticsFilters["analytics.financialProfile.totalSpent"] = {
          $lte: maxSpent,
        };
      }
    }
    if (isHighValue !== undefined)
      analyticsFilters["analytics.insights.isHighValueCustomer"] = isHighValue;
    if (churnRisk) analyticsFilters["analytics.insights.churnRisk"] = churnRisk;

    if (Object.keys(analyticsFilters).length > 0) {
      pipeline.push({ $match: analyticsFilters });
    }

    // Add projection to include only required fields and format output
    pipeline.push({
      $project: {
        name: 1,
        email: 1,
        username: 1,
        phone: 1,
        role: 1,
        loyaltyProfile: 1,
        createdAt: 1,
        analytics: {
          financialProfile: 1,
          loyaltyMetrics: 1,
          insights: 1,
        },
      },
    });

    const [users, totalResults] = await Promise.all([
      UserModel.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]) as Promise<any[]>,
      UserModel.aggregate([...pipeline, { $count: "total" }]) as Promise<
        { total: number }[]
      >,
    ]);

    const total = (totalResults && totalResults[0]?.total) || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages,
    };
  } catch (error: any) {
    throw new Error("Error searching users: " + error.message);
  }
}

/**
 * Update user loyalty profile (called by booking service)
 */
export async function updateUserLoyalty(
  userId: string,
  bookingAmount: number,
  facilityId: string
): Promise<void> {
  try {
    // Update user loyalty profile
    const user = await UserModel.findById(userId);
    if (!user || user.role !== "user") return;

    // Update loyalty profile
    user.loyaltyProfile = user.loyaltyProfile || {
      totalBookings: 0,
      totalSpent: 0,
      preferredFacilities: [],
      loyaltyTier: "bronze",
    };

    user.loyaltyProfile.totalBookings += 1;
    user.loyaltyProfile.totalSpent += bookingAmount;
    user.loyaltyProfile.lastBookingDate = new Date();

    // Add facility to preferred list if not already there
    if (!user.loyaltyProfile.preferredFacilities.includes(facilityId as any)) {
      user.loyaltyProfile.preferredFacilities.push(facilityId as any);
    }

    // Update loyalty tier based on total spent or bookings
    if (user.loyaltyProfile.totalSpent >= 10000) {
      user.loyaltyProfile.loyaltyTier = "platinum";
    } else if (user.loyaltyProfile.totalSpent >= 5000) {
      user.loyaltyProfile.loyaltyTier = "gold";
    } else if (user.loyaltyProfile.totalSpent >= 2000) {
      user.loyaltyProfile.loyaltyTier = "silver";
    }

    await user.save();

    // Update analytics profile
    await CustomerAnalyticsModel.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          "loyaltyMetrics.totalBookings": 1,
          "financialProfile.totalSpent": bookingAmount,
        },
        $set: {
          "loyaltyMetrics.lastBookingDate": new Date(),
          "loyaltyMetrics.loyaltyTier": user.loyaltyProfile.loyaltyTier,
          "financialProfile.averageBookingValue":
            user.loyaltyProfile.totalSpent / user.loyaltyProfile.totalBookings,
        },
        $addToSet: {
          "behaviorPattern.preferredFacilities": facilityId,
        },
      }
    );
  } catch (error: any) {
    throw new Error("Error updating user loyalty: " + error.message);
  }
}
