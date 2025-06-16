import { UserModel, UserDocument } from "../models";
import { hashPassword } from "../helpers/password.helper";
import { User } from "../types";
import mongoose from "mongoose";

/**
 * Create a new user
 */
export async function createUser(userData: User): Promise<UserDocument> {
  try {
    // Check if user already exists by email or username
    const existingUser = await UserModel.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    }).exec();

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password before saving
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }

    if (!userData.role) {
      userData.role = "user";
    }

    const user = new UserModel(userData);
    return await user.save();
  } catch (error) {
    throw new Error("Error creating user: " + (error as Error).message);
  }
}

/**
 * Get all users (not deleted)
 */
export async function getAllUsers(): Promise<UserDocument[]> {
  return await UserModel.find({ isDeleted: false }).exec();
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserDocument | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  return await UserModel.findOne({ _id: id, isDeleted: false }).exec();
}

/**
 * Get user by username or email
 */
export async function getUserByIdentifier(
  identifier: string
): Promise<UserDocument | null> {
  if (!identifier) {
    throw new Error("Identifier is required");
  }
  return await UserModel.findOne({
    $or: [{ email: identifier }, { username: identifier }],
    isDeleted: false,
  }).exec();
}

/**
 * Update user (excluding password here)
 */
export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<UserDocument | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  if (updates.password) {
    updates.password = await hashPassword(updates.password);
  }

  return await UserModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updates,
    { new: true }
  ).exec();
}

/**
 * Soft delete user
 */
export async function deleteUser(id: string): Promise<UserDocument | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  return await UserModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true }
  ).exec();
}
