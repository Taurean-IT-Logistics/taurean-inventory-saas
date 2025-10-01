"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SubscriptionsAPI } from "@/lib/api/subscriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader, ErrorComponent } from "@/components/ui/loader";
import { Calendar, CreditCard, RefreshCw, TrendingUp, Shield, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface SubscriptionStatus {
  status: string;
  plan: string;
  expiresAt: string;
  licenseKey: string;
  isTrial: boolean;
  hasUsedTrial: boolean;
}

interface UsageStats {
  facilities: number;
  users: number;
  bookings: number;
  transactions: number;
}

interface Plan {
  id: string;
  label: string;
  price: number;
  durationDays: number;
  features: Record<string, any>;
  description: string;
  popular: boolean;
  isTrial: boolean;
}

export default function SubscriptionManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  // Fetch subscription plans
  const {
    data: plansData,
    isLoading: plansLoading,
    isError: isPlansError,
    error: plansError,
  } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => SubscriptionsAPI.getPlans(),
  });

  // Fetch subscription status
  const {
    data: statusData,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["subscription-status", user?.company],
    queryFn: () => SubscriptionsAPI.getStatus(user?.company || ""),
    enabled: !!user?.company,
  });

  // Fetch usage statistics
  const {
    data: usageData,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ["subscription-usage", user?.company],
    queryFn: () => SubscriptionsAPI.getUsageStatistics(user?.company || ""),
    enabled: !!user?.company,
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: (data: { newPlanId: string; email: string }) =>
      SubscriptionsAPI.upgradeSubscription({
        companyId: user?.company || "",
        newPlanId: data.newPlanId,
        email: data.email,
      }),
    onSuccess: (response) => {
      toast({
        title: "Upgrade Initiated",
        description: "Redirecting to payment...",
      });
      if ((response as any).payment?.authorization_url) {
        window.location.href = (response as any).payment.authorization_url;
      }
      setIsUpgradeModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate upgrade",
        variant: "destructive",
      });
    },
  });

  // Renew subscription mutation
  const renewalMutation = useMutation({
    mutationFn: (data: { planId: string; email: string }) =>
      SubscriptionsAPI.renewSubscription({
        companyId: user?.company || "",
        planId: data.planId,
        email: data.email,
      }),
    onSuccess: (response) => {
      toast({
        title: "Renewal Initiated",
        description: "Redirecting to payment...",
      });
      if ((response as any).payment?.authorization_url) {
        window.location.href = (response as any).payment.authorization_url;
      }
      setIsRenewalModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate renewal",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (statusData) {
      setSubscriptionStatus(statusData.status);
    }
    if (usageData) {
      setUsageStats(usageData.usageStats);
    }
  }, [statusData, usageData]);

  const plansList = (plansData as any)?.plans || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "expired":
        return <AlertCircle className="h-4 w-4" />;
      case "trial":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleUpgrade = () => {
    if (!selectedPlan || !user?.email) {
      toast({
        title: "Error",
        description: "Please select a plan and ensure your email is set",
        variant: "destructive",
      });
      return;
    }

    upgradeMutation.mutate({
      newPlanId: selectedPlan,
      email: user.email,
    });
  };

  const handleRenewal = () => {
    if (!selectedPlan || !user?.email) {
      toast({
        title: "Error",
        description: "Please select a plan and ensure your email is set",
        variant: "destructive",
      });
      return;
    }

    renewalMutation.mutate({
      planId: selectedPlan,
      email: user.email,
    });
  };

  if (statusLoading || usageLoading) {
    return <Loader />;
  }

  if (isPlansError) {
    return <ErrorComponent error={plansError} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your company's subscription and billing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Subscription Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionStatus ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{subscriptionStatus.plan}</h3>
                    <p className="text-sm text-gray-600">
                      {subscriptionStatus.isTrial ? "Free Trial" : "Paid Plan"}
                    </p>
                  </div>
                  <Badge className={getStatusColor(subscriptionStatus.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(subscriptionStatus.status)}
                      {subscriptionStatus.status}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">License Key</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {subscriptionStatus.licenseKey}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expires</p>
                    <p className="font-semibold">
                      {formatDate(subscriptionStatus.expiresAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getDaysUntilExpiry(subscriptionStatus.expiresAt)} days remaining
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Upgrade Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upgrade Subscription</DialogTitle>
                        <DialogDescription>
                          Choose a new plan to upgrade your subscription
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Select Plan</Label>
                          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {plansList.map((plan: Plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.label} - ${plan.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleUpgrade} 
                          disabled={upgradeMutation.isPending || !selectedPlan}
                          className="w-full"
                        >
                          {upgradeMutation.isPending ? "Processing..." : "Upgrade Now"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isRenewalModalOpen} onOpenChange={setIsRenewalModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Renew Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Renew Subscription</DialogTitle>
                        <DialogDescription>
                          Renew your current subscription plan
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Select Plan</Label>
                          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {plansList.map((plan: Plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.label} - ${plan.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleRenewal} 
                          disabled={renewalMutation.isPending || !selectedPlan}
                          className="w-full"
                        >
                          {renewalMutation.isPending ? "Processing..." : "Renew Now"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            ) : (
              <p className="text-gray-600">No active subscription found</p>
            )}
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageStats ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Facilities</span>
                  <span className="font-semibold">{usageStats.facilities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Users</span>
                  <span className="font-semibold">{usageStats.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bookings</span>
                  <span className="font-semibold">{usageStats.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transactions</span>
                  <span className="font-semibold">{usageStats.transactions}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No usage data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose from our flexible subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plansList.map((plan: Plan) => (
              <Card key={plan.id} className={`${plan.popular ? "border-primary" : ""}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.label}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    {plan.popular && (
                      <Badge variant="secondary">Popular</Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold">${plan.price}</div>
                  <div className="text-sm text-gray-600">
                    {plan.durationDays} days
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(plan.features).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
