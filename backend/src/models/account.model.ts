import { Schema, Model, model, Document } from "mongoose";
import { Account } from "../types";

interface AccountDocument extends Document, Account {}

const AccountSchema = new Schema<AccountDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["cash", "bank", "mobile_money"],
      required: true,
    },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "GHS" },
    accountDetails: {
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      sortCode: { type: String, trim: true },
      provider: {
        type: String,
        enum: ["mtn", "vodafone", "airteltigo"],
      },
      phoneNumber: { type: String },
    },
    transactionHistory: [
      {
        transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
        type: { type: String, enum: ["credit", "debit"], required: true },
        amount: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        description: { type: String, trim: true },
      },
    ],
    reconciliation: {
      lastReconciledDate: { type: Date },
      lastReconciledBy: { type: Schema.Types.ObjectId, ref: "User" },
      discrepancies: [
        {
          amount: { type: Number, required: true },
          reason: { type: String, required: true, trim: true },
          resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
          resolvedAt: { type: Date },
        },
      ],
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
AccountSchema.index({ user: 1, type: 1 });
AccountSchema.index({ isActive: 1, isDeleted: 1 });

const AccountModel: Model<AccountDocument> = model("Account", AccountSchema);

export { AccountDocument, AccountModel };
