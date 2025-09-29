import mongoose, { Document, Schema } from "mongoose";

export interface PaymentScheduleDocument extends Document {
  userId: string;
  companyId: string;
  bookingId?: string;
  rentalId?: string;
  transactionId?: string;

  // Payment details
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  // Schedule details
  paymentType: "advance" | "split" | "full";
  scheduledPayments: Array<{
    amount: number;
    dueDate: Date;
    status: "pending" | "paid" | "overdue" | "cancelled";
    paymentMethod: "paystack" | "cash" | "cheque";
    paidAt?: Date;
    transactionId?: string;
    notes?: string;
  }>;

  // Status tracking
  status: "active" | "completed" | "cancelled" | "overdue";
  isActive: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const PaymentScheduleSchema = new Schema<PaymentScheduleDocument>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    companyId: {
      type: String,
      required: true,
      ref: "Company",
    },
    bookingId: {
      type: String,
      ref: "Booking",
    },
    rentalId: {
      type: String,
      ref: "Rental",
    },
    transactionId: {
      type: String,
      ref: "Transaction",
    },

    // Payment details
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Schedule details
    paymentType: {
      type: String,
      enum: ["advance", "split", "full"],
      required: true,
    },
    scheduledPayments: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        dueDate: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "paid", "overdue", "cancelled"],
          default: "pending",
        },
        paymentMethod: {
          type: String,
          enum: ["paystack", "cash", "cheque"],
          required: true,
        },
        paidAt: {
          type: Date,
        },
        transactionId: {
          type: String,
          ref: "Transaction",
        },
        notes: {
          type: String,
        },
      },
    ],

    // Status tracking
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "overdue"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Metadata
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PaymentScheduleSchema.index({ userId: 1, companyId: 1 });
PaymentScheduleSchema.index({ bookingId: 1 });
PaymentScheduleSchema.index({ rentalId: 1 });
PaymentScheduleSchema.index({ status: 1, isActive: 1 });
PaymentScheduleSchema.index({ "scheduledPayments.dueDate": 1 });
PaymentScheduleSchema.index({ "scheduledPayments.status": 1 });

// Prevent duplicate payment schedules for the same booking/rental
PaymentScheduleSchema.index(
  { bookingId: 1, rentalId: 1, isDeleted: 1 },
  {
    unique: true,
    partialFilterExpression: {
      $or: [{ bookingId: { $exists: true } }, { rentalId: { $exists: true } }],
      isDeleted: false,
    },
  }
);

// Virtual for calculating completion percentage
PaymentScheduleSchema.virtual("completionPercentage").get(function () {
  if (this.totalAmount === 0) return 100;
  return Math.round((this.paidAmount / this.totalAmount) * 100);
});

// Method to update payment status
PaymentScheduleSchema.methods.updatePaymentStatus = function () {
  const now = new Date();
  let allPaid = true;
  let hasOverdue = false;

  this.scheduledPayments.forEach((payment: any) => {
    if (payment.status === "pending" && payment.dueDate < now) {
      payment.status = "overdue";
      hasOverdue = true;
    }
    if (payment.status !== "paid") {
      allPaid = false;
    }
  });

  // Update overall status
  if (allPaid) {
    this.status = "completed";
    this.remainingAmount = 0;
  } else if (hasOverdue) {
    this.status = "overdue";
  } else {
    this.status = "active";
  }

  // Update paid amount
  this.paidAmount = this.scheduledPayments
    .filter((p: any) => p.status === "paid")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  this.remainingAmount = this.totalAmount - this.paidAmount;

  return this.save();
};

export const PaymentScheduleModel = mongoose.model<PaymentScheduleDocument>(
  "PaymentSchedule",
  PaymentScheduleSchema
);
