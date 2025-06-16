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
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const BookingModel: Model<BookingDocument> = model("Booking", BookingSchema);

export { BookingDocument, BookingModel };
