import { Schema, model, Model, Document } from "mongoose";
import { Transaction } from "../types";

interface TransactionDocument extends Document, Transaction {}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    account: { type: Schema.Types.ObjectId, ref: "Account" },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: {
      type: String,
      enum: [
        "facility",
        "account",
        "booking",
        "inventory_item",
        "company",
        "activation",
        "other",
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    method: {
      type: String,
      default: "n/a",
      required: true,
    },
    paymentDetails: {
      paystackReference: { type: String },
      chequeNumber: { type: String },
      bankDetails: {
        bankName: { type: String },
        accountNumber: { type: String },
        sortCode: { type: String },
      },
      mobileMoneyDetails: {
        provider: {
          type: String,
          default: "n/a",
        },
        phoneNumber: { type: String },
        transactionId: { type: String },
      },
    },
    ref: { type: String },
    isPaystack: { type: Boolean },
    isCheque: { type: Boolean },
    cheque: { type: Schema.Types.ObjectId, ref: "Cheque" },
    isSplitPayment: { type: Boolean },
    splitPayment: { type: Schema.Types.ObjectId, ref: "SplitPayment" },
    isCash: { type: Boolean },
    cash: { type: Schema.Types.ObjectId, ref: "Cash" },
    taxes: { type: Schema.Types.ObjectId, ref: "TaxSchedule" },
    accessCode: { type: String },
    receiptUrl: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reconciled: { type: Boolean, default: false },
    reconciledAt: { type: Date },
    facility: { type: Schema.Types.ObjectId, ref: "Facility" },
    description: { type: String, trim: true },
    attachments: [{ type: String }],
    tags: [{ type: String, trim: true }],
    isDeleted: { type: Boolean, default: false },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    isPlatformRevenue: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
TransactionSchema.index({ type: 1, createdAt: -1 });
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ facility: 1, createdAt: -1 });
TransactionSchema.index({ reconciled: 1 });
TransactionSchema.index({ method: 1 });
TransactionSchema.index({ company: 1, createdAt: -1 });
TransactionSchema.index({ isPlatformRevenue: 1 });

const TransactionModel: Model<TransactionDocument> = model(
  "Transaction",
  TransactionSchema
);

export { TransactionDocument, TransactionModel };
