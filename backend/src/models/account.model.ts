import { Schema, Model, model, Document, Types } from "mongoose";
import { Account } from "../types";

interface Discrepancy {
  amount: number;
  reason: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
}

const DiscrepancySchema = new Schema<Discrepancy>({
  amount: { type: Number, required: true },
  reason: { type: String, required: true, trim: true },
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
});

interface Reconciliation {
  lastReconciledDate?: Date;
  lastReconciledBy?: Types.ObjectId;
  discrepancies: Discrepancy[];
}

const ReconciliationSchema = new Schema<Reconciliation>({
  lastReconciledDate: { type: Date },
  lastReconciledBy: { type: Schema.Types.ObjectId, ref: "User" },
  discrepancies: [DiscrepancySchema],
});

interface AccountDocument extends Document, Account {}

const AccountSchema = new Schema<AccountDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    usage: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "GHS" },
    transactionHistory: [
      {
        transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
        type: { type: String, enum: ["credit", "debit"], required: true },
        amount: { type: Number, required: true },
        usageAfter: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        description: { type: String, trim: true },
      },
    ],
    reconciliation: ReconciliationSchema,
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
