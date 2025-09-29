import mongoose, { Document, Schema } from "mongoose";

export interface INotificationLog extends Document {
  userId: string;
  companyId: string;
  notificationType: string;
  category: "rental" | "booking" | "maintenance" | "system";
  sentAt: Date;
  deliveryStatus: "pending" | "sent" | "failed" | "retry";
  inAppSent: boolean;
  emailSent: boolean;
  emailStatus?: "pending" | "sent" | "failed" | "bounced";
  retryCount: number;
  lastRetryAt?: Date;
  nextRetryAt?: Date;
  maxRetries: number;
  errorMessage?: string;
  data: any;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    notificationType: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["rental", "booking", "maintenance", "system"],
      required: true,
      index: true,
    },
    sentAt: {
      type: Date,
      required: true,
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "failed", "retry"],
      default: "pending",
      index: true,
    },
    inAppSent: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed", "bounced"],
      default: "pending",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastRetryAt: {
      type: Date,
    },
    nextRetryAt: {
      type: Date,
      index: true,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    errorMessage: {
      type: String,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
NotificationLogSchema.index({ userId: 1, notificationType: 1, sentAt: 1 });
NotificationLogSchema.index({ companyId: 1, category: 1, sentAt: 1 });
NotificationLogSchema.index({ deliveryStatus: 1, nextRetryAt: 1 });
NotificationLogSchema.index({ emailStatus: 1, retryCount: 1 });

export const NotificationLogModel = mongoose.model<INotificationLog>(
  "NotificationLog",
  NotificationLogSchema
);
