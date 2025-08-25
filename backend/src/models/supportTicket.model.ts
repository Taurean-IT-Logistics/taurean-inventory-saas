import mongoose, { Schema, Document } from "mongoose";
import { CounterModel } from "./counter.model";

export interface ISupportTicket extends Document {
  ticketNumber: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category:
    | "technical"
    | "billing"
    | "feature_request"
    | "bug_report"
    | "general";
  ticketType?: "general" | "company";
  company?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  isDeleted: boolean;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: {
      type: String,
      // required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: [
        "technical",
        "billing",
        "feature_request",
        "bug_report",
        "general",
      ],
      default: "general",
    },
    ticketType: {
      type: String,
      enum: ["general", "company"],
      default: "general",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: false, // Allow general tickets without company
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
    closedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate ticket number before saving
supportTicketSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "ticketNumber" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      this.ticketNumber = `TICKET-${String(counter.sequenceValue).padStart(
        6,
        "0"
      )}`;
    } catch (error: any) {
      console.error("Error generating ticket number:", error);
      return next(error);
    }
  }
  next();
});

export const SupportTicketModel = mongoose.model<ISupportTicket>(
  "SupportTicket",
  supportTicketSchema
);
