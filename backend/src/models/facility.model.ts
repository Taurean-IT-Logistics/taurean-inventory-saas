import { Schema, Model, Document, model } from "mongoose";
import { Facility } from "../types";

export interface FacilityDocument extends Document, Facility {}

const FacilitySchema = new Schema<FacilityDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    images: [
      {
        path: { type: String, required: true },
        originalName: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
      },
    ],
    terms: { type: String, trim: true },
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
        reason: { type: String, trim: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
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
        amount: { type: Number, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    rating: {
      average: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        booking: { type: Schema.Types.ObjectId, ref: "Booking" },
        rating: { type: Number, required: true },
        comment: { type: String, trim: true },
        isVerified: { type: Boolean, default: false },
        updatedAt: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    capacity: {
      maximum: { type: Number, required: true },
      recommended: { type: Number, required: true },
    },
    amenities: [{ type: String }],
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

export const FacilityModel = model<FacilityDocument>(
  "Facility",
  FacilitySchema
);
