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
  },
  {
    timestamps: true,
  }
);

export const TaxModel: Model<TaxDocument> = model<TaxDocument>(
  "Tax",
  TaxSchema
);
