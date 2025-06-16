import { Schema, Model, model, Document } from "mongoose";
import { SystemAlert } from "../types";

interface SystemAlertDocument extends Document, SystemAlert {}

const SystemAlertSchema = new Schema<SystemAlertDocument>(
  {
    type: {
      type: String,
      enum: [
        "overbooking",
        "maintenance_due",
        "low_inventory",
        "payment_failed",
        "high_churn_risk",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    relatedEntity: {
      type: {
        type: String,
        enum: ["facility", "booking", "user", "inventory", "transaction"],
        required: true,
      },
      id: { type: Schema.Types.ObjectId, required: true },
    },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
    actionTaken: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
SystemAlertSchema.index({ isRead: 1, createdAt: -1 });
SystemAlertSchema.index({ isResolved: 1, severity: 1 });
SystemAlertSchema.index({ type: 1 });

const SystemAlertModel: Model<SystemAlertDocument> = model<SystemAlertDocument>(
  "SystemAlert",
  SystemAlertSchema
);

export { SystemAlertModel, SystemAlertDocument };
