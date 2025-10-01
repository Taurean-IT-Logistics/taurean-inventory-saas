"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  Code,
  Palette,
  Headphones,
  Settings,
  Award,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { SubscriptionsAPI } from "@/lib/api";
import { SubscriptionPlan, SubscriptionStatus, UsageStats } from "@/types";
import { currencyFormat } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";

// Feature icons mapping
const featureIcons = {
  maxFacilities: Users,
  maxUsers: Users,
  maxInventoryItems: BarChart3,
  maxBookings: BarChart3,
  support: Headphones,
  analytics: BarChart3,
  apiAccess: Code,
  customBranding: Palette,
  whiteLabel: Palette,
  dedicatedSupport: Headphones,
  customIntegrations: Settings,
  slaGuarantee: Shield,
  training: GraduationCap,
};

// Support level descriptions
const supportDescriptions = {
  email: "Email support",
  priority: "Priority email & chat support",
  "24/7_priority": "24/7 priority support",
  "24/7_dedicated": "24/7 dedicated account manager",
};

// Analytics level descriptions
const analyticsDescriptions = {
  basic: "Basic reporting",
  standard: "Standard analytics",
  advanced: "Advanced analytics & insights",
  advanced_ai: "AI-powered analytics & insights",
  enterprise_ai: "Enterprise AI analytics & predictions",
};

