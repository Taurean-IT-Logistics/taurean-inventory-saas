import { Schema, model, Document } from "mongoose";

export interface ICompanyJoinRequest extends Document {
  user: Schema.Types.ObjectId;
  company: Schema.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  message?: string;
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Schema.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
}

const CompanyJoinRequestSchema = new Schema<ICompanyJoinRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: { type: String, trim: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// Ensure one pending request per user per company
CompanyJoinRequestSchema.index(
  { user: 1, company: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export const CompanyJoinRequestModel = model<ICompanyJoinRequest>(
  "CompanyJoinRequest",
  CompanyJoinRequestSchema
);
