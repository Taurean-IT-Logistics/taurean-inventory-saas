import { Schema, model, Model, Document } from "mongoose";
import { Transaction } from "../types";

interface TransactionDocument extends Document, Transaction {}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["cash", "mobile_money", "bank", "cheque"],
      required: true,
    },
    account: { type: Schema.Types.ObjectId, ref: "Account" },
    ref: { type: String },
    facility: { type: Schema.Types.ObjectId, ref: "Facility" },
    description: { type: String },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

const TransactionModel: Model<TransactionDocument> = model(
  "Transaction",
  TransactionSchema
);

export { TransactionDocument, TransactionModel };
