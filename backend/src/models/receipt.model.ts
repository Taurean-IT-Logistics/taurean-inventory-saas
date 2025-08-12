import { Schema, model, Model, Document, Types } from "mongoose";

interface ReceiptDocument extends Document {
  invoice: Types.ObjectId;
  amount: number;
  timestamp: Date;
  reference?: string;
  createdAt: Date;
}

const ReceiptSchema = new Schema<ReceiptDocument>(
  {
    invoice: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    amount: { type: Number, required: true, min: 0 },
    timestamp: { type: Date, required: true },
    reference: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReceiptSchema.index({ invoice: 1, createdAt: -1 });

export const ReceiptModel: Model<ReceiptDocument> = model<ReceiptDocument>(
  "Receipt",
  ReceiptSchema
);

export { ReceiptDocument };