export default function PricingPage() {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: plansData,
    isLoading: plansLoading,
    isError: isPlansError,
    error: plansError,
    refetch: plansRefetch,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: () => SubscriptionsAPI.getPlans(),
  });

  const loadSubscriptionStatus = useCallback(async () => {
    if (!user?.company) return;

    try {
      const response = await SubscriptionsAPI.getStatus(user.company);
      setSubscriptionStatus(response.status);
      setUsageStats(response.usageStats);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    }
  }, [user?.company]);

  useEffect(() => {
    if (user?.company) {
      loadSubscriptionStatus();
    }
  }, [user, loadSubscriptionStatus]);

  const handleStartTrial = async () => {
    if (!user?.company) {
      toast({
        title: "Error",
        description: "Please create a company first",
        variant: "destructive",
      });
      return;
    }

    try {
      await SubscriptionsAPI.startFreeTrial(user.company);
      toast({
        title: "Success",
        description: "Free trial started successfully!",
      });
      loadSubscriptionStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start free trial",
        variant: "destructive",
      });
    }
  };

  const handlePurchasePlan = async (planId: string) => {
    if (!user?.company || !user.email) {
      toast({
        title: "Error",
        description: "Please ensure you have a company and email set up",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await SubscriptionsAPI.initializePayment({
        companyId: user.company,
        planId,
        email: user.email,
      });

      if ((response as any).payment?.authorization_url) {
        window.location.href = (response as any).payment.authorization_url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    }
  };

  const formatFeatureValue = (key: string, value: any) => {
    if (typeof value === "boolean") {
      return value ? "✓" : "✗";
    }

    if (typeof value === "number") {
      if (value === -1) return "Unlimited";
      if (key.includes("max")) return `${value.toLocaleString()}`;
      return value.toString();
    }

    if (key === "support") {
      return (
        supportDescriptions[value as keyof typeof supportDescriptions] || value
      );
    }

    if (key === "analytics") {
      return (
        analyticsDescriptions[value as keyof typeof analyticsDescriptions] ||
        value
      );
    }

    return value;
  };

  const getFeatureIcon = (key: string) => {
    const IconComponent = featureIcons[key as keyof typeof featureIcons];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  const isFeatureEnabled = (key: string, value: any) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0 || value === -1;
    return true;
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading pricing plans..." />
      </div>
    );
  }

  if (isPlansError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorComponent
          title="Error loading pricing plans"
          message={plansError.message}
          onRetry={plansRefetch}
        />
      </div>
    );
  }

  const plansList = (plansData as any)?.plans || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 py-12 mt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your business. All plans include our
            core features with no hidden fees. Scale up or down anytime.
          </p>

          {/* Free Trial Banner */}
          {subscriptionStatus?.canStartTrial && (
            <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl max-w-2xl mx-auto shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Zap className="h-6 w-6" />
                <h3 className="text-xl font-semibold">
                  Start Your Free Trial Today!
                </h3>
              </div>
              <p className="mb-4 text-green-100">
                Try our platform for 14 days with full access to all features.
                No credit card required.
              </p>
              <Button
                onClick={handleStartTrial}
                className="bg-white text-green-600 hover:bg-green-50 font-semibold px-6 py-2 rounded-lg"
              >
                Start Free Trial
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards Carousel */}
      <div className="container mx-auto px-4 py-16">
        {/* Carousel Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {plansList.map((_: any, index: number) => (
              <motion.button
                key={index}
                onClick={() => setCurrentPlanIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPlanIndex ? "bg-blue-500" : "bg-gray-400"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            className="flex"
            animate={{
              x: `-${currentPlanIndex * 100}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {plansList.map((plan: any, index: number) => (
              <div key={plan.id} className="w-full flex-shrink-0 px-4">
                <div className="max-w-md mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      className={`relative bg-white border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg ${
                        plan.popular
                          ? "scale-105 shadow-lg border-blue-200"
                          : ""
                      }`}
                    >
                      {/* Most Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-green-500 to-blue-500  px-4 py-1 rounded-full border-0 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-6 pt-8">
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                          {plan.label}
                        </CardTitle>
                        <p className="text-gray-600 text-sm mb-6">
                          {plan.description}
                        </p>

                        {/* Price */}
                        <div className="mb-6">
                          {plan.price === 0 ? (
                            <div className="text-4xl font-bold text-green-600">
                              Free
                            </div>
                          ) : (
                            <div className="flex items-baseline justify-center">
                              <span
                                className={`text-4xl font-bold ${
                                  plan.popular
                                    ? "bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                                    : "text-green-600"
                                }`}
                              >
                                ₵{plan.price}
                              </span>
                              <span className="text-gray-500 ml-2 text-sm">
                                per{" "}
                                {plan.durationDays === 14
                                  ? "trial"
                                  : plan.durationDays === 30
                                  ? "month"
                                  : plan.durationDays === 182
                                  ? "6 months"
                                  : plan.durationDays === 365
                                  ? "year"
                                  : "3 years"}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Features */}
                        <div className="space-y-4 mb-8">
                          {Object.entries(plan.features)
                            .slice(0, 6)
                            .map(([key, value]) => (
                              <div key={key} className="flex items-start gap-3">
                                <div className="mt-1">
                                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-green-600" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-700 text-sm">
                                    {key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase()
                                      )}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {formatFeatureValue(key, value)}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <div className="text-center">
                          {plan.isTrial ? (
                            <Button
                              onClick={handleStartTrial}
                              className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 ${
                                subscriptionStatus?.canStartTrial
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                              disabled={!subscriptionStatus?.canStartTrial}
                            >
                              {subscriptionStatus?.canStartTrial
                                ? "Get Started"
                                : "Trial Already Used"}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handlePurchasePlan(plan.id)}
                              className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 ${
                                plan.popular
                                  ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
                                  : "bg-gray-700 hover:bg-gray-800 text-white"
                              }`}
                            >
                              {subscriptionStatus?.hasSubscription
                                ? "Upgrade Plan"
                                : plan.popular
                                ? "Get Started"
                                : "Choose Plan"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Navigation Arrows */}
          <motion.button
            onClick={() =>
              setCurrentPlanIndex(Math.max(0, currentPlanIndex - 1))
            }
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            disabled={currentPlanIndex === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
          <motion.button
            onClick={() =>
              setCurrentPlanIndex(
                Math.min(plansList.length - 1, currentPlanIndex + 1)
              )
            }
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            disabled={currentPlanIndex === plansList.length - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Current Subscription Status */}
      {subscriptionStatus?.hasSubscription && (
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-4xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold ">
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Plan</p>
                  <p className="text-lg font-semibold ">
                    {subscriptionStatus.plan?.label}
                  </p>
                  {subscriptionStatus.isTrial && (
                    <Badge className="bg-orange-500  mt-1">Trial</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-lg font-semibold ">
                    {subscriptionStatus.isActive ? "Active" : "Expired"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Days Remaining</p>
                  <p className="text-lg font-semibold ">
                    {subscriptionStatus.daysRemaining}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Statistics */}
      {usageStats && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold  text-center mb-8">
            Your Current Usage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {Object.entries(usageStats).map(([key, stats]) => (
              <Card
                key={key}
                className="text-center bg-gray-800 border-gray-700"
              >
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {stats.used.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.unlimited
                      ? "Unlimited"
                      : `of ${stats.limit.toLocaleString()}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Plans Include */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold  text-center mb-8">
          All Plans Include
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold  mb-2">No Setup Fees</h3>
            <p className="text-gray-400">
              Get started immediately with zero upfront costs
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold  mb-2">Cancel Anytime</h3>
            <p className="text-gray-400">
              No long-term contracts, cancel whenever you want
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold  mb-2">Free Updates</h3>
            <p className="text-gray-400">
              Always get the latest features and improvements
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold  text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold  mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately and we&apos;ll prorate any differences.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold  mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-400">
                We offer a 14-day free trial for all new companies. No credit
                card required to start. You can upgrade to a paid plan anytime
                during or after the trial.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold  mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept all major credit cards, mobile money, and bank
                transfers. All payments are processed securely through Paystack.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold  mb-2">
                What happens when I reach my limits?
              </h3>
              <p className="text-gray-400">
                You&apos;ll receive notifications as you approach your limits.
                You can upgrade your plan at any time to increase your limits or
                get unlimited access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold  mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-gray-400 mb-8">
          Join thousands of businesses already using our platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 py-3 rounded-lg"
            onClick={handleStartTrial}
            disabled={!subscriptionStatus?.canStartTrial}
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-primary hover:text-white px-8 py-3 rounded-lg"
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
