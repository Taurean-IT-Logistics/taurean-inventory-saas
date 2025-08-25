// updateCompanyRolePermissions.ts
// This script updates existing company admin roles to include the new email permissions

import { connectToMongoDB } from "../database";
import { CompanyRoleModel } from "../models";

async function updateCompanyRolePermissions() {
  try {
    await connectToMongoDB();
    console.log("Connected to database");

    // Find all admin roles that don't have the new email permissions
    const adminRoles = await CompanyRoleModel.find({
      name: "Admin",
      $or: [
        { "permissions.manageEmails": { $exists: false } },
        { "permissions.manageSettings": { $exists: false } },
      ],
    });

    console.log(`Found ${adminRoles.length} admin roles to update`);

    let updatedCount = 0;

    for (const role of adminRoles) {
      const currentPermissions = (role as any).permissions || {};

      // Add missing permissions for admin roles
      const updatedPermissions = {
        ...currentPermissions,
        manageEmails:
          currentPermissions.manageEmails !== undefined
            ? currentPermissions.manageEmails
            : true, // Default to true for admin roles
        manageSettings:
          currentPermissions.manageSettings !== undefined
            ? currentPermissions.manageSettings
            : true, // Default to true for admin roles
      };

      await CompanyRoleModel.findByIdAndUpdate(role._id, {
        permissions: updatedPermissions,
      });

      updatedCount++;
      console.log(
        `Updated admin role for company: ${role.company} (${role._id})`
      );
    }

    // Also update any staff roles that might need the permissions (optional - set to false by default)
    const staffRoles = await CompanyRoleModel.find({
      name: "Staff",
      $or: [
        { "permissions.manageEmails": { $exists: false } },
        { "permissions.manageSettings": { $exists: false } },
      ],
    });

    console.log(`Found ${staffRoles.length} staff roles to update`);

    for (const role of staffRoles) {
      const currentPermissions = (role as any).permissions || {};

      // Add missing permissions for staff roles (default to false)
      const updatedPermissions = {
        ...currentPermissions,
        manageEmails:
          currentPermissions.manageEmails !== undefined
            ? currentPermissions.manageEmails
            : false, // Default to false for staff roles
        manageSettings:
          currentPermissions.manageSettings !== undefined
            ? currentPermissions.manageSettings
            : false, // Default to false for staff roles
      };

      await CompanyRoleModel.findByIdAndUpdate(role._id, {
        permissions: updatedPermissions,
      });

      updatedCount++;
      console.log(
        `Updated staff role for company: ${role.company} (${role._id})`
      );
    }

    // Update user roles as well
    const userRoles = await CompanyRoleModel.find({
      name: "User",
      $or: [
        { "permissions.manageEmails": { $exists: false } },
        { "permissions.manageSettings": { $exists: false } },
      ],
    });

    console.log(`Found ${userRoles.length} user roles to update`);

    for (const role of userRoles) {
      const currentPermissions = (role as any).permissions || {};

      // Add missing permissions for user roles (default to false)
      const updatedPermissions = {
        ...currentPermissions,
        manageEmails:
          currentPermissions.manageEmails !== undefined
            ? currentPermissions.manageEmails
            : false, // Default to false for user roles
        manageSettings:
          currentPermissions.manageSettings !== undefined
            ? currentPermissions.manageSettings
            : false, // Default to false for user roles
      };

      await CompanyRoleModel.findByIdAndUpdate(role._id, {
        permissions: updatedPermissions,
      });

      updatedCount++;
      console.log(
        `Updated user role for company: ${role.company} (${role._id})`
      );
    }

    console.log(
      `✅ Successfully updated ${updatedCount} company roles with email permissions`
    );

    // Verify the update
    const verificationCount = await CompanyRoleModel.countDocuments({
      $and: [
        { "permissions.manageEmails": { $exists: true } },
        { "permissions.manageSettings": { $exists: true } },
      ],
    });

    console.log(
      `📊 Total roles now have email permissions: ${verificationCount}`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
if (require.main === module) {
  updateCompanyRolePermissions();
}

export { updateCompanyRolePermissions };
