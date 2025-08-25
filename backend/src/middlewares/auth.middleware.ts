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

export function EnsureCompanyContext() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;

      if (!user) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      // Get the full user data to check company information
      const fullUser = await UserModel.findById(user.id)
        .select("company isSuperAdmin role")
        .lean();
      if (!fullUser) {
        sendUnauthorized(res, "User not found");
        return;
      }

      // Normal users (customers/renters) don't need company association
      if (fullUser.role === "user" && !fullUser.company) {
        console.log(
          `Normal user ${user.email} accessing system without company association`
        );
        return next();
      }

      // Staff, admins, and super admins must have company association
      if (["staff", "admin"].includes(fullUser.role) || fullUser.isSuperAdmin) {
        if (!fullUser.company) {
          sendUnauthorized(
            res,
            "Staff, admins, and super admins must be associated with a company"
          );
          return;
        }

        // Update the user object with the company information
        req.user = {
          ...user,
          companyId: fullUser.company.toString(),
        };

        console.log(
          `User ${user.email} (${
            fullUser.isSuperAdmin ? "Super Admin" : fullUser.role
          }) accessing company: ${fullUser.company}`
        );
      } else {
        // For regular users, set companyId to null if no company
        req.user = {
          ...user,
          companyId: fullUser.company ? fullUser.company.toString() : null,
        };
      }

      return next();
    } catch (e: any) {
      console.error("Company context check failed:", e);
      sendError(res, "Company context check failed", e.message);
      return;
    }
  };
}

export function RequireCompanyContext() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;

      if (!user) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      // Get the full user data to check company information
      const fullUser = await UserModel.findById(user.id)
        .select("company isSuperAdmin role")
        .lean();
      if (!fullUser) {
        sendUnauthorized(res, "User not found");
        return;
      }

      // All users must have company association for business operations
      if (!fullUser.company) {
        sendUnauthorized(
          res,
          "Company association required for this operation"
        );
        return;
      }

      // Update the user object with the company information
      req.user = {
        ...user,
        companyId: fullUser.company.toString(),
      };

      console.log(
        `User ${user.email} (${
          fullUser.isSuperAdmin ? "Super Admin" : fullUser.role
        }) accessing business operation for company: ${fullUser.company}`
      );

      return next();
    } catch (e: any) {
      console.error("Company context requirement check failed:", e);
      sendError(res, "Company context requirement check failed", e.message);
      return;
    }
  };
}

export function RequireActiveCompany() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First ensure company context is required
      await RequireCompanyContext()(req, res, async () => {
        const user = req.user as any;
        const companyId = user.companyId;

        const company = await CompanyModel.findById(companyId).lean();
        if (!company) {
          sendUnauthorized(res, "Company not found");
          return;
        }

        // For super admins, always allow access
        if (user.isSuperAdmin) {
          console.log(
            `Super admin ${user.email} accessing company: ${company.name}`
          );
          return next();
        }

        // For regular users, check if company is active and subscription is valid
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
      });
    } catch (e: any) {
      console.error("Company access check failed:", e);
      sendError(res, "Company access check failed", e.message);
      return;
    }
  };
}

export function RequirePermissions(required: (keyof any)[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First ensure company context is required
      await RequireCompanyContext()(req, res, async () => {
        const user = req.user as any;

        // Super admins bypass permission checks but still need company context
        if (user.isSuperAdmin) {
          console.log(
            `Super admin ${user.email} bypassing permission check for company: ${user.companyId}`
          );
          return next();
        }

        const userId = user.id;
        if (!userId) {
          sendUnauthorized(res, "Authentication required");
          return;
        }

        const userDoc = await UserModel.findById(userId)
          .select("companyRole company")
          .lean();

        if (!userDoc || !userDoc.companyRole) {
          sendUnauthorized(res, "No company role assigned");
          return;
        }

        // Verify user belongs to the company they're trying to access
        if (userDoc.company?.toString() !== user.companyId) {
          sendUnauthorized(res, "Access denied - user company mismatch");
          return;
        }

        const role = await CompanyRoleModel.findById(
          userDoc.companyRole
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
      });
    } catch (e: any) {
      console.error("Permission check failed:", e);
      sendError(res, "Permission check failed", e.message);
      return;
    }
  };
}
