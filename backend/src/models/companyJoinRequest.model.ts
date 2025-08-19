import mongoose, { Document, Schema } from "mongoose";

export interface ICompanyJoinRequest extends Document {
  user: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  requestedBy: mongoose.Types.ObjectId; // The user who made the request
  approvedBy?: mongoose.Types.ObjectId; // Admin who approved/rejected
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyJoinRequestSchema = new Schema<ICompanyJoinRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique user-company combinations
CompanyJoinRequestSchema.index({ user: 1, company: 1 }, { unique: true });

// Index for efficient queries
CompanyJoinRequestSchema.index({ status: 1, company: 1 });
CompanyJoinRequestSchema.index({ user: 1, status: 1 });

export const CompanyJoinRequestModel = mongoose.model<ICompanyJoinRequest>(
  "CompanyJoinRequest",
  CompanyJoinRequestSchema
);
