import mongoose, { Document, Schema } from "mongoose";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tax?: number;
  taxRate?: number;
}

export interface InvoiceDocument extends Document {
  invoiceNumber: string;
  company: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  transaction?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  facility?: mongoose.Types.ObjectId;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  notes?: string;
  terms?: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    taxId?: string;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<InvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
});

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      index: true,
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "GHS",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft",
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    notes: {
      type: String,
    },
    terms: {
      type: String,
    },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String },
    },
    companyInfo: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      logo: { type: String },
      taxId: { type: String },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
invoiceSchema.index({ company: 1, status: 1 });
invoiceSchema.index({ company: 1, createdAt: -1 });
invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });

// Virtual for calculating days overdue
invoiceSchema.virtual("daysOverdue").get(function () {
  if (this.status === "paid" || this.status === "cancelled") return 0;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Pre-save middleware to update status based on due date
invoiceSchema.pre("save", function (next) {
  if (this.isModified("dueDate") || this.isModified("status")) {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    
    if (this.status !== "paid" && this.status !== "cancelled") {
      if (today > dueDate) {
        this.status = "overdue";
      } else if (this.status === "overdue" && today <= dueDate) {
        this.status = "sent";
      }
    }
  }
  next();
});

export const InvoiceModel = mongoose.model<InvoiceDocument>("Invoice", invoiceSchema);