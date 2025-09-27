import { Schema, model, Model, Document } from "mongoose";
import { Rental } from "../types";

interface RentalDocument extends Document, Rental {}

const RentalSchema = new Schema<RentalDocument>(
  {
    item: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
    quantity: { type: Number, required: true },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date },
    amount: { type: Number, required: true },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    notes: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    status: { 
      type: String, 
      enum: ["active", "returned", "overdue", "cancelled"], 
      default: "active" 
    },
    returnDate: { type: Date },
    returnCondition: { 
      type: String, 
      enum: ["good", "fair", "damaged"] 
    },
    returnNotes: { type: String },
    lateFee: { type: Number, default: 0 },
    damageFee: { type: Number, default: 0 },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for better performance
RentalSchema.index({ user: 1, status: 1, createdAt: -1 });
RentalSchema.index({ item: 1, status: 1 });
RentalSchema.index({ company: 1, status: 1, createdAt: -1 });
RentalSchema.index({ endDate: 1, status: 1 });
RentalSchema.index({ status: 1, isDeleted: 1 });

const RentalModel: Model<RentalDocument> = model("Rental", RentalSchema);

export { RentalDocument, RentalModel };
