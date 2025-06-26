import jwt from "jsonwebtoken";
import { CONFIG } from "../config";
import { TokenModel, TokenDocument } from "../models/token.model";

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

/**
 * Generate email verification token
 */
export function generateEmailToken(payload: TokenPayload): string {
  if (!CONFIG.EMAIL_TOKEN_SECRET || !CONFIG.EMAIL_TOKEN_EXPIRATION) {
    throw new Error(
      "EMAIL_TOKEN_SECRET or EMAIL_TOKEN_EXPIRATION is not defined"
    );
  }

  return jwt.sign(payload, CONFIG.EMAIL_TOKEN_SECRET, {
    expiresIn: CONFIG.EMAIL_TOKEN_EXPIRATION as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Verify email verification token
 */
export function verifyEmailToken(token: string): TokenPayload {
  if (!CONFIG.EMAIL_TOKEN_SECRET) {
    throw new Error("EMAIL_TOKEN_SECRET is not defined");
  }

  return jwt.verify(token, CONFIG.EMAIL_TOKEN_SECRET) as TokenPayload;
}

/**
 * Generate password reset token
 */
export function generatePasswordToken(payload: TokenPayload): string {
  if (!CONFIG.PASSWORD_TOKEN_SECRET || !CONFIG.PASSWORD_TOKEN_EXPIRATION) {
    throw new Error(
      "PASSWORD_TOKEN_SECRET or PASSWORD_TOKEN_EXPIRATION is not defined"
    );
  }

  return jwt.sign(payload, CONFIG.PASSWORD_TOKEN_SECRET, {
    expiresIn: CONFIG.PASSWORD_TOKEN_EXPIRATION as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Verify password reset token
 */
export function verifyPasswordToken(token: string): TokenPayload {
  if (!CONFIG.PASSWORD_TOKEN_SECRET) {
    throw new Error("PASSWORD_TOKEN_SECRET is not defined");
  }

  return jwt.verify(token, CONFIG.PASSWORD_TOKEN_SECRET) as TokenPayload;
}

export async function updateUserToken(data: TokenDocument) {
  try {
    const tokenDoc = await TokenModel.findOne({ user: data.user });
    if (tokenDoc) {
      tokenDoc.accessToken = data.accessToken;
      tokenDoc.refreshToken = data.refreshToken;
      tokenDoc.passwordResetToken = data.passwordResetToken;
      tokenDoc.emailVerificationToken = data.emailVerificationToken;
      await tokenDoc.save();
    } else {
      const newTokenDoc = new TokenModel(data);
      await newTokenDoc.save();
    }
  } catch (error) {
    console.error("Error updating user token:", error);
  }
}

export async function invalidateToken(user: any, tokenName: string) {
  try {
    await TokenModel.updateOne({ user }, { $unset: { [tokenName]: "" } });
  } catch (error) {
    console.error("Error invalidating token:", error);
  }
}
