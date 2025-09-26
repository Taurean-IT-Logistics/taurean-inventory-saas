import { Schema, model, Model, Document } from "mongoose";
import { Cash } from "../types";

interface CashDocument extends Document, Cash {}

const CashSchema = new Schema<CashDocument>(
  {
    amount: { type: Number, required: true },
    denominations: [
      { denomination: { type: Number }, quantity: { type: Number } },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CashModel: Model<CashDocument> = model("Cash", CashSchema);

export { CashDocument, CashModel };
