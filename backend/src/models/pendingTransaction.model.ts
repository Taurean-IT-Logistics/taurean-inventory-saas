import mongoose, { Document, Schema } from "mongoose";

export interface IPendingTransaction extends Document {
  user: string;
  company: string;
  facility?: string;
  type: "rental" | "booking" | "purchase";
  referenceId: string; // ID of the rental, booking, or purchase
  amount: number;
  currency: string;
  paymentMethod: "cash" | "cheque" | "bank_transfer";
  paymentDetails?: {
    // For cash payments
    denominations?: Array<{
      denomination: number;
      quantity: number;
    }>;
    // For cheque payments
    chequeNumber?: string;
    bankName?: string;
    chequeDate?: Date;
    // For bank transfers
    bankAccount?: string;
    transactionReference?: string;
  };
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  notes?: string;
  processedBy?: string; // Admin/staff who processed the payment
  processedAt?: Date;
  rejectionReason?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PendingTransactionSchema = new Schema<IPendingTransaction>(
  {
    user: {
      type: String,
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      index: true,
    },
    facility: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ["rental", "booking", "purchase"],
      required: true,
      index: true,
    },
    referenceId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "GHS",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "cheque", "bank_transfer"],
      required: true,
    },
    paymentDetails: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
    },
    processedBy: {
      type: String,
      index: true,
    },
    processedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
PendingTransactionSchema.index({ user: 1, status: 1 });
PendingTransactionSchema.index({ company: 1, status: 1 });
PendingTransactionSchema.index({ facility: 1, status: 1 });
PendingTransactionSchema.index({ type: 1, referenceId: 1 });
PendingTransactionSchema.index({ createdAt: -1 });

export const PendingTransactionModel = mongoose.model<IPendingTransaction>(
  "PendingTransaction",
  PendingTransactionSchema
);
