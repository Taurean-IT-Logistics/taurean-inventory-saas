import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompaniesAPI, SubscriptionsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => CompaniesAPI.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscriptions", "plans"],
    queryFn: () => SubscriptionsAPI.getPlans(),
    staleTime: 30 * 60 * 1000, // 30 minutes - plans don't change often
  });
}

export function useCompanyPricing() {
  return useQuery({
    queryKey: ["companies", "pricing"],
    queryFn: () => CompaniesAPI.pricing(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useSubscriptionStatus(companyId: string) {
  return useQuery({
    queryKey: ["subscriptions", "status", companyId],
    queryFn: () => SubscriptionsAPI.getStatus(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsageStats(companyId: string) {
  return useQuery({
    queryKey: ["subscriptions", "usage", companyId],
    queryFn: () => SubscriptionsAPI.getUsageStats(companyId),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFeatureAccess(companyId: string, feature: string) {
  return useQuery({
    queryKey: ["subscriptions", "feature-access", companyId, feature],
    queryFn: () => SubscriptionsAPI.checkFeatureAccess(companyId, feature),
    enabled: !!companyId && !!feature,
    staleTime: 10 * 60 * 1000,
  });
}

export function useOnboardCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => CompaniesAPI.onboard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: "Company onboarded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to onboard company",
        variant: "destructive",
      });
    },
  });
}

export function useStartFreeTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => SubscriptionsAPI.startFreeTrial(companyId),
    onSuccess: (data, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "status", companyId] });
      toast({
        title: "Free Trial Started",
        description: "Your free trial has been activated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start free trial",
        variant: "destructive",
      });
    },
  });
}

export function useInitializePayment() {
  return useMutation({
    mutationFn: (payload: { companyId: string; planId: string; email: string }) =>
      SubscriptionsAPI.initializePayment(payload),
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { reference: string }) => SubscriptionsAPI.verifyPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Verification Failed",
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      });
    },
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { companyId: string; planId: string; email: string }) =>
      SubscriptionsAPI.renew(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "status", variables.companyId] });
      toast({
        title: "Subscription Renewed",
        description: "Your subscription has been renewed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Renewal Failed",
        description: error.message || "Failed to renew subscription",
        variant: "destructive",
      });
    },
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { companyId: string; newPlanId: string; email: string }) =>
      SubscriptionsAPI.upgrade(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "status", variables.companyId] });
      toast({
        title: "Subscription Upgraded",
        description: "Your subscription has been upgraded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => SubscriptionsAPI.cancel(companyId),
    onSuccess: (data, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "status", companyId] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePayoutConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => CompaniesAPI.updatePayoutConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: "Payout configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payout configuration",
        variant: "destructive",
      });
    },
  });
}