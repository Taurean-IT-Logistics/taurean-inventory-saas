import { Schema, model, Model, Document } from "mongoose";
import { Company } from "../types";

interface CompanyDocument extends Document, Company {}

const CompanySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    registrationDocs: [{ type: String }],
    location: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    invoiceFormat: {
      type: {
        type: String,
        enum: ["auto", "prefix", "paystack"],
        default: "auto",
      },
      prefix: { type: String, default: "" },
      nextNumber: { type: Number, default: 1 },
      padding: { type: Number, default: 4 },
    },
    currency: { type: String, default: "GHS" },
    isActive: { type: Boolean, default: true },
    subscription: {
      plan: {
        type: String,
        enum: ["monthly", "biannual", "annual", "triannual"],
        default: "monthly",
      },
      expiresAt: { type: Date },
      licenseKey: { type: String },
    },
    paystackSubaccountCode: { type: String },
    feePercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CompanySchema.index({ name: 1 }, { unique: true });

export const CompanyModel: Model<CompanyDocument> = model<CompanyDocument>(
  "Company",
  CompanySchema
);

export { CompanyDocument };