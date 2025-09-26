import { Schema, model, Model, Document } from "mongoose";
import { SplitPayment } from "../types";

interface SplitPaymentDocument extends Document, SplitPayment {}

const SplitPaymentSchema = new Schema<SplitPaymentDocument>(
  {
    amount: { type: Number },
    currency: { type: String, default: "GHS" },
    transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const SplitPaymentModel: Model<SplitPaymentDocument> = model(
  "SplitPayment",
  SplitPaymentSchema
);

export { SplitPaymentDocument, SplitPaymentModel };
