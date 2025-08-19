"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Key,
  Calendar,
  CheckCircle,
  AlertCircle,
  Building2,
  CreditCard,
  Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SubscriptionsAPI } from "@/lib/api";

interface PricingPlan {
  id: string;
  label: string;
  durationDays: number;
}

interface LicenseActivation {
  companyId: string;
  plan: string;
  duration: number;
}

export default function LicensePage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [isActivating, setIsActivating] = useState(false);

  // Fetch pricing plans from backend
  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: SubscriptionsAPI.getPlans,
  });

  const plans = (pricingData as any)?.plans || [];

  const handleLicenseActivation = async () => {
    if (!selectedPlan || !companyId) {
      toast({
        title: "Error",
        description: "Please select a plan and enter company ID",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    try {
      const selectedPlanData = plans.find(
        (p: PricingPlan) => p.id === selectedPlan
      );
      if (!selectedPlanData) throw new Error("Invalid plan selected");

      const response = await fetch("/api/subscriptions/initialize-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          companyId,
          planId: selectedPlan,
          email: localStorage.getItem("userEmail") || "admin@company.com",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to activate license");
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: `License activated successfully! Plan: ${selectedPlanData.label}`,
        variant: "default",
      });

      // Reset form
      setSelectedPlan("");
      setCompanyId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate license",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            License Activation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Activate your company's license by selecting a subscription plan.
            Choose the plan that best fits your business needs and activate it
            instantly.
          </p>
        </div>

        {/* License Activation Form */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="p-8">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Activate Company License
              </CardTitle>
              <p className="text-gray-600">
                Enter your company details and select a subscription plan
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="companyId" className="text-base font-medium">
                  Company ID
                </Label>
                <Input
                  id="companyId"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Enter your company ID"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This is the unique identifier for your company
                </p>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Select Subscription Plan
                </Label>
                {pricingLoading ? (
                  <div className="mt-2 text-center py-4">Loading plans...</div>
                ) : (
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map((plan: PricingPlan) => (
                      <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all ${
                          selectedPlan === plan.id
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {plan.label}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {plan.durationDays} days
                              </p>
                            </div>
                            {selectedPlan === plan.id && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleLicenseActivation}
                disabled={!selectedPlan || !companyId || isActivating}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isActivating ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Activating License...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Activate License
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Plan Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What's Included in Your License
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Full Access
              </h3>
              <p className="text-gray-600">
                Complete access to all features based on your selected plan
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flexible Duration
              </h3>
              <p className="text-gray-600">
                Choose from monthly, bi-annual, annual, or tri-annual plans
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Payment
              </h3>
              <p className="text-gray-600">
                Secure payment processing through Paystack integration
              </p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">
                    Important Information
                  </h3>
                  <ul className="text-amber-800 space-y-1 text-sm">
                    <li>
                      • License activation requires super admin privileges
                    </li>
                    <li>
                      • Once activated, the license cannot be changed until
                      expiration
                    </li>
                    <li>• All plans include automatic renewal options</li>
                    <li>
                      • Support is available for license-related questions
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Need Help with License Activation?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our support team is here to help you with any license activation
            questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Contact Support
            </Button>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
