import { Schema, model, Model, Document, Types } from "mongoose";

interface PayoutDocument extends Document {
  company?: Types.ObjectId;
  isPlatform?: boolean;
  amount: number;
  currency: string;
  recipientCode?: string;
  status: "pending" | "approved" | "processing" | "paid" | "failed" | "rejected";
  requestedBy: Types.ObjectId;
  processedBy?: Types.ObjectId;
  paystackTransferCode?: string;
  paystackTransferId?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<PayoutDocument>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    isPlatform: { type: Boolean, default: false },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "GHS" },
    recipientCode: { type: String },
    status: { type: String, enum: ["pending", "approved", "processing", "paid", "failed", "rejected"], default: "pending" },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    paystackTransferCode: { type: String },
    paystackTransferId: { type: String },
    reason: { type: String },
  },
  { timestamps: true }
);

PayoutSchema.index({ company: 1, createdAt: -1 });

export const PayoutModel: Model<PayoutDocument> = model<PayoutDocument>("Payout", PayoutSchema);
export { PayoutDocument };