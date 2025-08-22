import { Request, Response } from "express";
import { sendSuccess, sendError, sendValidationError } from "../utils";
import { SubscriptionService } from "../services/subscription.service";
import { initializePayment, verifyPayment } from "../services/payment.service";

// Start free trial
export async function startFreeTrial(req: Request, res: Response) {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      sendValidationError(res, "Company ID is required");
      return;
    }

    const company = await SubscriptionService.startFreeTrial(companyId);

    sendSuccess(res, "Free trial started successfully", {
      company: {
        id: company._id,
        name: company.name,
        subscription: company.subscription,
      },
    });
  } catch (error: any) {
    sendError(res, "Failed to start free trial", error.message);
  }
}

// Initialize subscription payment
export async function initializeSubscriptionPayment(
  req: Request,
  res: Response
) {
  try {
    const { companyId, planId, email } = req.body;

    if (!companyId || !planId || !email) {
      sendValidationError(res, "Company ID, plan ID, and email are required");
      return;
    }

    const plan = SubscriptionService.getPlanById(planId);
    if (!plan) {
      sendValidationError(res, "Invalid plan selected");
      return;
    }

    // Initialize payment with Paystack
    const paymentData = {
      email,
      amount: plan.price * 100, // Convert to kobo/pesewas
      currency: "NGN",
      metadata: {
        full_name: "Company Subscription", // Add required full_name
        companyId,
        planId,
        type: "subscription",
        planName: plan.label,
        durationDays: plan.durationDays,
      },
    };

    const paymentResponse = await initializePayment(paymentData, { companyId });

    sendSuccess(res, "Subscription payment initialized", {
      payment: paymentResponse.data,
      plan: {
        id: plan.id,
        label: plan.label,
        price: plan.price,
        durationDays: plan.durationDays,
        features: plan.features,
        description: plan.description,
        popular: plan.popular,
        isTrial: plan.isTrial,
      },
    });
  } catch (error: any) {
    sendError(res, "Failed to initialize subscription payment", error.message);
  }
}

// Verify subscription payment and activate license
export async function verifySubscriptionPayment(req: Request, res: Response) {
  try {
    const { reference } = req.body;

    if (!reference) {
      sendValidationError(res, "Payment reference is required");
      return;
    }

    // Verify payment with Paystack
    const verificationResponse = await verifyPayment(reference);

    if (verificationResponse.data.status !== "success") {
      sendError(
        res,
        "Payment verification failed",
        "Payment was not successful"
      );
      return;
    }

    // Extract metadata from payment
    const metadata = verificationResponse.data.metadata;
    const { companyId, planId } = metadata;

    if (!companyId || !planId) {
      sendError(
        res,
        "Invalid payment metadata",
        "Missing company or plan information"
      );
      return;
    }

    // Activate subscription automatically
    const company = await SubscriptionService.activateSubscription(
      companyId,
      planId,
      reference
    );

    sendSuccess(res, "Subscription activated successfully", {
      company: {
        id: company._id,
        name: company.name,
        subscription: company.subscription,
      },
      payment: {
        reference,
        amount: verificationResponse.data.amount / 100,
        status: verificationResponse.data.status,
      },
    });
  } catch (error: any) {
    sendError(res, "Failed to verify subscription payment", error.message);
  }
}

// Get subscription plans
export async function getSubscriptionPlans(req: Request, res: Response) {
  try {
    const plans = SubscriptionService.getPlans();
    sendSuccess(res, "Subscription plans retrieved", { plans });
  } catch (error: any) {
    sendError(res, "Failed to retrieve subscription plans", error.message);
  }
}

// Get company subscription status
export async function getCompanySubscriptionStatus(
  req: Request,
  res: Response
) {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      sendValidationError(res, "Company ID is required");
      return;
    }

    const status = await SubscriptionService.getSubscriptionStatus(companyId);
    const usageStats = await SubscriptionService.getUsageStats(companyId);

    sendSuccess(res, "Subscription status retrieved", {
      status,
      usageStats,
    });
  } catch (error: any) {
    sendError(res, "Failed to retrieve subscription status", error.message);
  }
}

// Check feature access
export async function checkFeatureAccess(req: Request, res: Response) {
  try {
    const { companyId, feature } = req.params;

    if (!companyId || !feature) {
      sendValidationError(res, "Company ID and feature are required");
      return;
    }

    const canAccess = await SubscriptionService.canAccessFeature(
      companyId,
      feature
    );

    sendSuccess(res, "Feature access checked", {
      feature,
      canAccess,
    });
  } catch (error: any) {
    sendError(res, "Failed to check feature access", error.message);
  }
}

