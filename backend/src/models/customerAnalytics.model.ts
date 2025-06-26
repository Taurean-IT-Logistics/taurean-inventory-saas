import { Schema, Model, model, Document } from "mongoose";
import { CustomerAnalytics } from "../types";

interface CustomerAnalyticsDocument extends Document, CustomerAnalytics {}

const CustomerAnalyticsSchema = new Schema<CustomerAnalyticsDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    behaviorPattern: {
      preferredTimeSlots: [{ type: String }],
      preferredDays: [{ type: String }],
      averageBookingDuration: { type: Number, default: 0 },
      preferredFacilities: [{ type: Schema.Types.ObjectId, ref: "Facility" }],
      bookingFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "occasional"],
        default: "occasional",
      },
    },
    financialProfile: {
      totalSpent: { type: Number, default: 0 },
      averageBookingValue: { type: Number, default: 0 },
      paymentPreference: {
        type: String,
        enum: ["cash", "mobile_money", "bank", "card"],
      },
      creditScore: { type: Number, default: 0, min: 0, max: 100 },
    },
    loyaltyMetrics: {
      totalBookings: { type: Number, default: 0 },
      cancellationRate: { type: Number, default: 0, min: 0, max: 100 },
      noShowRate: { type: Number, default: 0, min: 0, max: 100 },
      lastBookingDate: { type: Date },
      loyaltyTier: {
        type: String,
        enum: ["bronze", "silver", "gold", "platinum"],
        default: "bronze",
      },
      pointsEarned: { type: Number, default: 0 },
      pointsRedeemed: { type: Number, default: 0 },
    },
    recommendations: {
      suggestedFacilities: [{ type: Schema.Types.ObjectId, ref: "Facility" }],
      suggestedTimeSlots: [{ type: String }],
      personalizedOffers: [
        {
          type: { type: String, required: true },
          discount: { type: Number, required: true, min: 0, max: 100 },
          validUntil: { type: Date, required: true },
          used: { type: Boolean, default: false },
        },
      ],
    },
    insights: {
      isHighValueCustomer: { type: Boolean, default: false },
      churnRisk: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
      },
      nextBookingPrediction: { type: Date },
      lifetimeValue: { type: Number, default: 0 },
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

// Indexes
CustomerAnalyticsSchema.index({ user: 1 });
CustomerAnalyticsSchema.index({ "insights.isHighValueCustomer": 1 });
CustomerAnalyticsSchema.index({ "insights.churnRisk": 1 });

const CustomerAnalyticsModel: Model<CustomerAnalyticsDocument> = model(
  "CustomerAnalytics",
  CustomerAnalyticsSchema
);

export { CustomerAnalyticsDocument, CustomerAnalyticsModel };
