import * as bcrypt from "bcrypt";
import { CONFIG } from "../config";

/**
 * Generates a hashed password using bcrypt.
 * @param password - The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */

const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, CONFIG.SALT_ROUNDS);
  } catch (error: any) {
    return error.message;
  }
};

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password to compare.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves to a boolean indicating if the passwords match.
 */

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error: any) {
    return false;
  }
};

export { hashPassword, comparePassword };
