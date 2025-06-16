import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import {
  comparePassword,
  generateAuthToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../helpers";
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendNotFound,
} from "../utils";

// Login user
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      sendError(res, "Email/username and password are required", null, 400);
      return;
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();
    const user = await UserService.getUserByIdentifier(normalizedIdentifier);

    if (!user) {
      sendUnauthorized(res, "Invalid credentials");
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      sendUnauthorized(res, "Invalid credentials");
      return;
    }

    const tokenPayload = {
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAuthToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const userResponse = {
      id: user._id!.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    sendSuccess(res, "Login successful", {
      user: userResponse,
      tokens: { accessToken, refreshToken },
    });
  } catch (error: any) {
    sendError(res, "Login failed", error.message);
  }
};

// Register user
const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      sendError(res, "All fields are required", null, 400);
    }

    if (password.length < 6) {
      sendError(res, "Password must be at least 6 characters long", null, 400);
    }

    const user = await UserService.createUser({
      name,
      username,
      email,
      password,
      role: "user",
    });

    const tokenPayload = {
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAuthToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const userResponse = {
      id: user._id!.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    sendSuccess(
      res,
      "Registration successful",
      {
        user: userResponse,
        tokens: { accessToken, refreshToken },
      },
      201
    );
  } catch (error: any) {
    if (error.message.includes("User already exists")) {
      sendError(res, "Email or username already exists", null, 409);
    }
    sendError(res, "Registration failed", error.message);
  }
};

// Refresh token
const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendError(res, "Refresh token is required", null, 400);
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await UserService.getUserById(payload.id);

    if (!user) {
      sendUnauthorized(res, "Invalid refresh token");
      return;
    }

    const tokenPayload = {
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAuthToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    sendSuccess(res, "Token refreshed successfully", {
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error: any) {
    sendUnauthorized(res, "Invalid or expired refresh token");
  }
};

// Get current user profile
const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    const user = await UserService.getUserById(req.user.id);
    if (!user) {
      sendNotFound(res, "User not found");
      return;
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    sendSuccess(res, "Profile fetched successfully", userResponse);
  } catch (error: any) {
    sendError(res, "Failed to fetch profile", error.message);
  }
};

// Update current user profile
const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    const { name, username, email, password } = req.body;
    const updates: any = {};

    if (name) updates.name = name;
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) {
      if (password.length < 6) {
        sendError(
          res,
          "Password must be at least 6 characters long",
          null,
          400
        );
        return;
      }
      updates.password = password;
    }

    const user = await UserService.updateUser(req.user.id, updates);
    if (!user) {
      sendNotFound(res, "User not found");
      return;
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    sendSuccess(res, "Profile updated successfully", userResponse);
  } catch (error: any) {
    sendError(res, "Failed to update profile", error.message);
  }
};

export { login, register, refreshToken, getProfile, updateProfile };
