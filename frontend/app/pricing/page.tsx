"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, Users, BarChart3, Code, Palette, Headphones, Settings, Award, GraduationCap } from "lucide-react";
import { SubscriptionsAPI } from "@/lib/api";
import { SubscriptionPlan, SubscriptionStatus, UsageStats } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadPlans();
    if (user?.company) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const plansData = await SubscriptionsAPI.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error("Failed to load plans:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionStatus = async () => {
    if (!user?.company) return;
    
    try {
      const response = await SubscriptionsAPI.getStatus(user.company);
      setSubscriptionStatus(response.status);
      setUsageStats(response.usageStats);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    }
  };

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

      // Redirect to payment page or handle payment
      if (response.payment?.authorization_url) {
        window.location.href = response.payment.authorization_url;
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
      return supportDescriptions[value as keyof typeof supportDescriptions] || value;
    }
    
    if (key === "analytics") {
      return analyticsDescriptions[value as keyof typeof analyticsDescriptions] || value;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your business. All plans include our
            core features with no hidden fees. Scale up or down anytime.
          </p>
          
          {/* Free Trial Banner */}
          {subscriptionStatus?.canStartTrial && (
            <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Zap className="h-6 w-6" />
                <h3 className="text-xl font-semibold">Start Your Free Trial Today!</h3>
              </div>
              <p className="mb-4 text-green-100">
                Try our platform for 14 days with full access to all features. No credit card required.
              </p>
              <Button 
                onClick={handleStartTrial}
                className="bg-white text-green-600 hover:bg-green-50"
              >
                Start Free Trial
              </Button>
            </div>
          )}
        </div>

        {/* Current Subscription Status */}
        {subscriptionStatus?.hasSubscription && (
          <div className="mb-12 bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Subscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-semibold">{subscriptionStatus.plan?.label}</p>
                {subscriptionStatus.isTrial && (
                  <Badge className="bg-orange-100 text-orange-800 mt-1">Trial</Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold">
                  {subscriptionStatus.isActive ? "Active" : "Expired"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="text-lg font-semibold">{subscriptionStatus.daysRemaining}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Carousel */}
        <div className="mb-16">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {plans.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPlanIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentPlanIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentPlanIndex * 100}%)` }}
            >
              {plans.map((plan, index) => (
                <div key={plan.id} className="w-full flex-shrink-0 px-4">
                  <Card className="max-w-4xl mx-auto relative">
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    )}

                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                        {plan.label}
                      </CardTitle>
                      <div className="mb-4">
                        <span className="text-5xl font-bold text-gray-900">
                          {plan.price === 0 ? "Free" : `₵${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-600 ml-2">
                            per {plan.durationDays === 14 ? "trial" : 
                                  plan.durationDays === 30 ? "month" :
                                  plan.durationDays === 182 ? "6 months" :
                                  plan.durationDays === 365 ? "year" : "3 years"}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-lg">{plan.description}</p>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {Object.entries(plan.features).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-3">
                            <div className={`mt-1 ${isFeatureEnabled(key, value) ? 'text-green-500' : 'text-gray-400'}`}>
                              {isFeatureEnabled(key, value) ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <span className="text-lg">✗</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getFeatureIcon(key)}
                                <span className="font-medium text-gray-900">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </span>
                              </div>
                              <p className={`text-sm ${isFeatureEnabled(key, value) ? 'text-gray-700' : 'text-gray-500'}`}>
                                {formatFeatureValue(key, value)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center">
                        {plan.isTrial ? (
                          <Button
                            onClick={handleStartTrial}
                            className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                            disabled={!subscriptionStatus?.canStartTrial}
                          >
                            {subscriptionStatus?.canStartTrial ? "Start Free Trial" : "Trial Already Used"}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handlePurchasePlan(plan.id)}
                            className={`w-full text-lg py-3 ${
                              plan.popular
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-900 hover:bg-gray-800"
                            }`}
                          >
                            {subscriptionStatus?.hasSubscription ? "Upgrade Plan" : "Get Started"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentPlanIndex(Math.max(0, currentPlanIndex - 1))}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
              disabled={currentPlanIndex === 0}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPlanIndex(Math.min(plans.length - 1, currentPlanIndex + 1))}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
              disabled={currentPlanIndex === plans.length - 1}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Usage Statistics */}
        {usageStats && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Your Current Usage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {Object.entries(usageStats).map(([key, stats]) => (
                <Card key={key} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {stats.used.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.unlimited ? "Unlimited" : `of ${stats.limit.toLocaleString()}`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            All Plans Include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Setup Fees
              </h3>
              <p className="text-gray-600">
                Get started immediately with zero upfront costs
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cancel Anytime
              </h3>
              <p className="text-gray-600">
                No long-term contracts, cancel whenever you want
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Free Updates
              </h3>
              <p className="text-gray-600">
                Always get the latest features and improvements
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately and we'll prorate any differences.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day free trial for all new companies. No credit card
                required to start. You can upgrade to a paid plan anytime during or after the trial.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, mobile money, and bank
                transfers. All payments are processed securely through Paystack.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens when I reach my limits?
              </h3>
              <p className="text-gray-600">
                You'll receive notifications as you approach your limits. You can upgrade your plan at any time to increase your limits or get unlimited access.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses already using our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleStartTrial}
              disabled={!subscriptionStatus?.canStartTrial}
            >
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
