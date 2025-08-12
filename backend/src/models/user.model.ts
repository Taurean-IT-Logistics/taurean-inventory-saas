import { Schema, model, Document } from "mongoose";
import { User, CartItem } from "../types";

interface UserDocument extends Document, User {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: null,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "staff", "user"], default: "user" },
    isSuperAdmin: { type: Boolean, default: false },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    companyRole: { type: Schema.Types.ObjectId, ref: "CompanyRole" },
    loyaltyProfile: {
      totalBookings: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      preferredFacilities: [{ type: Schema.Types.ObjectId, ref: "Facility" }],
      lastBookingDate: Date,
      loyaltyTier: {
        type: String,
        enum: ["bronze", "silver", "gold", "platinum"],
        default: "bronze",
      },
    },
    cart: [
      {
        type: {
          type: String,
          enum: ["Facility", "InventoryItem"],
          required: true,
        },
        itemId: {
          type: Schema.Types.ObjectId,
          required: true,
          refPath: "cart.type",
        },
        quantity: { type: Number, default: 1 },
        name: { type: String },
        price: { type: Number },
        imageUrl: { type: String },
        notes: { type: String },
      },
    ],
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
