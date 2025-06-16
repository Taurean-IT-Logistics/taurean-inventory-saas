import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { sendSuccess, sendError, sendNotFound, sendConflict } from "../utils";

// Create a new user
const createUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.email || !data.name || !data.password) {
      sendError(res, "Email, name, and password are required", null, 400);
    }

    if (data.role) {
      if (!["admin", "superadmin", "user"].includes(data.role)) {
        data.role = "user";
      }
    }
    const user = await UserService.createUser(req.body);
    sendSuccess(res, "User created successfully", user, 201);
  } catch (error: any) {
    if (error.code === 11000) {
      // Handle duplicate email/username
      sendConflict(res, "Email or username already exists");
    }
    sendError(res, "Failed to create user", error.message);
  }
};

// Get all users
const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserService.getAllUsers();
    sendSuccess(res, "Users fetched successfully", users);
  } catch (error: any) {
    sendError(res, "Failed to fetch users", error.message);
  }
};

// Get a user by ID
const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) sendNotFound(res, "User not found");
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
    if (!user) sendNotFound(res, "User not found");
    sendSuccess(res, "User found", user);
  } catch (error: any) {
    sendError(res, "Failed to fetch user", error.message);
  }
};

// Update user
const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    if (data.role && ["admin", "superadmin"].includes(data.role)) {
      if (!req.user || !req.user.role || req.user.role !== "superadmin") {
        sendError(res, "You do not have permission to change roles", 403);
      }
    }

    if (req.user?.role == "user" && req.user.id !== req.params.id) {
      sendError(res, "You do not have permission to update this user", 403);
      return;
    }

    const user = await UserService.updateUser(req.params.id, data);
    if (!user) sendNotFound(res, "User not found");
    sendSuccess(res, "User updated successfully", user);
  } catch (error: any) {
    sendError(res, "Failed to update user", error.message);
  }
};

// Soft delete user
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (!user) sendNotFound(res, "User not found");
    sendSuccess(res, "User deleted successfully", user);
  } catch (error: any) {
    sendError(res, "Failed to delete user", error.message);
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
