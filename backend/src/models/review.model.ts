import { Schema, model, Document } from "mongoose";

export interface IReview extends Document {
  user: Schema.Types.ObjectId;
  facility: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  isVerified: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    facility: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ user: 1, facility: 1 }, { unique: true }); // Ensure one review per user per facility

export const ReviewModel = model<IReview>("Review", ReviewSchema);

