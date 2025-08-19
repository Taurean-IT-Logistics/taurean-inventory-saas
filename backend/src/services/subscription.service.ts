import { CompanyModel } from "../models/company.model";
import crypto from "crypto";

// Enhanced plans with features and free trial support
const plans = [
  {
    id: "free_trial",
    label: "Free Trial",
    durationDays: 14,
    price: 0,
    features: {
      maxFacilities: 2,
      maxUsers: 3,
      maxInventoryItems: 50,
      maxBookings: 100,
      support: "email",
      analytics: "basic",
      apiAccess: false,
      customBranding: false,
      whiteLabel: false,
      dedicatedSupport: false,
      customIntegrations: false,
      slaGuarantee: false,
      training: false,
    },
    description: "Perfect for trying out our platform",
    popular: false,
    isTrial: true,
  },
  {
    id: "monthly",
    label: "Monthly",
    durationDays: 30,
    price: 99,
    features: {
      maxFacilities: 10,
      maxUsers: 10,
      maxInventoryItems: 500,
      maxBookings: 1000,
      support: "email",
      analytics: "standard",
      apiAccess: false,
      customBranding: false,
      whiteLabel: false,
      dedicatedSupport: false,
      customIntegrations: false,
      slaGuarantee: false,
      training: false,
    },
    description: "Perfect for small businesses and startups",
    popular: false,
    isTrial: false,
  },
  {
    id: "biannual",
    label: "Bi-Annual",
    durationDays: 182,
    price: 499,
    features: {
      maxFacilities: 25,
      maxUsers: 25,
      maxInventoryItems: 2000,
      maxBookings: 5000,
      support: "priority",
      analytics: "advanced",
      apiAccess: true,
      customBranding: true,
      whiteLabel: false,
      dedicatedSupport: false,
      customIntegrations: false,
      slaGuarantee: false,
      training: false,
    },
    description: "Great value for growing businesses",
    popular: true,
    isTrial: false,
  },
  {
    id: "annual",
    label: "Annual",
    durationDays: 365,
    price: 899,
    features: {
      maxFacilities: 50,
      maxUsers: 50,
      maxInventoryItems: 10000,
      maxBookings: 25000,
      support: "24/7_priority",
      analytics: "advanced_ai",
      apiAccess: true,
      customBranding: true,
      whiteLabel: true,
      dedicatedSupport: true,
      customIntegrations: false,
      slaGuarantee: false,
      training: true,
    },
    description: "Best value for established businesses",
    popular: false,
    isTrial: false,
  },
  {
    id: "triannual",
    label: "Tri-Annual",
    durationDays: 365 * 3,
    price: 2399,
    features: {
      maxFacilities: -1, // Unlimited
      maxUsers: -1, // Unlimited
      maxInventoryItems: -1, // Unlimited
      maxBookings: -1, // Unlimited
      support: "24/7_dedicated",
      analytics: "enterprise_ai",
      apiAccess: true,
      customBranding: true,
      whiteLabel: true,
      dedicatedSupport: true,
      customIntegrations: true,
      slaGuarantee: true,
      training: true,
    },
    description: "Ultimate value for enterprise businesses",
    popular: false,
    isTrial: false,
  },
];

function generateLicenseKey(companyId: string): string {
  const nonce = crypto.randomBytes(8).toString("hex");
  return `${companyId.slice(-6)}-${nonce}`.toUpperCase();
}

export class SubscriptionService {
  // Get all available plans
  static getPlans() {
    return plans;
  }

  // Get plan by ID
  static getPlanById(planId: string) {
    return plans.find((plan) => plan.id === planId);
  }

  // Start free trial
  static async startFreeTrial(companyId: string) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      // Check if company has already used free trial
      if (company.subscription?.hasUsedTrial) {
        throw new Error("Free trial has already been used");
      }

      const trialPlan = this.getPlanById("free_trial");
      if (!trialPlan) {
        throw new Error("Free trial plan not found");
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + trialPlan.durationDays);

      const licenseKey = generateLicenseKey(companyId);

      company.subscription = {
        plan: "free_trial" as any,
        expiresAt,
        licenseKey,
        activatedAt: new Date(),
        status: "active",
        hasUsedTrial: true,
        isTrial: true,
      };

      // Activate the company
      company.isActive = true;

      await company.save();

