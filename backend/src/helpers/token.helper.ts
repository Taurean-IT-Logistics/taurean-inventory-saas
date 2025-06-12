import * as jwt from "jsonwebtoken";
import { CONFIG } from "../config";
import { TokenPayload } from "../types";

/**
 * Generates a JWT Auth token for a user.
 * @param payload - The payload containing user information.
 * @returns A promise that resolves to the generated JWT token.
 */

async function generateAuthToken(payload: Object): Promise<string> {
  try {
    const token = jwt.sign(
      payload as TokenPayload,
      CONFIG.ACCESS_TOKEN_SECRET!
    );
    return token;
  } catch (error: any) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

/**
 * Generates a JWT Refresh token for a user.
 * @param payload - The payload containing user information.
 * @returns A promise that resolves to the generated JWT refresh token.
 */

async function generateRefreshToken(payload: Object): Promise<string> {
  try {
    const token = jwt.sign(
      payload as TokenPayload,
      CONFIG.REFRESH_TOKEN_SECRET!
    );
    return token;
  } catch (error: any) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param token - The JWT token to verify.
 * @returns A promise that resolves to the decoded payload or null if verification fails.
 */

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const decoded = jwt.verify(
      token,
      CONFIG.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    return decoded;
  } catch (error: any) {
    return null;
  }
}

/**
 * Verifies a JWT refresh token and returns the decoded payload.
 * @param token - The JWT refresh token to verify.
 * @returns A promise that resolves to the decoded payload or null if verification fails.
 */

async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const decoded = jwt.verify(
      token,
      CONFIG.REFRESH_TOKEN_SECRET!
    ) as TokenPayload;
    return decoded;
  } catch (error: any) {
    return null;
  }
}

export {
  generateAuthToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  TokenPayload,
};
