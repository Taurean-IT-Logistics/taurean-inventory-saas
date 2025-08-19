import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
  ticketNumber: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category:
    | "technical"
    | "billing"
    | "feature_request"
    | "bug_report"
    | "general";
  company: mongoose.Types.ObjectId;
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
      required: true,
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
      enum: ["open", "in_progress", "resolved", "closed"],
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
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
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
    const count = await mongoose.model("SupportTicket").countDocuments();
    this.ticketNumber = `TICKET-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

export const SupportTicketModel = mongoose.model<ISupportTicket>(
  "SupportTicket",
  supportTicketSchema
);
