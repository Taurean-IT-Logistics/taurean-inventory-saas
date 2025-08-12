import { Schema, model, Model, Document, Types } from "mongoose";

interface InvoiceLineItem {
  sku?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  duration?: number;
  durationPeriod?: "Hours" | "Days" | "Weeks" | "Months";
  amount: number; // computed: qty * unitPrice * duration?
  taxBreakdown?: { name: string; rate: number; amount: number }[]; // snapshot per line
}

interface AppliedTaxComponent { name: string; rate: number }

interface InvoiceDocument extends Document {
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
  customer?: Types.ObjectId; // user
  invoiceNumber: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  currency: string;
  lines: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  payment: {
    method?: "cash" | "mobile_money" | "card";
    provider?: "mtn" | "vodafone" | "airteltigo" | "telecel" | "visa" | "mastercard" | "unknown";
    status?: "paid" | "pending" | "failed";
    timestamp?: Date;
    reference?: string; // Paystack reference only
  };
  scheduleSnapshot?: {
    name: string;
    components: AppliedTaxComponent[];
    taxOnTax: boolean;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceLineItemSchema = new Schema<InvoiceLineItem>({
  sku: { type: String },
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  duration: { type: Number, min: 0 },
  durationPeriod: { type: String, enum: ["Hours", "Days", "Weeks", "Months"] },
  amount: { type: Number, required: true, min: 0 },
  taxBreakdown: [{ name: String, rate: Number, amount: Number }],
});

const InvoiceSchema = new Schema<InvoiceDocument>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    invoiceNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending" },
    currency: { type: String, required: true },
    lines: { type: [InvoiceLineItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    payment: {
      method: { type: String, enum: ["cash", "mobile_money", "card"] },
      provider: { type: String, enum: ["mtn", "vodafone", "airteltigo", "telecel", "visa", "mastercard", "unknown"] },
      status: { type: String, enum: ["paid", "pending", "failed"] },
      timestamp: { type: Date },
      reference: { type: String },
    },
    scheduleSnapshot: {
      name: { type: String },
      components: [{ name: String, rate: Number }],
      taxOnTax: { type: Boolean, default: false },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InvoiceSchema.index({ company: 1, createdAt: -1 });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

export const InvoiceModel: Model<InvoiceDocument> = model<InvoiceDocument>(
  "Invoice",
  InvoiceSchema
);

export { InvoiceDocument, InvoiceLineItem };