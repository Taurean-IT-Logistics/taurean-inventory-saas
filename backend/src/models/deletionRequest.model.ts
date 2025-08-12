import { Schema, model, Model, Document, Types } from "mongoose";

interface DeletionRequestDocument extends Document {
  scope: "company" | "user";
  company?: Types.ObjectId;
  user?: Types.ObjectId;
  requestedBy: Types.ObjectId;
  executeAfter: Date;
  executedAt?: Date;
  status: "queued" | "executed" | "cancelled";
  reason?: string;
}

const DeletionRequestSchema = new Schema<DeletionRequestDocument>(
  {
    scope: { type: String, enum: ["company", "user"], required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    executeAfter: { type: Date, required: true },
    executedAt: { type: Date },
    status: { type: String, enum: ["queued", "executed", "cancelled"], default: "queued" },
    reason: { type: String },
  },
  { timestamps: true }
);

DeletionRequestSchema.index({ status: 1, executeAfter: 1 });

export const DeletionRequestModel: Model<DeletionRequestDocument> = model<DeletionRequestDocument>(
  "DeletionRequest",
  DeletionRequestSchema
);
export { DeletionRequestDocument };