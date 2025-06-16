import { Schema, model, Model, Document } from "mongoose";
import { Facility } from "../types";

interface FacilityDocument extends Document, Facility {}

const FacilitySchema = new Schema<FacilityDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    terms: { type: String },
    availability: [
      {
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    pricing: [
      {
        unit: {
          type: String,
          enum: ["hour", "day", "week", "month"],
          required: true,
        },
        amount: { type: Number, required: true },
      },
    ],
    rating: {
      average: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

const FacilityModel: Model<FacilityDocument> = model(
  "Facility",
  FacilitySchema
);

export { FacilityDocument, FacilityModel };
