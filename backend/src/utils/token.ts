import crypto from "crypto";

/**
 * Generate a random token of specified length
 * @param length - The length of the token to generate
 * @returns A random string token
 */
export function generateToken(length: number): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate a secure random string for verification tokens
 * @param length - The length of the token to generate
 * @returns A random string token
 */
export function generateSecureToken(length: number): string {
  return crypto.randomBytes(length).toString("base64url");
}

/**
 * Generate a short numeric token (e.g., for SMS verification)
 * @param length - The length of the numeric token
 * @returns A random numeric string
 */
export function generateNumericToken(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}