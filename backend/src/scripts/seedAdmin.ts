// seedAdmin.ts

import { connectToMongoDB } from "../database";
import { UserModel, CompanyModel, CompanyRoleModel } from "../models";
import { hashPassword } from "../helpers";

async function seedTaureanIT() {
  try {
    await connectToMongoDB();
    console.log("Connected to database");

    // Create Taurean IT company (without subaccount - admin can set it up later)
    const taureanITCompany = await CompanyModel.findOneAndUpdate(
      { name: "Taurean IT" },
      {
        name: "Taurean IT",
        description:
          "Creator and operator of the Taurean Inventory SaaS platform",
        location: "Ghana",
        contactEmail: "admin@taureanit.com",
        contactPhone: "+233000000000",
        currency: "GHS",
        isActive: true,
        feePercent: 5,
        // Note: paystackSubaccountCode will be set up later through admin panel
        invoiceFormat: {
          type: "prefix",
          prefix: "TIL",
          nextNumber: 1,
          padding: 4,
        },
        subscription: {
          plan: "annual",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          licenseKey: "TAUREAN-IT-2024",
          status: "active",
          hasUsedTrial: false,
          isTrial: false,
        },
      },
      { upsert: true, new: true }
    );

    console.log("Taurean IT company created/updated:", taureanITCompany._id);

    // Create default company roles for Taurean IT
    const adminRole = await CompanyRoleModel.findOneAndUpdate(
      { name: "Admin", company: taureanITCompany._id },
      {
        name: "Admin",
        company: taureanITCompany._id,
        permissions: {
          viewInvoices: true,
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
      { upsert: true, new: true }
    );

    const staffRole = await CompanyRoleModel.findOneAndUpdate(
      { name: "Staff", company: taureanITCompany._id },
      {
        name: "Staff",
        company: taureanITCompany._id,
        permissions: {
          viewInvoices: false,
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
      { upsert: true, new: true }
    );

    const userRole = await CompanyRoleModel.findOneAndUpdate(
      { name: "User", company: taureanITCompany._id },
      {
        name: "User",
        company: taureanITCompany._id,
        permissions: {
          viewInvoices: false,
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
      { upsert: true, new: true }
    );

    console.log("Company roles created for Taurean IT");

    // Create Taurean IT admin user with super admin privileges
    const hashedPassword = await hashPassword("taureanadmin2024");

    const taureanAdmin = await UserModel.findOneAndUpdate(
      { email: "admin@taureanit.com" },
      {
        name: "Taurean Admin",
        username: "taureanadmin",
        email: "admin@taureanit.com",
        password: hashedPassword,
        phone: "+233000000000",
        role: "admin", // Company role within Taurean IT
        isSuperAdmin: true, // System-wide super admin privileges
        company: taureanITCompany._id,
        companyRole: adminRole._id,
        status: "active",
        isDeleted: false,
      },
      { upsert: true, new: true }
    );

    console.log("Taurean IT admin user created/updated:", taureanAdmin._id);

    // Create additional Taurean IT staff if needed
    const taureanStaff = await UserModel.findOneAndUpdate(
      { email: "staff@taureanit.com" },
      {
        name: "Taurean Staff",
        username: "taureanstaff",
        email: "staff@taureanit.com",
        password: await hashPassword("taureanstaff2024"),
        phone: "+233000000001",
        role: "staff", // Company role within Taurean IT
        isSuperAdmin: false, // No system-wide privileges
        company: taureanITCompany._id,
        companyRole: staffRole._id,
        status: "active",
        isDeleted: false,
      },
      { upsert: true, new: true }
    );

    console.log("Taurean IT staff user created/updated:", taureanStaff._id);

    console.log("✅ Taurean IT seeding completed successfully!");
    console.log("Company ID:", taureanITCompany._id);
    console.log("Admin User ID:", taureanAdmin._id);
    console.log("Staff User ID:", taureanStaff._id);
    console.log("\nLogin credentials:");
    console.log("Admin: admin@taureanit.com / taureanadmin2024");
    console.log("Staff: staff@taureanit.com / taureanstaff2024");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

seedTaureanIT();
