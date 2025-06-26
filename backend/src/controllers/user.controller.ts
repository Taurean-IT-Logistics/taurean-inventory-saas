import { Request, Response } from "express";
import { UserService } from "../services";
import { sendSuccess, sendError, sendNotFound, sendConflict } from "../utils";

// Create a new user
const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    if (!data.email || !data.name || !data.password) {
      sendError(res, "Email, name, and password are required", null, 400);
      return;
    }

    if (data.role) {
      if (!["admin", "staff", "user"].includes(data.role)) {
        data.role = "user";
      }
    }

    const user = await UserService.createUser(data);
    sendSuccess(res, "User created successfully", user, 201);
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      sendConflict(res, "Email or username already exists");
      return;
    }
    sendError(res, "Failed to create user", error.message);
  }
};

// Get all users with pagination and filtering
const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      role,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      role: role as string,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    };

    const result = await UserService.getAllUsers(options);
    sendSuccess(res, "Users fetched successfully", result);
  } catch (error: any) {
    sendError(res, "Failed to fetch users", error.message);
  }
};

// Get a user by ID
const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeAnalytics } = req.query;
    const user = await UserService.getUserById(
      req.params.id,
      includeAnalytics === "true"
    );

    if (!user) {
      sendNotFound(res, "User not found");
      return;
    }

    sendSuccess(res, "User found", user);
  } catch (error: any) {
    sendError(res, "Failed to fetch user", error.message);
  }
};

// Get a user by email or username
const getUserByIdentifier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await UserService.getUserByIdentifier(req.params.identifier);

    if (!user) {
      sendNotFound(res, "User not found");
      return;
    }

    sendSuccess(res, "User found", user);
  } catch (error: any) {
    sendError(res, "Failed to fetch user", error.message);
  }
};

// Update user
const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    // Check if user is trying to update role to admin/staff
    if (data.role && ["admin", "staff"].includes(data.role)) {
      if (!req.user || !req.user.role || req.user.role !== "admin") {
        sendError(res, "You do not have permission to change roles", null, 403);
        return;
      }
    }

    // Check if regular user is trying to update another user
    if (req.user?.role === "user" && req.user.id !== req.params.id) {
      sendError(
        res,
        "You do not have permission to update this user",
        null,
        403
      );
      return;
    }

    const user = await UserService.updateUser(req.params.id, data);

    if (!user) {
      sendNotFound(res, "User not found");
      return;
    }

    sendSuccess(res, "User updated successfully", user);
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      sendConflict(res, "Email or username already exists");
      return;
    }
    sendError(res, "Failed to update user", error.message);
  }
};

// Update user role (admin only)
const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      sendError(
        res,
        "You do not have permission to update user roles",
        null,
        403
      );
      return;
    }

    if (!role || !["user", "staff", "admin"].includes(role)) {
      sendError(res, "Valid role is required (user, staff, admin)", null, 400);
      return;
    }

    const user = await UserService.updateUserRole(id, role, req.user.id);

    if (!user) {
      sendNotFound(res, "User not found");
      return;
    }

    sendSuccess(res, "User role updated successfully", user);
  } catch (error: any) {
    sendError(res, "Failed to update user role", error.message);
  }
};

// Soft delete user
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check permissions - only admin can delete users or users can delete themselves
    if (req.user?.role !== "admin" && req.user?.id !== req.params.id) {
      sendError(
        res,
        "You do not have permission to delete this user",
        null,
        403
      );
      return;
    }

    const user = await UserService.deleteUser(req.params.id);

    if (!user) {
      sendNotFound(res, "User not found");
      return;
    }

    sendSuccess(res, "User deleted successfully", user);
  } catch (error: any) {
    sendError(res, "Failed to delete user", error.message);
  }
};

// Get user statistics (admin only)
const getUserStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      sendError(
        res,
        "You do not have permission to view user statistics",
        null,
        403
      );
      return;
    }

    const statistics = await UserService.getUserStatistics();
    sendSuccess(res, "User statistics fetched successfully", statistics);
  } catch (error: any) {
    sendError(res, "Failed to fetch user statistics", error.message);
  }
};

// Search users with advanced filters
const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      role,
      loyaltyTier,
      minSpent,
      maxSpent,
      isHighValue,
      churnRisk,
      page = "1",
      limit = "10",
    } = req.query;

    const criteria = {
      search: search as string,
      role: role as string,
      loyaltyTier: loyaltyTier as string,
      minSpent: minSpent ? parseFloat(minSpent as string) : undefined,
      maxSpent: maxSpent ? parseFloat(maxSpent as string) : undefined,
      isHighValue:
        isHighValue === "true"
          ? true
          : isHighValue === "false"
          ? false
          : undefined,
      churnRisk: churnRisk as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await UserService.searchUsers(criteria);
    sendSuccess(res, "Users search completed successfully", result);
  } catch (error: any) {
    sendError(res, "Failed to search users", error.message);
  }
};

// Update user loyalty (internal use - called by booking service)
const updateUserLoyalty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, bookingAmount, facilityId } = req.body;

    if (!userId || !bookingAmount || !facilityId) {
      sendError(
        res,
        "userId, bookingAmount, and facilityId are required",
        null,
        400
      );
      return;
    }

    await UserService.updateUserLoyalty(userId, bookingAmount, facilityId);
    sendSuccess(res, "User loyalty updated successfully");
  } catch (error: any) {
    sendError(res, "Failed to update user loyalty", error.message);
  }
};

export {
  createUser,
  getAllUsers,
  getUserById,
  getUserByIdentifier,
  updateUser,
  updateUserRole,
  deleteUser,
  getUserStatistics,
  searchUsers,
  updateUserLoyalty,
};
