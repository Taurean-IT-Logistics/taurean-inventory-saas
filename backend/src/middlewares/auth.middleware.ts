import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers";
import { sendUnauthorized } from "../utils";

export function AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendUnauthorized(res, "No token provided");
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    sendUnauthorized(res, "Invalid or expired token");
  }
}

export function AuthorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendUnauthorized(res, `Access requires one of: ${roles.join(", ")}`);
      return;
    }

    next();
  };
}
