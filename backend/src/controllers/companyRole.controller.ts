import { Request, Response } from "express";
import { CompanyRoleService } from "../services/companyRole.service";
import { sendError, sendSuccess } from "../utils/response.util";

export class CompanyRoleController {
  // Get all roles for a company
  static async getCompanyRoles(req: Request, res: Response): Promise<void> {
    try {
      const companyId = (req.user as any)?.companyId;
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const roles = await CompanyRoleService.getCompanyRoles(companyId);
      sendSuccess(res, "Company roles retrieved successfully", { roles });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get a specific role by ID
  static async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const role = await CompanyRoleService.getRoleById(roleId);
      sendSuccess(res, "Role retrieved successfully", { role });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Create a new role
  static async createRole(req: Request, res: Response): Promise<void> {
    try {
      const companyId = (req.user as any)?.companyId;
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const { name, permissions } = req.body;

      if (!name) {
        sendError(res, "Role name is required", null, 400);
        return;
      }

      const role = await CompanyRoleService.createRole(companyId, {
        name,
        permissions: permissions || {},
      });

      sendSuccess(res, "Role created successfully", { role }, 201);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Update a role
  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const updates = req.body;

      const role = await CompanyRoleService.updateRole(roleId, updates);
      sendSuccess(res, "Role updated successfully", { role });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Delete a role
  static async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const result = await CompanyRoleService.deleteRole(roleId);
      sendSuccess(res, "Role deleted successfully", result);
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Assign role to user
  static async assignRoleToUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        sendError(res, "User ID and Role ID are required", null, 400);
        return;
      }

      const user = await CompanyRoleService.assignRoleToUser(userId, roleId);
      sendSuccess(res, "Role assigned to user successfully", { user });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Remove role from user
  static async removeRoleFromUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await CompanyRoleService.removeRoleFromUser(userId);
      sendSuccess(res, "Role removed from user successfully", { user });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get users with a specific role
  static async getUsersWithRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const users = await CompanyRoleService.getUsersWithRole(roleId);
      sendSuccess(res, "Users with role retrieved successfully", { users });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Initialize default roles for a company
  static async initializeDefaultRoles(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const companyId = (req.user as any)?.companyId;
      if (!companyId) {
        sendError(res, "Company ID not found", null, 400);
        return;
      }

      const defaultRoles = await CompanyRoleService.getDefaultRoles();
      const createdRoles = [];

      for (const roleData of defaultRoles) {
        try {
          const role = await CompanyRoleService.createRole(companyId, roleData);
          createdRoles.push(role);
        } catch (error: any) {
          // Role might already exist, continue
          console.log(
            `Role ${roleData.name} might already exist:`,
            error.message
          );
        }
      }

      sendSuccess(res, "Default roles initialized successfully", {
        roles: createdRoles,
      });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }
}
