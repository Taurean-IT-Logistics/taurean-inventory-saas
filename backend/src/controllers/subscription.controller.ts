import { Request, Response } from "express";
import { sendSuccess, sendError, sendValidationError } from "../utils";
import { SubscriptionService } from "../services/subscription.service";
import { initializePayment, verifyPayment } from "../services/payment.service";
import { CompanyModel } from "../models/company.model";
import { TransactionModel } from "../models/transaction.model";
import {
  createTransaction,
  getTransactionByReference,
} from "../services/transaction.service";
import { PaymentVerificationService } from "../services/paymentVerification.service";

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

    // Get company details to determine currency
    const company = await CompanyModel.findById(companyId).lean();
    if (!company) {
      sendValidationError(res, "Company not found");
      return;
    }

    // Use company's currency or default to GHS (Ghanaian Cedi)
    const currency = company.currency || "GHS";

    // Validate currency support (Paystack supports GHS, NGN, USD, etc.)
    const supportedCurrencies = ["GHS", "NGN", "USD", "EUR", "GBP"];
    if (!supportedCurrencies.includes(currency)) {
      sendValidationError(
        res,
        `Currency ${currency} is not supported. Please contact support.`
      );
      return;
    }

    // Initialize payment with Paystack
    const paymentData = {
      email,
      amount: plan.price * 100, // Convert to kobo/pesewas
      currency: currency,
      metadata: {
        full_name: "Company Subscription", // Add required full_name
        companyId,
        planId,
        type: "subscription",
        planName: plan.label,
        durationDays: plan.durationDays,
      },
    };

    // Initialize payment with Paystack - NO companyId for subscriptions (goes directly to Taurean)
    const paymentResponse = await initializePayment(paymentData);

    // Create transaction record for subscription payment
    const transactionData = {
      email,
      amount: plan.price,
      type: "income", // Required field
      category: "subscription",
      description: `Subscription payment for ${plan.label} plan`,
      currency: currency,
      method: "paystack",
      ref: paymentResponse.data.reference, // Set the ref field for proper lookup
      accessCode: paymentResponse.data.access_code, // Store access code at root level
      paymentDetails: {
        paystackReference: paymentResponse.data.reference,
        accessCode: paymentResponse.data.access_code,
        authorizationUrl: paymentResponse.data.authorization_url,
      },
      metadata: {
        companyId,
        planId,
        planName: plan.label,
        durationDays: plan.durationDays,
        type: "subscription",
      },
      company: companyId,
      user: (req.user as any)?._id || (req.user as any)?.id,
      reconciled: false, // Required field
      attachments: [], // Required field
      tags: [], // Required field
      isCash: false, // Required field
      isCheque: false, // Required field
      isSplitPayment: false, // Required field
      isPaystack: true, // Mark as Paystack transaction
      isPlatformRevenue: false, // Subscription payments should show in company transactions
    };

    // Get super admin company for subscription transactions
    const superAdminCompany = await CompanyModel.findOne({
      isSuperAdmin: true,
    });

    // Update transaction data to use super admin company
    transactionData.company = superAdminCompany?._id.toString();

    const transaction = await createTransaction(transactionData);

    sendSuccess(res, "Subscription payment initialized", {
      payment: paymentResponse.data,
      transaction: {
        id: transaction._id,
        reference: paymentResponse.data.reference,
      },
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
    console.error("Subscription payment initialization error:", error);
    console.error("Error stack:", error.stack);
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

    console.log(
      `🔍 Verifying subscription payment with reference: ${reference}`
    );

    // Find the transaction record first - try multiple lookup methods
    let transaction = await getTransactionByReference(reference);

    // If not found by ref, try by paystackReference in paymentDetails
    if (!transaction) {
      console.log(
        `⚠️ Transaction not found by ref, trying paystackReference lookup`
      );
      transaction = await TransactionModel.findOne({
        "paymentDetails.paystackReference": reference,
        isDeleted: false,
      })
        .populate("company", "name subscription")
        .populate("user", "name email");
    }

    if (!transaction) {
      console.error(`❌ Transaction not found for reference: ${reference}`);
      sendError(
        res,
        "Transaction not found",
        "No transaction record found for this payment reference"
      );
      return;
    }

    console.log(`✅ Transaction found: ${transaction._id}`);

    // Verify payment with Paystack
    console.log(`🔍 Verifying payment with Paystack...`);
    const verificationResponse = await verifyPayment(reference);

    if (verificationResponse.data.status !== "success") {
      console.error(
        `❌ Paystack verification failed: ${verificationResponse.data.status}`
      );
      sendError(
        res,
        "Payment verification failed",
        `Payment was not successful. Status: ${verificationResponse.data.status}`
      );
      return;
    }

    console.log(`✅ Paystack verification successful`);

    // Use the existing payment verification service to update the transaction
    const verificationResult = await PaymentVerificationService.verifyPayment(
      reference,
      "paystack"
    );

    if (!verificationResult.success) {
      console.error(`❌ Payment verification service failed`);
      sendError(
        res,
        "Payment verification failed",
        "Payment verification was not successful"
      );
      return;
    }

    console.log(`✅ Payment verification service successful`);

    // Update transaction using the verification service
    const updatedTransaction =
      await PaymentVerificationService.updateTransactionFromVerification(
        transaction._id!.toString(),
        verificationResult
      );

    console.log(`✅ Transaction updated: ${updatedTransaction._id}`);

    // Extract metadata from payment - try multiple sources
    const metadata = verificationResponse.data.metadata || transaction.metadata;
    const { companyId, planId } = metadata;

    if (!companyId || !planId) {
      console.error(
        `❌ Missing metadata - companyId: ${companyId}, planId: ${planId}`
      );
      console.error(`Transaction metadata:`, transaction.metadata);
      console.error(`Payment metadata:`, verificationResponse.data.metadata);
      sendError(
        res,
        "Invalid payment metadata",
        "Missing company or plan information in payment metadata"
      );
      return;
    }

    console.log(
      `✅ Metadata found - companyId: ${companyId}, planId: ${planId}`
    );

    // Activate subscription automatically
    console.log(`🔄 Activating subscription...`);
    const company = await SubscriptionService.activateSubscription(
      companyId,
      planId,
      reference
    );

    console.log(`✅ Subscription activated for company: ${company.name}`);

    // Handle post-verification actions (notifications, etc.)
    await PaymentVerificationService.handlePostVerificationActions(
      updatedTransaction,
      verificationResult
    );

    // Send subscription activation email with license key
    try {
      const { emailService } = await import("../services/email.service");
      await emailService.sendSubscriptionActivationEmail(companyId, {
        plan: company.subscription.plan,
        licenseKey: company.subscription.licenseKey,
        expiresAt: company.subscription.expiresAt,
        amount: verificationResponse.data.amount / 100,
        currency: verificationResponse.data.currency || "GHS",
      });
      console.log(`✅ Subscription activation email sent`);
    } catch (emailError) {
      console.warn("Failed to send subscription activation email:", emailError);
    }

    console.log(`🎉 Subscription verification completed successfully`);

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
      transaction: updatedTransaction,
    });
  } catch (error: any) {
    console.error(`❌ Subscription verification failed:`, error);
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
    let { companyId } = req.params;

    // Validate companyId
    if (!companyId) {
      sendValidationError(res, "Valid company ID is required");
      return;
    }

    const status = await SubscriptionService.getSubscriptionStatus(companyId);
    const usageStats = await SubscriptionService.getUsageStats(companyId);

    sendSuccess(res, "Subscription status retrieved", {
      status,
      usageStats,
    });
  } catch (error: any) {
    console.error(`❌ Error in getCompanySubscriptionStatus:`, error);
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

    // Get company details to determine currency
    const company = await CompanyModel.findById(companyId).lean();
    if (!company) {
      sendValidationError(res, "Company not found");
      return;
    }

    // Use company's currency or default to GHS (Ghanaian Cedi)
    const currency = company.currency || "GHS";

    // Validate currency support (Paystack supports GHS, NGN, USD, etc.)
    const supportedCurrencies = ["GHS", "NGN", "USD", "EUR", "GBP"];
    if (!supportedCurrencies.includes(currency)) {
      sendValidationError(
        res,
        `Currency ${currency} is not supported. Please contact support.`
      );
      return;
    }

    // Initialize payment for renewal
    const paymentData = {
      email,
      amount: plan.price * 100,
      currency: currency,
      metadata: {
        full_name: "Company Subscription Renewal", // Add required full_name
        companyId,
        planId,
        type: "subscription_renewal",
        planName: plan.label,
        durationDays: plan.durationDays,
      },
    };

    // Initialize payment with Paystack - NO companyId for subscriptions (goes directly to Taurean)
    const paymentResponse = await initializePayment(paymentData);

    // Create transaction record for subscription renewal payment
    const transactionData = {
      email,
      amount: plan.price,
      type: "income", // Required field
      category: "subscription_renewal",
      description: `Subscription renewal for ${plan.label} plan`,
      currency: currency,
      method: "paystack",
      ref: paymentResponse.data.reference, // Set the ref field for proper lookup
      accessCode: paymentResponse.data.access_code, // Store access code at root level
      paymentDetails: {
        paystackReference: paymentResponse.data.reference,
        accessCode: paymentResponse.data.access_code,
        authorizationUrl: paymentResponse.data.authorization_url,
      },
      metadata: {
        companyId,
        planId,
        planName: plan.label,
        durationDays: plan.durationDays,
        type: "subscription_renewal",
      },
      company: companyId,
      user: (req.user as any)?._id || (req.user as any)?.id,
      reconciled: false, // Required field
      attachments: [], // Required field
      tags: [], // Required field
      isCash: false, // Required field
      isCheque: false, // Required field
      isSplitPayment: false, // Required field
      isPaystack: true, // Mark as Paystack transaction
      isPlatformRevenue: false, // Subscription payments should show in company transactions
    };

    // Get super admin company for subscription transactions
    const superAdminCompany = await CompanyModel.findOne({
      isSuperAdmin: true,
    });

    // Update transaction data to use super admin company
    transactionData.company = superAdminCompany?._id.toString();

    const transaction = await createTransaction(transactionData);

    sendSuccess(res, "Subscription renewal payment initialized", {
      payment: paymentResponse.data,
      transaction: {
        id: transaction._id,
        reference: paymentResponse.data.reference,
      },
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

    // Get company details to determine currency
    const company = await CompanyModel.findById(companyId).lean();
    if (!company) {
      sendValidationError(res, "Company not found");
      return;
    }

    // Use company's currency or default to GHS (Ghanaian Cedi)
    const currency = company.currency || "GHS";

    // Validate currency support (Paystack supports GHS, NGN, USD, etc.)
    const supportedCurrencies = ["GHS", "NGN", "USD", "EUR", "GBP"];
    if (!supportedCurrencies.includes(currency)) {
      sendValidationError(
        res,
        `Currency ${currency} is not supported. Please contact support.`
      );
      return;
    }

    // Initialize payment for upgrade
    const paymentData = {
      email,
      amount: plan.price * 100,
      currency: currency,
      metadata: {
        full_name: "Company Subscription Upgrade", // Add required full_name
        companyId,
        planId: newPlanId,
        type: "subscription_upgrade",
        planName: plan.label,
        durationDays: plan.durationDays,
      },
    };

    // Initialize payment with Paystack - NO companyId for subscriptions (goes directly to Taurean)
    const paymentResponse = await initializePayment(paymentData);

    // Create transaction record for subscription upgrade payment
    const transactionData = {
      email,
      amount: plan.price,
      type: "income", // Required field
      category: "subscription_upgrade",
      description: `Subscription upgrade to ${plan.label} plan`,
      currency: currency,
      method: "paystack",
      ref: paymentResponse.data.reference, // Set the ref field for proper lookup
      accessCode: paymentResponse.data.access_code, // Store access code at root level
      paymentDetails: {
        paystackReference: paymentResponse.data.reference,
        accessCode: paymentResponse.data.access_code,
        authorizationUrl: paymentResponse.data.authorization_url,
      },
      metadata: {
        companyId,
        planId: newPlanId,
        planName: plan.label,
        durationDays: plan.durationDays,
        type: "subscription_upgrade",
      },
      company: companyId,
      user: (req.user as any)?._id || (req.user as any)?.id,
      reconciled: false, // Required field
      attachments: [], // Required field
      tags: [], // Required field
      isCash: false, // Required field
      isCheque: false, // Required field
      isSplitPayment: false, // Required field
      isPaystack: true, // Mark as Paystack transaction
      isPlatformRevenue: false, // Subscription payments should show in company transactions
    };

    // Get super admin company for subscription transactions
    const superAdminCompany = await CompanyModel.findOne({
      isSuperAdmin: true,
    });

    // Update transaction data to use super admin company
    transactionData.company = superAdminCompany?._id.toString();

    const transaction = await createTransaction(transactionData);

    sendSuccess(res, "Subscription upgrade payment initialized", {
      payment: paymentResponse.data,
      transaction: {
        id: transaction._id,
        reference: paymentResponse.data.reference,
      },
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
    if (
      !(req.user as any)?.isSuperAdmin &&
      (req.user as any)?.role !== "admin"
    ) {
      sendError(
        res,
        "Forbidden: Only Taurean IT super admins or company admins can manage subscriptions",
        null,
        403
      );
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
