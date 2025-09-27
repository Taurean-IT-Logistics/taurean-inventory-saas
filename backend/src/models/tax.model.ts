import { Document, Schema, Model, model } from "mongoose";
import { Tax } from "../types";

export interface TaxDocument extends Document, Tax {}

const TaxSchema: Schema = new Schema<TaxDocument>(
  {
    name: { type: String, required: true },
    rate: { type: Number, required: true, default: 0.05 },
    type: { type: String, required: true },
    isSuperAdminTax: { type: Boolean, default: false },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    active: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    priority: { type: Number, default: 999 },
    calculationMethod: { 
      type: String, 
      enum: ["inclusive", "exclusive", "compound"], 
      default: "exclusive" 
    },
    appliesTo: [{ type: String }],
    description: { type: String },
    effectiveDate: { type: Date },
    expiryDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
TaxSchema.index({ priority: 1, createdAt: -1 });
TaxSchema.index({ isDefault: 1 });
TaxSchema.index({ company: 1, active: 1 });
TaxSchema.index({ isSuperAdminTax: 1, active: 1 });

export const TaxModel: Model<TaxDocument> = model<TaxDocument>(
  "Tax",
  TaxSchema
);
