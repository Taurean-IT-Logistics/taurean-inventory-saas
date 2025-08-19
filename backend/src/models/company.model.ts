import { Schema, model, Model, Document } from "mongoose";
import { Company } from "../types";

interface CompanyDocument extends Document, Company {}

const CompanySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true, trim: true },
    logo: {
      path: { type: String },
      originalName: { type: String },
      mimetype: { type: String },
      size: { type: Number },
    },
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
        enum: ["free_trial", "monthly", "biannual", "annual", "triannual"],
        default: "monthly",
      },
      expiresAt: { type: Date },
      licenseKey: { type: String },
      paymentReference: { type: String },
      activatedAt: { type: Date },
      status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
      updatedAt: { type: Date },
      hasUsedTrial: { type: Boolean, default: false },
      isTrial: { type: Boolean, default: false },
    },
    paystackSubaccountCode: { type: String },
    feePercent: { type: Number, default: 5 },
    paystackRecipientCode: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emailSettings: {
      sendInvoiceEmails: { type: Boolean, default: true },
      sendReceiptEmails: { type: Boolean, default: true },
      sendBookingConfirmations: { type: Boolean, default: true },
      sendBookingReminders: { type: Boolean, default: true },
      sendPaymentNotifications: { type: Boolean, default: true },
      sendWelcomeEmails: { type: Boolean, default: true },
      sendSubscriptionNotices: { type: Boolean, default: true },
      customFromName: { type: String },
      customFromEmail: { type: String },
      emailSignature: { type: String },
      updatedAt: { type: Date },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

CompanySchema.index({ name: 1 }, { unique: true });

export const CompanyModel: Model<CompanyDocument> = model<CompanyDocument>(
  "Company",
  CompanySchema
);

export { CompanyDocument };
