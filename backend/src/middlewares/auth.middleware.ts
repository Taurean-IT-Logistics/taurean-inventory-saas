import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers";
import { sendUnauthorized, sendError } from "../utils";
import { CompanyModel, CompanyRoleModel, UserModel } from "../models";

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
      const sub = (company as any).subscription;
      if (!sub || !sub.expiresAt || new Date(sub.expiresAt) < new Date()) {
        return sendUnauthorized(res, "Subscription expired or missing");
      }
      return next();
    } catch (e: any) {
      return sendError(res, "Company access check failed", e.message);
    }
  };
}

export function RequirePermissions(required: (keyof any)[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ((req.user as any)?.isSuperAdmin) return next();
      const userId = (req.user as any)?.id;
      if (!userId) return sendUnauthorized(res, "Authentication required");
      const user = await UserModel.findById(userId).select("companyRole").lean();
      if (!user || !(user as any).companyRole) return sendUnauthorized(res, "No company role assigned");
      const role = await CompanyRoleModel.findById((user as any).companyRole).lean();
      if (!role) return sendUnauthorized(res, "Role not found");
      const perms = (role as any).permissions || {};
      const ok = required.every((p) => perms[p] === true);
      if (!ok) return sendUnauthorized(res, "Insufficient permissions");
      return next();
    } catch (e: any) {
      return sendError(res, "Permission check failed", e.message);
    }
  };
}
