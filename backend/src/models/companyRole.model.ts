import { Schema, model, Model, Document, Types } from "mongoose";
import { CompanyRole } from "../types";

interface CompanyRoleDocument extends Document {
  company: Types.ObjectId;
  name: string;
  permissions: {
    viewInvoices?: boolean;
    accessFinancials?: boolean;
    viewBookings?: boolean;
    viewInventory?: boolean;
    createRecords?: boolean;
    editRecords?: boolean;
    manageUsers?: boolean;
    manageFacilities?: boolean;
    manageInventory?: boolean;
    manageTransactions?: boolean;
    manageEmails?: boolean;
    manageSettings?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanyRoleSchema = new Schema<CompanyRoleDocument>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true, trim: true },
    permissions: {
      viewInvoices: { type: Boolean, default: false },
      accessFinancials: { type: Boolean, default: false },
      viewBookings: { type: Boolean, default: true },
      viewInventory: { type: Boolean, default: true },
      createRecords: { type: Boolean, default: false },
      editRecords: { type: Boolean, default: false },
      manageUsers: { type: Boolean, default: false },
      manageFacilities: { type: Boolean, default: false },
      manageInventory: { type: Boolean, default: false },
      manageTransactions: { type: Boolean, default: false },
      manageEmails: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

CompanyRoleSchema.index({ company: 1, name: 1 }, { unique: true });

export const CompanyRoleModel: Model<CompanyRoleDocument> = model<CompanyRoleDocument>(
  "CompanyRole",
  CompanyRoleSchema
);

export { CompanyRoleDocument };