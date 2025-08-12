import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers";
import { sendUnauthorized, sendError } from "../utils";
import { CompanyModel } from "../models";

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

    // Super admin bypass
    if ((req.user as any).isSuperAdmin) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      sendUnauthorized(res, `Access requires one of: ${roles.join(", ")}`);
      return;
    }

    next();
  };
}

export function RequireActiveCompany() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ((req.user as any)?.isSuperAdmin) return next();
      const companyId = (req.user as any)?.companyId;
      if (!companyId) return sendUnauthorized(res, "No company assigned");
      const company = await CompanyModel.findById(companyId).lean();
      if (!company || company.isActive !== true) {
        return sendUnauthorized(res, "Company inactive or not found");
      }
      // Subscription enforcement placeholder: check expiration when implemented
      return next();
    } catch (e: any) {
      return sendError(res, "Company access check failed", e.message);
    }
  };
}
