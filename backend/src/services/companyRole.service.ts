import {
  CompanyRoleModel,
  CompanyRoleDocument,
} from "../models/companyRole.model";
import { UserModel } from "../models/user.model";
import { sendError, sendSuccess } from "../utils/response.util";

export class CompanyRoleService {
  // Get all roles for a company
  static async getCompanyRoles(companyId: string) {
    try {
      const roles = await CompanyRoleModel.find({ company: companyId })
        .sort({ name: 1 })
        .lean();

      return roles;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get a specific role by ID
  static async getRoleById(roleId: string) {
    try {
      const role = await CompanyRoleModel.findById(roleId).lean();
      if (!role) {
        throw new Error("Role not found");
      }
      return role;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Create a new role
  static async createRole(
    companyId: string,
    roleData: {
      name: string;
      permissions: {
        accessFinancials?: boolean;
        viewBookings?: boolean;
        viewInventory?: boolean;
        createRecords?: boolean;
        editRecords?: boolean;
        manageUsers?: boolean;
        manageFacilities?: boolean;
        manageInventory?: boolean;
        manageTransactions?: boolean;
        manageEmails?: boolean;
        manageSettings?: boolean;
      };
    }
  ) {
    try {
      // Check if role name already exists for this company
      const existingRole = await CompanyRoleModel.findOne({
        company: companyId,
        name: roleData.name,
      });

      if (existingRole) {
        throw new Error("Role name already exists for this company");
      }

      const role = await CompanyRoleModel.create({
        company: companyId,
        name: roleData.name,
        permissions: roleData.permissions,
      });

      return role;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update a role
  static async updateRole(
    roleId: string,
    updates: {
      name?: string;
      permissions?: {
        viewInvoices?: boolean;
        accessFinancials?: boolean;
        viewBookings?: boolean;
        viewInventory?: boolean;
        createRecords?: boolean;
        editRecords?: boolean;
        manageUsers?: boolean;
        manageFacilities?: boolean;
        manageInventory?: boolean;
        manageTransactions?: boolean;
        manageEmails?: boolean;
        manageSettings?: boolean;
      };
    }
  ) {
    try {
      const role = await CompanyRoleModel.findById(roleId);
      if (!role) {
        throw new Error("Role not found");
      }

      // If updating name, check for duplicates
      if (updates.name && updates.name !== role.name) {
        const existingRole = await CompanyRoleModel.findOne({
          company: role.company,
          name: updates.name,
          _id: { $ne: roleId },
        });

        if (existingRole) {
          throw new Error("Role name already exists for this company");
        }
      }

      const updatedRole = await CompanyRoleModel.findByIdAndUpdate(
        roleId,
        updates,
        { new: true, runValidators: true }
      );

      return updatedRole;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Delete a role
  static async deleteRole(roleId: string) {
    try {
      const role = await CompanyRoleModel.findById(roleId);
      if (!role) {
        throw new Error("Role not found");
      }

      // Check if any users are using this role
      const usersWithRole = await UserModel.countDocuments({
        companyRole: roleId,
      });

      if (usersWithRole > 0) {
        throw new Error(
          "Cannot delete role: users are currently assigned to it"
        );
      }

      await CompanyRoleModel.findByIdAndDelete(roleId);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Assign role to user
  static async assignRoleToUser(userId: string, roleId: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const role = await CompanyRoleModel.findById(roleId);
      if (!role) {
        throw new Error("Role not found");
      }

      // Ensure user and role belong to the same company
      if (user.company?.toString() !== role.company.toString()) {
        throw new Error("User and role must belong to the same company");
      }

      user.companyRole = roleId;
      await user.save();

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Remove role from user
  static async removeRoleFromUser(userId: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.companyRole = undefined;
      await user.save();

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get users with a specific role
  static async getUsersWithRole(roleId: string) {
    try {
      const users = await UserModel.find({ companyRole: roleId })
        .select("-password")
        .populate("company", "name")
        .lean();

      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get default roles for a company (Admin, Staff, User)
  static async getDefaultRoles() {
    return [
      {
        name: "Admin",
        permissions: {
          accessFinancials: true,
          viewBookings: true,
          viewInventory: true,
          createRecords: true,
          editRecords: true,
          manageUsers: true,
          manageFacilities: true,
          manageInventory: true,
          manageTransactions: true,
          manageEmails: true,
          manageSettings: true,
        },
      },
      {
        name: "Staff",
        permissions: {
          accessFinancials: false,
          viewBookings: true,
          viewInventory: true,
          createRecords: true,
          editRecords: true,
          manageUsers: false,
          manageFacilities: false,
          manageInventory: false,
          manageTransactions: false,
          manageEmails: false,
          manageSettings: false,
        },
      },
      {
        name: "User",
        permissions: {
          accessFinancials: false,
          viewBookings: true,
          viewInventory: true,
          createRecords: false,
          editRecords: false,
          manageUsers: false,
          manageFacilities: false,
          manageInventory: false,
          manageTransactions: false,
          manageEmails: false,
          manageSettings: false,
        },
      },
    ];
  }

  // Initialize default roles for a company
  static async initializeDefaultRoles(companyId: string) {
    try {
      const defaultRoles = await this.getDefaultRoles();
      const createdRoles = [];

      for (const roleData of defaultRoles) {
        // Check if role already exists
        let role = await CompanyRoleModel.findOne({
          company: companyId,
          name: roleData.name,
        });

        if (!role) {
          // Create the role if it doesn't exist
          role = await CompanyRoleModel.create({
            company: companyId,
            name: roleData.name,
            permissions: roleData.permissions,
          });
        }

        createdRoles.push(role);
      }

      return createdRoles;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get or create default staff role for a company
  static async getOrCreateDefaultStaffRole(companyId: string) {
    try {
      // Try to find existing staff role
      let staffRole = await CompanyRoleModel.findOne({
        company: companyId,
        name: "Staff",
      });

      if (!staffRole) {
        // Initialize default roles if staff role doesn't exist
        await this.initializeDefaultRoles(companyId);
        staffRole = await CompanyRoleModel.findOne({
          company: companyId,
          name: "Staff",
        });
      }

      if (!staffRole) {
        throw new Error("Failed to create default staff role");
      }

      return staffRole;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
