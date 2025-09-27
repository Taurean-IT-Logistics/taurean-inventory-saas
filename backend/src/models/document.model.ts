import { Schema, model, Model, Document, Types } from "mongoose";

export interface DocumentFile {
  company: string | Types.ObjectId;
  name: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  category: "invoice" | "receipt" | "contract" | "license" | "other";
  description?: string;
  tags: string[];
  uploadedBy: string | Types.ObjectId;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentFileDocument extends Document, DocumentFile {}

const DocumentFileSchema = new Schema<DocumentFileDocument>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["invoice", "receipt", "contract", "license", "other"],
      required: true,
    },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for better performance
DocumentFileSchema.index({ company: 1, category: 1, createdAt: -1 });
DocumentFileSchema.index({ uploadedBy: 1, createdAt: -1 });
DocumentFileSchema.index({ tags: 1 });
DocumentFileSchema.index({ isPublic: 1, isDeleted: 1 });

const DocumentFileModel: Model<DocumentFileDocument> =
  model<DocumentFileDocument>("DocumentFile", DocumentFileSchema);

export { DocumentFileDocument, DocumentFileModel };
