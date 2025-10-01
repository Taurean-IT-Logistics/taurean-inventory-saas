"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SubscriptionsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import {
  Calendar,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface SubscriptionStatus {
  hasSubscription: boolean;
  isActive: boolean;
  expiresAt: string | null;
  plan: any;
  features: any;
  daysRemaining: number;
  canStartTrial: boolean;
  isTrial: boolean;
  hasUsedTrial: boolean;
  licenseKey: string | null;
}

interface UsageStats {
  facilities: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  users: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  inventory: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  bookings: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
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

  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
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
    queryFn: () => {
      const companyId =
        typeof user?.company === "string"
          ? user.company
          : (user?.company as any)?._id || (user?.company as any)?.id;
      return SubscriptionsAPI.getStatus(companyId || "");
    },
    enabled: !!user?.company,
  });

  // Fetch usage statistics
  const {
    data: usageData,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ["subscription-usage", user?.company],
    queryFn: () => {
      const companyId =
        typeof user?.company === "string"
          ? user.company
          : (user?.company as any)?._id || (user?.company as any)?.id;
      return SubscriptionsAPI.getUsageStats(companyId || "");
    },
    enabled: !!user?.company,
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: (data: { newPlanId: string; email: string }) => {
      const companyId =
        typeof user?.company === "string"
          ? user.company
          : (user?.company as any)?._id || (user?.company as any)?.id;
      return SubscriptionsAPI.upgrade({
        companyId: companyId || "",
        newPlanId: data.newPlanId,
        email: data.email,
      });
    },
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
    mutationFn: (data: { planId: string; email: string }) => {
      const companyId =
        typeof user?.company === "string"
          ? user.company
          : (user?.company as any)?._id || (user?.company as any)?.id;
      return SubscriptionsAPI.renew({
        companyId: companyId || "",
        planId: data.planId,
        email: data.email,
      });
    },
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
      setSubscriptionStatus(statusData.status as any);
    }
    if (usageData) {
      setUsageStats((usageData as any).usageStats as any);
    }
  }, [statusData, usageData]);

  const plansList =
    (plansData as any)?.plans.filter((plan: any) => plan.id !== "free_trial") ||
    [];

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

  if (isPlansError) {
    return (
      <ErrorComponent
        message={plansError?.message || "Failed to load subscription plans"}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Subscription Management
        </h1>
        <p className="text-gray-600">
          Manage your company&apos;s subscription and billing
        </p>
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
            {statusLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-gray-600">
                  Loading subscription status...
                </span>
              </div>
            ) : subscriptionStatus && subscriptionStatus.hasSubscription ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">
                      {(subscriptionStatus.plan as any)?.label || "No Plan"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(subscriptionStatus as any).isTrial
                        ? "Free Trial"
                        : "Paid Plan"}
                    </p>
                  </div>
                  <Badge
                    className={getStatusColor(
                      (subscriptionStatus as any).isActive
                        ? "active"
                        : "expired"
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(
                        (subscriptionStatus as any).isActive
                          ? "active"
                          : "expired"
                      )}
                      {(subscriptionStatus as any).isActive
                        ? "Active"
                        : "Expired"}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">License Key</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {(subscriptionStatus as any).licenseKey || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expires</p>
                    <p className="font-semibold">
                      {(subscriptionStatus as any).expiresAt
                        ? formatDate((subscriptionStatus as any).expiresAt)
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(subscriptionStatus as any).daysRemaining || 0} days
                      remaining
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Dialog
                    open={isUpgradeModalOpen}
                    onOpenChange={setIsUpgradeModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
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
                          <Select
                            value={selectedPlan}
                            onValueChange={setSelectedPlan}
                          >
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
                          {upgradeMutation.isPending
                            ? "Processing..."
                            : "Upgrade Now"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isRenewalModalOpen}
                    onOpenChange={setIsRenewalModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
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
                          <Select
                            value={selectedPlan}
                            onValueChange={setSelectedPlan}
                          >
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
                          {renewalMutation.isPending
                            ? "Processing..."
                            : "Renew Now"}
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
            {usageLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-gray-600">
                  Loading usage stats...
                </span>
              </div>
            ) : usageStats && usageStats.facilities ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Facilities</span>
                  <span className="font-semibold">
                    {usageStats.facilities.used}/
                    {usageStats.facilities.unlimited
                      ? "∞"
                      : usageStats.facilities.limit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Users</span>
                  <span className="font-semibold">
                    {usageStats.users.used}/
                    {usageStats.users.unlimited ? "∞" : usageStats.users.limit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inventory Items</span>
                  <span className="font-semibold">
                    {usageStats.inventory.used}/
                    {usageStats.inventory.unlimited
                      ? "∞"
                      : usageStats.inventory.limit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bookings</span>
                  <span className="font-semibold">
                    {usageStats.bookings.used}/
                    {usageStats.bookings.unlimited
                      ? "∞"
                      : usageStats.bookings.limit}
                  </span>
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
            {plansList
              .filter((plan: Plan) => plan.id !== subscriptionStatus?.plan?.id)
              .map((plan: Plan) => (
                <Card
                  key={plan.id}
                  className={`${plan.popular ? "border-primary" : ""}`}
                >
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
                      {Object.entries(plan.features)
                        .slice(0, 5)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>
                              {key}:{" "}
                              {typeof value === "boolean"
                                ? value
                                  ? "Yes"
                                  : "No"
                                : value}
                            </span>
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
