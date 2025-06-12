import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers";
import { STATUS_CODES } from "../config";
import { UserModel } from "../models";

/**
 * Middleware to authenticate user using JWT.
 * It checks for the presence of a Bearer token in the Authorization header,
 * verifies the token, and attaches user information to the request object.
 * If authentication fails, it responds with an appropriate error message.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 * @returns A response or calls next() if authentication is successful.
 */

async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: "Authentication token is missing or invalid.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: "Invalid or expired authentication token.",
      });
    }

    const userDoc = await UserModel.findById(decoded.id).populate(
      "id role username email"
    );

    if (!userDoc) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: "User not found.",
      });
    }

    req.user = {
      id: userDoc.id,
      username: userDoc.username,
      email: userDoc.email,
      role: userDoc.role,
    };

    next();
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: `Authentication failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}

function authorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          message: "You do not have permission to access this resource.",
        });
      }
      next();
    } catch (error) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: `Authorization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };
}

export { authenticateUser, authorizeRoles };