// Get usage statistics
export async function getUsageStatistics(req: Request, res: Response) {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      sendValidationError(res, "Company ID is required");
      return;
    }

    const usageStats = await SubscriptionService.getUsageStats(companyId);

    sendSuccess(res, "Usage statistics retrieved", { usageStats });
  } catch (error: any) {
    sendError(res, "Failed to retrieve usage statistics", error.message);
  }
}

// Renew subscription
export async function renewSubscription(req: Request, res: Response) {
  try {
    const { companyId, planId, email } = req.body;

    if (!companyId || !planId || !email) {
      sendValidationError(res, "Company ID, plan ID, and email are required");
      return;
    }

    const plan = SubscriptionService.getPlanById(planId);
    if (!plan) {
      sendValidationError(res, "Invalid plan selected");
      return;
    }

    // Initialize payment for renewal
    const paymentData = {
      email,
      amount: plan.price * 100,
      currency: "NGN",
      metadata: {
        full_name: "Company Subscription Renewal", // Add required full_name
        companyId,
        planId,
        type: "subscription_renewal",
        planName: plan.label,
        durationDays: plan.durationDays,
      },
    };

    const paymentResponse = await initializePayment(paymentData, { companyId });

    sendSuccess(res, "Subscription renewal payment initialized", {
      payment: paymentResponse.data,
      plan: {
        id: plan.id,
        label: plan.label,
        price: plan.price,
        durationDays: plan.durationDays,
        features: plan.features,
        description: plan.description,
        popular: plan.popular,
        isTrial: plan.isTrial,
      },
    });
  } catch (error: any) {
    sendError(
      res,
      "Failed to initialize subscription renewal payment",
      error.message
    );
  }
}

// Upgrade subscription
export async function upgradeSubscription(req: Request, res: Response) {
  try {
    const { companyId, newPlanId, email } = req.body;

    if (!companyId || !newPlanId || !email) {
      sendValidationError(
        res,
        "Company ID, new plan ID, and email are required"
      );
      return;
    }

    const plan = SubscriptionService.getPlanById(newPlanId);
    if (!plan) {
      sendValidationError(res, "Invalid plan selected");
      return;
    }

    // Initialize payment for upgrade
    const paymentData = {
      email,
      amount: plan.price * 100,
      currency: "NGN",
      metadata: {
        full_name: "Company Subscription Upgrade", // Add required full_name
        companyId,
        planId: newPlanId,
        type: "subscription_upgrade",
        planName: plan.label,
        durationDays: plan.durationDays,
      },
    };

    const paymentResponse = await initializePayment(paymentData, { companyId });

    sendSuccess(res, "Subscription upgrade payment initialized", {
      payment: paymentResponse.data,
      plan: {
        id: plan.id,
        label: plan.label,
        price: plan.price,
        durationDays: plan.durationDays,
        features: plan.features,
        description: plan.description,
        popular: plan.popular,
        isTrial: plan.isTrial,
      },
    });
  } catch (error: any) {
    sendError(
      res,
      "Failed to initialize subscription upgrade payment",
      error.message
    );
  }
}

// Cancel subscription (admin only)
export async function cancelSubscription(req: Request, res: Response) {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      sendValidationError(res, "Company ID is required");
      return;
    }

    // Check if user has permission to manage subscriptions
    if (!(req.user as any)?.isSuperAdmin && (req.user as any)?.role !== "admin") {
      sendError(res, "Forbidden: Only Taurean IT super admins or company admins can manage subscriptions", null, 403);
      return;
    }

    const company = await SubscriptionService.cancelSubscription(companyId);

    sendSuccess(res, "Subscription cancelled successfully", {
      company: {
        id: company._id,
        name: company.name,
        isActive: company.isActive,
      },
    });
  } catch (error: any) {
    sendError(res, "Failed to cancel subscription", error.message);
  }
}

export const SubscriptionController = {
  startFreeTrial,
  initializeSubscriptionPayment,
  verifySubscriptionPayment,
  getSubscriptionPlans,
  getCompanySubscriptionStatus,
  checkFeatureAccess,
  getUsageStatistics,
  renewSubscription,
  upgradeSubscription,
  cancelSubscription,
};
