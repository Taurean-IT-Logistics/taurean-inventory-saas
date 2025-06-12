import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { sendSuccess, sendError, sendNotFound, sendConflict } from "../utils";

// Create a new user
const createUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.email || !data.name || !data.password) {
      return sendError(
        res,
        "Email, name, and password are required",
        null,
        400
      );
    }
    const user = await UserService.createUser(req.body);
    return sendSuccess(res, "User created successfully", user, 201);
  } catch (error: any) {
    if (error.code === 11000) {
      // Handle duplicate email/username
      return sendConflict(res, "Email or username already exists");
    }
    return sendError(res, "Failed to create user", error.message);
  }
};

// Get all users
const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    return sendSuccess(res, "Users fetched successfully", users);
  } catch (error: any) {
    return sendError(res, "Failed to fetch users", error.message);
  }
};

// Get a user by ID
const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) return sendNotFound(res, "User not found");
    return sendSuccess(res, "User found", user);
  } catch (error: any) {
    return sendError(res, "Failed to fetch user", error.message);
  }
};

// Get a user by email or username
const getUserByIdentifier = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserByIdentifier(req.params.identifier);
    if (!user) return sendNotFound(res, "User not found");
    return sendSuccess(res, "User found", user);
  } catch (error: any) {
    return sendError(res, "Failed to fetch user", error.message);
  }
};

// Update user
const updateUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (data.role && ["admin", "superadmin"].includes(data.role)) {
      if (!req.user || !req.user.role || req.user.role !== "superadmin") {
        return sendError(
          res,
          "You do not have permission to change roles",
          403
        );
      }
    }
    const user = await UserService.updateUser(req.params.id, data);
    if (!user) return sendNotFound(res, "User not found");
    return sendSuccess(res, "User updated successfully", user);
  } catch (error: any) {
    return sendError(res, "Failed to update user", error.message);
  }
};

// Soft delete user
const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (!user) return sendNotFound(res, "User not found");
    return sendSuccess(res, "User deleted successfully", user);
  } catch (error: any) {
    return sendError(res, "Failed to delete user", error.message);
  }
};

export {
  createUser,
  getAllUsers,
  getUserById,
  getUserByIdentifier,
  updateUser,
  deleteUser,
};
