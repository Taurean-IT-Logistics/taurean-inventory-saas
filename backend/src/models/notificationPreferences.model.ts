import { Schema, model, Document, Types } from "mongoose";

interface INotificationPreferences extends Document {
  user: Types.ObjectId;
  email: boolean;
  push: boolean;
  sms: boolean;
  bookingNotifications: boolean;
  paymentNotifications: boolean;
  systemNotifications: boolean;
  marketingNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
    bookingNotifications: {
      type: Boolean,
      default: true,
    },
    paymentNotifications: {
      type: Boolean,
      default: true,
    },
    systemNotifications: {
      type: Boolean,
      default: true,
    },
    marketingNotifications: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationPreferencesSchema.index({ user: 1 });

export const NotificationPreferencesModel = model<INotificationPreferences>(
  "NotificationPreferences",
  NotificationPreferencesSchema
);

export { INotificationPreferences };
