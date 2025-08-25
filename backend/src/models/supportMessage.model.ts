import mongoose, { Schema, Document } from "mongoose";

export interface ISupportMessage extends Document {
  ticket: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderType: "user" | "staff" | "system";
  message: string;
  messageType: "text" | "file" | "image";
  attachments?: string[];
  isRead: boolean;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  isDeleted: boolean;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["user", "staff", "system"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "file", "image"],
      default: "text",
    },
    attachments: [
      {
        type: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
supportMessageSchema.index({ ticket: 1, createdAt: 1 });
supportMessageSchema.index({ sender: 1 });
supportMessageSchema.index({ isRead: 1 });

export const SupportMessageModel = mongoose.model<ISupportMessage>(
  "SupportMessage",
  supportMessageSchema
);
