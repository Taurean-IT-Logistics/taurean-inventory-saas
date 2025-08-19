import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { sendSuccess, sendError, sendNotFound, sendConflict } from "../utils";
import { User, TokenPayload } from "../types";
import {
  comparePassword,
  generateAuthToken,
  generateRefreshToken,
  updateUserToken,
  verifyEmailToken,
  verifyRefreshToken,
  invalidateToken,
  generatePasswordToken,
  verifyPasswordToken,
} from "../helpers";
import { Types } from "mongoose";
import { emailService } from "../services/email.service";

// Register new user
const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: User = req.body;

    // Validate required fields
    if (
      !userData.email ||
      !userData.name ||
      !userData.password ||
      !userData.username
    ) {
      sendError(
        res,
        "Email, name, username, and password are required",
        null,
        400
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      typeof userData.email !== "string" ||
      !emailRegex.test(userData.email)
    ) {
      sendError(res, "Please provide a valid email address", null, 400);
      return;
    }

    // Validate password strength (minimum 6 characters)
    if (userData.password.length < 6) {
      sendError(res, "Password must be at least 6 characters long", null, 400);
      return;
    }

    // Set default role for public registration
    userData.role = "user";

    // Create user
    const user = await UserService.createUser(userData);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
      companyId: (user as any).company?.toString?.(),
      isSuperAdmin: (user as any).isSuperAdmin === true,
    };

    const accessToken = await generateAuthToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    await updateUserToken({
      user: user._id,
      accessToken: accessToken,
      refreshToken: refreshToken,
    } as any);

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      loyaltyProfile: user.loyaltyProfile,
      createdAt: user.createdAt,
    };

    // Send welcome email
    try {
      if (user.company) {
        await emailService.sendWelcomeEmail(user._id!.toString(), (user as any).company.toString());
      }
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError);
    }

    sendSuccess(
      res,
      "User registered successfully",
      {
        user: userResponse,
        tokens: { accessToken, refreshToken },
      },
      201
    );
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      sendConflict(res, "User already exists with this email or username");
      return;
    }
    sendError(res, "Registration failed", error.message);
  }
};

// Login user
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      sendError(res, "Email/username and password are required", null, 400);
      return;
    }

    // Find user by email or username (include password for verification)
    const user = await UserService.getUserByIdentifier(identifier, true);

    if (!user) {
      sendError(res, "Invalid credentials", null, 401);
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      sendError(res, "Invalid credentials", null, 401);
      return;
    }

    // Check if user account is active
    if (user.isDeleted) {
      sendError(res, "Account has been deactivated", null, 401);
      return;
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
      companyId: (user as any).company?.toString?.(),
      isSuperAdmin: (user as any).isSuperAdmin === true,
    };

    const accessToken = await generateAuthToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    await updateUserToken({
      user: user._id,
      accessToken: accessToken,
      refreshToken: refreshToken,
    } as any);

    const userResponse = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      cart: user.cart,
      loyaltyProfile: user.loyaltyProfile,
      createdAt: user.createdAt,
    };

    sendSuccess(res, "Login successful", {
      user: userResponse,
      tokens: { accessToken, refreshToken },
    });
  } catch (error: any) {
    sendError(res, "Login failed", error.message);
  }
};

// Refresh access token
const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendError(res, "Refresh token is required", null, 400);
      return;
    }

    // Verify and decode refresh token
    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      sendError(res, "Invalid or expired refresh token", null, 401);
      return;
    }

    // Check if user still exists and is active
    const user = await UserService.getUserById(decoded.id);

    if (!user || user.isDeleted) {
      sendError(res, "User not found or account deactivated", null, 401);
      return;
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
      companyId: (user as any).company?.toString?.(),
      isSuperAdmin: (user as any).isSuperAdmin === true,
    };

    const accessToken = await generateAuthToken(tokenPayload);
    const newRefreshToken = await generateRefreshToken(tokenPayload);

    await updateUserToken({
      user: user._id,
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    } as any);

    sendSuccess(res, "Token refreshed successfully", {
      tokens: { accessToken: accessToken, refreshToken: newRefreshToken },
    });
  } catch (error: any) {
    sendError(res, "Token refresh failed", error.message);
  }
};

// Logout user
const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await invalidateToken(req.user.id, "accessToken");
      await invalidateToken(req.user.id, "refreshToken");
      req.user = undefined;
    }
    sendSuccess(res, "Logout successful");
  } catch (error: any) {
    sendError(res, "Logout failed", error.message);
  }
};

