import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers";
import { sendUnauthorized, sendError, sendForbidden } from "../utils";
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

    // For Taurean IT super admins, allow all operations
    if ((req.user as any).isSuperAdmin) {
      return next();
    }

    // For regular company users, check their role
    const userRole = (req.user as any).role;
    if (!roles.includes(userRole)) {
      sendForbidden(res, "Insufficient permissions");
      return;
    }

    next();
  };
}

export function RequireActiveCompany() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Taurean IT super admins bypass company checks

      if ((req.user as any)?.isSuperAdmin) {
        return next();
      }

      const companyId = (req.user as any)?.companyId;

      if (!companyId) {
        sendUnauthorized(res, "No company assigned");
        return;
      }

      const company = await CompanyModel.findById(companyId).lean();
      if (!company) {
        sendUnauthorized(res, "Company not found");
        return;
      }

      // Taurean IT is always considered active
      if (company.name === "Taurean IT") {
        return next();
      }

      // For other companies, check if active and subscription is valid
      if (company.isActive !== true) {
        sendUnauthorized(res, "Company inactive");
        return;
      }

      const sub = (company as any).subscription;
      if (!sub || !sub.expiresAt || new Date(sub.expiresAt) < new Date()) {
        sendUnauthorized(res, "Subscription expired or missing");
        return;
      }

      return next();
    } catch (e: any) {
      sendError(res, "Company access check failed", e.message);
      return;
    }
  };
}

export function RequirePermissions(required: (keyof any)[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Taurean IT super admins bypass permission checks
      if ((req.user as any)?.isSuperAdmin) return next();

      const userId = (req.user as any)?.id;
      if (!userId) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      const user = await UserModel.findById(userId)
        .select("companyRole")
        .lean();

      if (!user || !(user as any).companyRole) {
        sendUnauthorized(res, "No company role assigned");
        return;
      }

      const role = await CompanyRoleModel.findById(
        (user as any).companyRole
      ).lean();

      if (!role) {
        sendUnauthorized(res, "Role not found");
        return;
      }

      const perms = (role as any).permissions || {};
      const ok = required.every((p) => perms[p] === true);
      if (!ok) {
        sendUnauthorized(res, "Insufficient permissions");
        return;
      }

      return next();
    } catch (e: any) {
      sendError(res, "Permission check failed", e.message);
      return;
    }
  };
}
