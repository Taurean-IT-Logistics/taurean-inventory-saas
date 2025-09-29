import { Document, Schema, Model, model } from "mongoose";
import { Tax } from "../types";

export interface TaxDocument extends Document, Tax {}

const TaxSchema: Schema = new Schema<TaxDocument>(
  {
    name: { type: String, required: true },
    rate: { type: Number, required: true, default: 0.05 },
    type: { type: String, required: true },
    taxType: {
      type: String,
      enum: ["percentage", "fixed_amount"],
      default: "percentage",
    },
    fixedAmount: { type: Number, default: 0 }, // For fixed amount taxes
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    isDefault: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 999 },
    description: { type: String },
    effectiveDate: { type: Date },
    expiryDate: { type: Date },
    copiedFrom: { type: Schema.Types.ObjectId, ref: "Tax" }, // Reference to original tax
    // Independent tax fields
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    archivedBy: { type: Schema.Types.ObjectId, ref: "User" },
    archivedReason: { type: String },
    // Audit trail fields
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdReason: { type: String }, // Reason for creating this tax
    replacedTax: { type: Schema.Types.ObjectId, ref: "Tax" }, // If this tax replaced another one
    replacementReason: { type: String }, // Why this tax replaced the previous one
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
TaxSchema.index({ priority: 1, createdAt: -1 });
TaxSchema.index({ isDefault: 1 });
TaxSchema.index({ company: 1 });
// Audit trail indexes
TaxSchema.index({ createdBy: 1, createdAt: -1 });
TaxSchema.index({ isArchived: 1, archivedAt: -1 });
TaxSchema.index({ replacedTax: 1 });
TaxSchema.index({ company: 1, isArchived: 1 });

export const TaxModel: Model<TaxDocument> = model<TaxDocument>(
  "Tax",
  TaxSchema
);
