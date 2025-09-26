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
  },
  { timestamps: true }
);

const RentalModel: Model<RentalDocument> = model("Rental", RentalSchema);

export { RentalDocument, RentalModel };
