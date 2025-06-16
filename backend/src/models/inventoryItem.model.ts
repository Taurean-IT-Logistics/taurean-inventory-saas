import { Schema, model, Model, Document } from "mongoose";
import { InventoryItem } from "../types";

interface InventoryItemDocument extends Document, InventoryItem {}

const InventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["in_stock", "rented", "unavailable"],
      required: true,
    },
    associatedFacility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    history: [
      {
        date: { type: Date, required: true },
        change: { type: Number, required: true },
        reason: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
  },
  { timestamps: true }
);

const InventoryItemModel: Model<InventoryItemDocument> = model(
  "InventoryItem",
  InventoryItemSchema
);

export { InventoryItemDocument, InventoryItemModel };
