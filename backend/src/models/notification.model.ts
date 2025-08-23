import { Schema, model, Model, Document } from "mongoose";
import { Notification } from "../types";

interface NotificationDocument extends Document, Notification {}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["info", "warning", "success", "error"], default: "info" },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ company: 1, createdAt: -1 });

export const NotificationModel: Model<NotificationDocument> = model<NotificationDocument>(
  "Notification",
  NotificationSchema
);

export { NotificationDocument };