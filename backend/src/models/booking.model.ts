import { Schema, model, Model, Document } from "mongoose";
import { Booking } from "../types";

interface BookingDocument extends Document, Booking {}

const BookingSchema = new Schema<BookingDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    facility: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "partial_refund"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true, min: 0 },
    discount: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
      },
      value: { type: Number, min: 0 },
      reason: { type: String },
      appliedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    paymentDetails: {
      paystackReference: { type: String },
      transactionId: { type: String },
      paidAmount: { type: Number, default: 0, min: 0 },
      paymentMethod: {
        type: String,
        enum: ["cash", "mobile_money", "bank", "card"],
      },
      paidAt: { type: Date },
    },
    checkIn: {
      time: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
      notes: { type: String },
    },
    checkOut: {
      time: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
      condition: {
        type: String,
        enum: ["good", "fair", "damaged"],
      },
      notes: { type: String },
      damageReport: { type: String },
    },
    cancellation: {
      reason: { type: String },
      cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
      cancelledAt: { type: Date },
      refundAmount: { type: Number, min: 0 },
    },
    notes: { type: String, trim: true },
    internalNotes: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
BookingSchema.index({ user: 1, startDate: -1 });
BookingSchema.index({ facility: 1, startDate: 1 });
BookingSchema.index({ status: 1, paymentStatus: 1 });
BookingSchema.index({ startDate: 1, endDate: 1 });

const BookingModel: Model<BookingDocument> = model("Booking", BookingSchema);

export { BookingDocument, BookingModel };