// Get current user profile
const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user; // From auth middleware

    if (!user) {
      sendError(res, "User not found", null, 401);
      return;
    }

    // Get full user details
    const fullUser = await UserService.getUserById(user.id, true);

    if (!fullUser) {
      sendError(res, "User not found", null, 404);
      return;
    }

    // Remove password from response
    const userResponse = {
      id: fullUser._id,
      name: fullUser.name,
      username: fullUser.username,
      email: fullUser.email,
      phone: fullUser.phone,
      role: fullUser.role,
      cart: fullUser.cart,
      loyaltyProfile: fullUser.loyaltyProfile,
      analytics: (fullUser as any).analytics,
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
      isSuperAdmin: (fullUser as any).isSuperAdmin,
      company: (fullUser as any).company,
      companyRole: (fullUser as any).companyRole,
    };

    sendSuccess(res, "Profile retrieved successfully", userResponse);
  } catch (error: any) {
    sendError(res, "Failed to retrieve profile", error.message);
  }
};

// Update current user profile
const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user; // From auth middleware
    const updates = req.body;

    if (!user) {
      sendError(res, "User not found", null, 401);
      return;
    }

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { password, role, loyaltyProfile, ...safeUpdates } = updates;

    // Update user
    const updatedUser = await UserService.updateUser(user.id, safeUpdates);

    if (!updatedUser) {
      sendError(res, "User not found", null, 404);
      return;
    }

    // Remove password from response
    const userResponse = {
      id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      cart: updatedUser.cart,
      loyaltyProfile: updatedUser.loyaltyProfile,
      updatedAt: updatedUser.updatedAt,
      isSuperAdmin: (updatedUser as any).isSuperAdmin,
      company: (updatedUser as any).company,
      companyRole: (updatedUser as any).companyRole,
    };

    sendSuccess(res, "Profile updated successfully", userResponse);
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      sendConflict(res, "Email or username already exists");
      return;
    }
    sendError(res, "Failed to update profile", error.message);
  }
};

// Change password
const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user; // From auth middleware
    const { currentPassword, newPassword } = req.body;

    if (!user) {
      sendError(res, "User not found", null, 401);
      return;
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      sendError(
        res,
        "Current password and new password are required",
        null,
        400
      );
      return;
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      sendError(
        res,
        "New password must be at least 6 characters long",
        null,
        400
      );
      return;
    }

    // Get user with password
    const fullUser = await UserService.getUserByIdentifier(user.email, true);

    if (!fullUser) {
      sendError(res, "User not found", null, 404);
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      fullUser.password
    );
    if (!isCurrentPasswordValid) {
      sendError(res, "Current password is incorrect", null, 400);
      return;
    }

    // Update password
    await UserService.updateUser(user.id, { password: newPassword });

    sendSuccess(res, "Password changed successfully");
  } catch (error: any) {
    sendError(res, "Failed to change password", error.message);
  }
};

// Forgot password (initiate reset)
const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, "Email is required", null, 400);
      return;
    }

    // Check if user exists
    const user = await UserService.getUserByIdentifier(email);

    if (!user) {
      // Don't reveal if email exists or not for security
      sendSuccess(
        res,
        "If the email exists, a password reset link has been sent"
      );
      return;
    }

    // Generate password reset token
    const resetToken = await generatePasswordToken({
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    // Send password reset email (implement email service)
    // await EmailService.sendPasswordResetEmail(user.email, resetToken);

    sendSuccess(res, "Password reset link has been sent to your email");
  } catch (error: any) {
    sendError(res, "Failed to process password reset request", error.message);
  }
};

// Reset password
const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      sendError(res, "Reset token and new password are required", null, 400);
      return;
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      sendError(
        res,
        "New password must be at least 6 characters long",
        null,
        400
      );
      return;
    }

    // Verify reset token and get user ID
    const user = await verifyPasswordToken(token);

    if (!user) {
      sendError(res, "Invalid or expired reset token", null, 400);
      return;
    }

    // Update password
    await UserService.updateUser(user.id, { password: newPassword });

    await invalidateToken(user.id, "passwordResetToken");

    sendSuccess(res, "Password reset successfully");
  } catch (error: any) {
    sendError(res, "Failed to reset password", error.message);
  }
};

// Verify email (if you implement email verification)
const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      sendError(res, "Verification token is required", null, 400);
      return;
    }

    // Verify email token and get user ID
    const userId = await verifyEmailToken(token);

    if (!userId) {
      sendError(res, "Invalid or expired verification token", null, 400);
      return;
    }

    // Update user email verification status
    // await UserService.updateUser(userId, { emailVerified: true });

    sendSuccess(res, "Email verified successfully");
  } catch (error: any) {
    sendError(res, "Email verification failed", error.message);
  }
};

export {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
