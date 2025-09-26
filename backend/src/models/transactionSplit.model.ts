import { Schema, model, Model, Document } from "mongoose";
import { TransactionSplit } from "../types";

interface TransactionSplitDocument extends Document, TransactionSplit {}

const TransactionSplitSchema = new Schema<TransactionSplitDocument>(
  {
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    splitType: { enum: ["fixed", "percentage"], default: "percentage" },
    splitAmount: { type: Number },
    splitPercentage: { type: Number },
    dueDate: { type: Date, default: new Date() },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TransactionSplitModel: Model<TransactionSplitDocument> = model(
  "TransactionSplit",
  TransactionSplitSchema
);

export { TransactionSplitDocument, TransactionSplitModel };
