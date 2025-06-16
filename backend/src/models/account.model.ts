import { Schema, Model, model, Document } from "mongoose";
import { Account } from "../types";

interface AccountDocument extends Document, Account {}

const AccountSchema = new Schema<AccountDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, required: true, default: 0 },
    transactionHistory: [
      {
        type: { type: String, enum: ["credit", "debit"], required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const AccountModel: Model<AccountDocument> = model("Account", AccountSchema);

export { AccountDocument, AccountModel };
