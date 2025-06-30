// seedAdmin.ts

import { connectToMongoDB } from "../database";
import { UserModel } from "../models";
import { hashPassword } from "../helpers";

const defaultAdmin = {
  name: "Super Admin",
  username: "admin",
  email: "admin@example.com",
  password: "admin123", // to be hashed
  role: "admin",
};

const seedAdmin = async () => {
  try {
    await connectToMongoDB();

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({
      $or: [{ email: defaultAdmin.email }, { username: defaultAdmin.username }],
      role: "admin",
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await hashPassword(defaultAdmin.password);

    const adminUser = await UserModel.create({
      ...defaultAdmin,
      password: hashedPassword,
    });

    console.log("🎉 Default admin created:", adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
