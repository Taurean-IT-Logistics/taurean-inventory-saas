import { Schema, model, Model, Document, Types } from "mongoose";

interface NewsletterSubscription {
  email: string;
  userId?: Types.ObjectId;
  companyId?: Types.ObjectId;
  isSubscribed: boolean;
  unsubscribeReason?: string;
  unsubscribeDate?: Date;
  resubscribeDate?: Date;
  resubscribeToken: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NewsletterSubscriptionDocument extends Document, NewsletterSubscription {}

const NewsletterSubscriptionSchema = new Schema<NewsletterSubscriptionDocument>(
  {
    email: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    isSubscribed: { type: Boolean, default: true },
    unsubscribeReason: { type: String },
    unsubscribeDate: { type: Date },
    resubscribeDate: { type: Date },
    resubscribeToken: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes
NewsletterSubscriptionSchema.index({ email: 1 });
NewsletterSubscriptionSchema.index({ userId: 1 });
NewsletterSubscriptionSchema.index({ companyId: 1 });
NewsletterSubscriptionSchema.index({ isSubscribed: 1 });
NewsletterSubscriptionSchema.index({ resubscribeToken: 1 });

const NewsletterSubscriptionModel: Model<NewsletterSubscriptionDocument> = model(
  "NewsletterSubscription",
  NewsletterSubscriptionSchema
);

export { NewsletterSubscriptionDocument, NewsletterSubscriptionModel };