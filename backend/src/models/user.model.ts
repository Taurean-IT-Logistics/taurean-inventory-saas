import { Schema, model, Document } from "mongoose";
import { User, CartItem } from "../types";

interface UserDocument extends Document, Omit<User, "_id"> {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      default: "user",
    },
    isSuperAdmin: { type: Boolean, default: false }, // Only for Taurean IT users
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    companyRole: { type: Schema.Types.ObjectId, ref: "CompanyRole" },
    cart: [{ type: Schema.Types.ObjectId, ref: "InventoryItem" }],
    loyaltyProfile: {
      totalBookings: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      preferredFacilities: [{ type: Schema.Types.ObjectId, ref: "Facility" }],
      lastBookingDate: { type: Date },
      loyaltyTier: {
        type: String,
        enum: ["bronze", "silver", "gold", "platinum"],
        default: "bronze",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isSuperAdmin: 1 });
UserSchema.index({ company: 1 });
UserSchema.index({ companyRole: 1 });

const UserModel = model<UserDocument>("User", UserSchema);

export { UserDocument, UserModel };