      return company;
    } catch (error: any) {
      throw new Error(`Failed to start free trial: ${error.message}`);
    }
  }

  // Activate subscription automatically after successful payment
  static async activateSubscription(
    companyId: string,
    planId: string,
    paymentReference: string
  ) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      const plan = this.getPlanById(planId);
      if (!plan) {
        throw new Error("Invalid plan");
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

      const licenseKey = generateLicenseKey(companyId);

      company.subscription = {
        plan: planId as any,
        expiresAt,
        licenseKey,
        paymentReference,
        activatedAt: new Date(),
        status: "active",
        hasUsedTrial: company.subscription?.hasUsedTrial || false,
        isTrial: plan.isTrial,
      };

      // Activate the company
      company.isActive = true;

      await company.save();

      return company;
    } catch (error: any) {
      throw new Error(`Failed to activate subscription: ${error.message}`);
    }
  }

  // Check if company has active subscription
  static async hasActiveSubscription(companyId: string): Promise<boolean> {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company || !company.subscription) {
        return false;
      }

      const now = new Date();
      return company.subscription.expiresAt > now && company.isActive;
    } catch (error) {
      return false;
    }
  }

  // Get subscription status with detailed information
  static async getSubscriptionStatus(companyId: string) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company || !company.subscription) {
        return {
          hasSubscription: false,
          isActive: false,
          expiresAt: null,
          plan: null,
          features: null,
          daysRemaining: 0,
          canStartTrial: true,
        };
      }

      const now = new Date();
      const isActive = company.subscription.expiresAt > now && company.isActive;
      const plan = this.getPlanById(company.subscription.plan);

      return {
        hasSubscription: true,
        isActive,
        expiresAt: company.subscription.expiresAt,
        plan: plan
          ? {
              id: plan.id,
              label: plan.label,
              price: plan.price,
              durationDays: plan.durationDays,
              description: plan.description,
              popular: plan.popular,
              isTrial: plan.isTrial,
            }
          : null,
        features: plan?.features || null,
        daysRemaining: Math.ceil(
          (company.subscription.expiresAt.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        canStartTrial: !company.subscription.hasUsedTrial,
        isTrial: company.subscription.isTrial,
        hasUsedTrial: company.subscription.hasUsedTrial,
      };
    } catch (error) {
      return {
        hasSubscription: false,
        isActive: false,
        expiresAt: null,
        plan: null,
        features: null,
        daysRemaining: 0,
        canStartTrial: true,
      };
    }
  }

  // Check if company can access a specific feature
  static async canAccessFeature(
    companyId: string,
    feature: string
  ): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus(companyId);
      if (!status.hasSubscription || !status.isActive || !status.features) {
        return false;
      }

      const features = status.features;

      switch (feature) {
        case "facilities":
          return features.maxFacilities === -1 || features.maxFacilities > 0;
        case "users":
          return features.maxUsers === -1 || features.maxUsers > 0;
        case "inventory":
          return (
            features.maxInventoryItems === -1 || features.maxInventoryItems > 0
          );
        case "bookings":
          return features.maxBookings === -1 || features.maxBookings > 0;
        case "api":
          return features.apiAccess;
        case "customBranding":
          return features.customBranding;
        case "whiteLabel":
          return features.whiteLabel;
        case "dedicatedSupport":
          return features.dedicatedSupport;
        case "customIntegrations":
          return features.customIntegrations;
        case "slaGuarantee":
          return features.slaGuarantee;
        case "training":
          return features.training;
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Get usage statistics for a company
  static async getUsageStats(companyId: string) {
    try {
      const status = await this.getSubscriptionStatus(companyId);
      if (!status.hasSubscription || !status.features) {
        return null;
      }

      // This would typically query the database for actual usage
      // For now, returning placeholder data
      return {
        facilities: {
          used: 0, // Would be actual count from database
          limit: status.features.maxFacilities,
          unlimited: status.features.maxFacilities === -1,
        },
        users: {
          used: 0, // Would be actual count from database
          limit: status.features.maxUsers,
          unlimited: status.features.maxUsers === -1,
        },
        inventory: {
          used: 0, // Would be actual count from database
          limit: status.features.maxInventoryItems,
          unlimited: status.features.maxInventoryItems === -1,
        },
        bookings: {
          used: 0, // Would be actual count from database
          limit: status.features.maxBookings,
          unlimited: status.features.maxBookings === -1,
        },
      };
    } catch (error) {
      return null;
    }
  }

  // Renew subscription
  static async renewSubscription(
    companyId: string,
    planId: string,
    paymentReference: string
  ) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company || !company.subscription) {
        throw new Error("Company or subscription not found");
      }

      const plan = this.getPlanById(planId);
      if (!plan) {
        throw new Error("Invalid plan");
      }

      // Extend from current expiration date
      const currentExpiry = company.subscription.expiresAt;
      const newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + plan.durationDays);

      company.subscription.expiresAt = newExpiry;
      company.subscription.paymentReference = paymentReference;
      company.subscription.updatedAt = new Date();
      company.subscription.plan = planId as any;
      company.subscription.isTrial = plan.isTrial;

      await company.save();

      return company;
    } catch (error: any) {
      throw new Error(`Failed to renew subscription: ${error.message}`);
    }
  }

  // Cancel subscription
  static async cancelSubscription(companyId: string) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      company.subscription = undefined;
      company.isActive = false;

      await company.save();

      return company;
    } catch (error: any) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Upgrade subscription (change plan)
  static async upgradeSubscription(
    companyId: string,
    newPlanId: string,
    paymentReference: string
  ) {
    try {
      const company = await CompanyModel.findById(companyId);
      if (!company || !company.subscription) {
        throw new Error("Company or subscription not found");
      }

      const newPlan = this.getPlanById(newPlanId);
      if (!newPlan) {
        throw new Error("Invalid plan");
      }

      // Calculate prorated extension
      const now = new Date();
      const remainingDays = Math.ceil(
        (company.subscription.expiresAt.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const newExpiry = new Date();
      newExpiry.setDate(
        newExpiry.getDate() + newPlan.durationDays + remainingDays
      );

      company.subscription.expiresAt = newExpiry;
      company.subscription.plan = newPlanId as any;
      company.subscription.paymentReference = paymentReference;
      company.subscription.updatedAt = new Date();
      company.subscription.isTrial = newPlan.isTrial;

      await company.save();

      return company;
    } catch (error: any) {
      throw new Error(`Failed to upgrade subscription: ${error.message}`);
    }
  }
}
