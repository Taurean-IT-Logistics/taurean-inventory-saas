import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { NewsletterSubscriptionModel } from "../models/newsletterSubscription.model";
import { generateToken } from "../utils/token";

export interface NewsletterUnsubscribeResult {
  success: boolean;
  companyId?: string;
  resubscribeToken?: string;
  error?: string;
}

export interface NewsletterResubscribeResult {
  success: boolean;
  companyId?: string;
  error?: string;
}

export interface NewsletterVerificationResult {
  success: boolean;
  email?: string;
  companyName?: string;
  unsubscribeDate?: Date;
  error?: string;
}

export class NewsletterService {
  // Unsubscribe from newsletter
  static async unsubscribe(
    email: string,
    reason?: string
  ): Promise<NewsletterUnsubscribeResult> {
    try {
      // Find user by email
      const user = await UserModel.findOne({ email }).populate("company").lean();
      
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      const company = user.company as any;
      const companyId = company?._id?.toString();

      // Create or update newsletter subscription record
      const subscription = await NewsletterSubscriptionModel.findOneAndUpdate(
        { email },
        {
          email,
          userId: user._id,
          companyId,
          isSubscribed: false,
          unsubscribeReason: reason || "User requested unsubscribe",
          unsubscribeDate: new Date(),
          resubscribeToken: generateToken(32),
        },
        { upsert: true, new: true }
      );

      return {
        success: true,
        companyId,
        resubscribeToken: subscription.resubscribeToken,
      };
    } catch (error: any) {
      console.error("Newsletter unsubscribe error:", error);
      return {
        success: false,
        error: error.message || "Failed to unsubscribe",
      };
    }
  }

  // Resubscribe to newsletter
  static async resubscribe(
    email: string,
    token: string
  ): Promise<NewsletterResubscribeResult> {
    try {
      // Find subscription by email and token
      const subscription = await NewsletterSubscriptionModel.findOne({
        email,
        resubscribeToken: token,
      });

      if (!subscription) {
        return {
          success: false,
          error: "Invalid resubscribe token",
        };
      }

      // Update subscription
      subscription.isSubscribed = true;
      subscription.resubscribeDate = new Date();
      subscription.resubscribeToken = generateToken(32); // Generate new token
      await subscription.save();

      return {
        success: true,
        companyId: subscription.companyId?.toString(),
      };
    } catch (error: any) {
      console.error("Newsletter resubscribe error:", error);
      return {
        success: false,
        error: error.message || "Failed to resubscribe",
      };
    }
  }

  // Verify unsubscribe token
  static async verifyUnsubscribeToken(
    token: string
  ): Promise<NewsletterVerificationResult> {
    try {
      // Find subscription by resubscribe token
      const subscription = await NewsletterSubscriptionModel.findOne({
        resubscribeToken: token,
      });

      if (!subscription) {
        return {
          success: false,
          error: "Invalid token",
        };
      }

      // Get company name if available
      let companyName = "Unknown Company";
      if (subscription.companyId) {
        const company = await CompanyModel.findById(subscription.companyId).lean();
        if (company) {
          companyName = company.name;
        }
      }

      return {
        success: true,
        email: subscription.email,
        companyName,
        unsubscribeDate: subscription.unsubscribeDate,
      };
    } catch (error: any) {
      console.error("Newsletter token verification error:", error);
      return {
        success: false,
        error: error.message || "Failed to verify token",
      };
    }
  }

  // Check if user is subscribed
  static async isSubscribed(email: string): Promise<boolean> {
    try {
      const subscription = await NewsletterSubscriptionModel.findOne({ email });
      return subscription ? subscription.isSubscribed : true; // Default to true if no record
    } catch (error) {
      console.error("Newsletter subscription check error:", error);
      return true; // Default to true on error
    }
  }
}