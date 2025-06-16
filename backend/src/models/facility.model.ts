import { Schema, model, Model, Document } from "mongoose";
import { Facility } from "../types";

interface FacilityDocument extends Document, Facility {}

const FacilitySchema = new Schema<FacilityDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    images: [{ type: String }],
    terms: { type: String },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: true,
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    blockedDates: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    pricing: [
      {
        unit: {
          type: String,
          enum: ["hour", "day", "week", "month"],
          required: true,
        },
        amount: { type: Number, required: true, min: 0 },
        isDefault: { type: Boolean, default: false },
      },
    ],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        booking: {
          type: Schema.Types.ObjectId,
          ref: "Booking",
          required: true,
        },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true },
        isVerified: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    capacity: {
      maximum: { type: Number, required: true, min: 1 },
      recommended: { type: Number, required: true, min: 1 },
    },
    amenities: [{ type: String, trim: true }],
    location: {
      address: { type: String, trim: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    operationalHours: {
      opening: { type: String, required: true },
      closing: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexes
FacilitySchema.index({ name: 1 });
FacilitySchema.index({ isActive: 1, isDeleted: 1 });
FacilitySchema.index({ "rating.average": -1 });
FacilitySchema.index({ createdBy: 1 });

const FacilityModel: Model<FacilityDocument> = model(
  "Facility",
  FacilitySchema
);

export { FacilityDocument, FacilityModel };
