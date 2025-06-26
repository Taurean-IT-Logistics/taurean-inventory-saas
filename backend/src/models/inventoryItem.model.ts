import { Schema, model, Model, Document } from "mongoose";
import { InventoryItem } from "../types";

interface InventoryItemDocument extends Document, InventoryItem {}

const InventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    images: [
      {
        path: { type: String, required: true },
        originalName: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
      },
    ],
    sku: { type: String, unique: true, sparse: true },
    quantity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["in_stock", "rented", "unavailable", "maintenance", "retired"],
      default: "in_stock",
    },
    associatedFacility: { type: Schema.Types.ObjectId, ref: "Facility" },
    category: { type: String, required: true, trim: true },
    purchaseInfo: {
      purchaseDate: { type: Date },
      purchasePrice: { type: Number, min: 0 },
      supplier: { type: String, trim: true },
      warrantyExpiry: { type: Date },
    },
    history: [
      {
        date: { type: Date, default: Date.now },
        change: { type: Number, required: true },
        reason: { type: String, required: true, trim: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        notes: { type: String, trim: true },
      },
    ],
    maintenanceSchedule: [
      {
        scheduledDate: { type: Date, required: true },
        type: {
          type: String,
          enum: ["cleaning", "repair", "inspection", "calibration"],
          required: true,
        },
        completed: { type: Boolean, default: false },
        completedDate: { type: Date },
        cost: { type: Number, min: 0 },
        notes: { type: String, trim: true },
        performedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    currentBookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    specifications: { type: Map, of: Schema.Types.Mixed },
    alerts: {
      lowStock: { type: Boolean, default: false },
      maintenanceDue: { type: Boolean, default: false },
      warrantyExpiring: { type: Boolean, default: false },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
InventoryItemSchema.index({ name: 1 });
InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ category: 1 });
InventoryItemSchema.index({ associatedFacility: 1 });

const InventoryItemModel: Model<InventoryItemDocument> = model(
  "InventoryItem",
  InventoryItemSchema
);

export { InventoryItemDocument, InventoryItemModel };
