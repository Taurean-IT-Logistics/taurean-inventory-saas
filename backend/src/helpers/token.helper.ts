import jwt from "jsonwebtoken";
import { CONFIG } from "../config";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generate access token
 */
export function generateAuthToken(payload: TokenPayload): string {
  if (!CONFIG.ACCESS_TOKEN_SECRET || !CONFIG.JWT_EXPIRATION) {
    throw new Error("ACCESS_TOKEN_SECRET or JWT_EXPIRATION is not defined");
  }

  return jwt.sign(payload, CONFIG.ACCESS_TOKEN_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRATION as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  if (!CONFIG.REFRESH_TOKEN_SECRET || !CONFIG.JWT_REFRESH_EXPIRATION) {
    throw new Error(
      "REFRESH_TOKEN_SECRET or JWT_REFRESH_EXPIRATION is not defined"
    );
  }

  return jwt.sign(payload, CONFIG.REFRESH_TOKEN_SECRET, {
    expiresIn: CONFIG.JWT_REFRESH_EXPIRATION as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Verify access token
 */
export function verifyToken(token: string): TokenPayload {
  if (!CONFIG.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  return jwt.verify(token, CONFIG.ACCESS_TOKEN_SECRET) as TokenPayload;
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  if (!CONFIG.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }

  return jwt.verify(token, CONFIG.REFRESH_TOKEN_SECRET) as TokenPayload;
}
