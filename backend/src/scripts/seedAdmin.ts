// seedAdmin.ts

import { connectToMongoDB } from "../database";
import { UserModel } from "../models";
import { CompanyModel } from "../models/company.model";
import { hashPassword } from "../helpers";

const defaultAdmin = {
  name: "Taurean Super Admin",
  username: "taurean-admin",
  email: "admin@taureanit.com",
  password: "ChangeMe123!", // to be hashed
  role: "admin",
};

const seedAdmin = async () => {
  try {
    await connectToMongoDB();

    // Ensure Taurean IT company exists
    let company = await CompanyModel.findOne({ name: "Taurean IT Logistics" });
    if (!company) {
      company = await CompanyModel.create({
        name: "Taurean IT Logistics",
        currency: "GHS",
        isActive: true,
        feePercent: 5,
      } as any);
      console.log("✅ Created company: Taurean IT Logistics");
    }

    // Check if admin already exists
    let existingAdmin = await UserModel.findOne({
      $or: [{ email: defaultAdmin.email }, { username: defaultAdmin.username }],
    });

    if (!existingAdmin) {
      const hashedPassword = await hashPassword(defaultAdmin.password);
      existingAdmin = await UserModel.create({
        ...defaultAdmin,
        password: hashedPassword,
        isSuperAdmin: true,
        company: (company as any)._id,
      } as any);
      console.log("🎉 Default super admin created:", existingAdmin.email);
    } else {
      // Ensure super admin flags
      if (!(existingAdmin as any).isSuperAdmin) {
        (existingAdmin as any).isSuperAdmin = true;
        (existingAdmin as any).company = (company as any)._id;
        await existingAdmin.save();
        console.log("🔧 Upgraded existing admin to super admin and linked company");
      } else {
        console.log("✅ Admin user already exists:", existingAdmin.email);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin/company:", error);
    process.exit(1);
  }
};

seedAdmin();
