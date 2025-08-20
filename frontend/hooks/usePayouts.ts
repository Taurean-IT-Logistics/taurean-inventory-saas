import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PayoutsAPI, CashflowAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function usePayouts() {
  return useQuery({
    queryKey: ["payouts"],
    queryFn: () => PayoutsAPI.getPayouts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompanyBalance() {
  return useQuery({
    queryKey: ["payouts", "balance"],
    queryFn: () => PayoutsAPI.getCompanyBalance(),
    staleTime: 2 * 60 * 1000, // 2 minutes - balance should be relatively fresh
  });
}

export function usePlatformBalance() {
  return useQuery({
    queryKey: ["payouts", "platform-balance"],
    queryFn: () => PayoutsAPI.getPlatformBalance(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCashflowSummary() {
  return useQuery({
    queryKey: ["cashflow", "summary"],
    queryFn: () => CashflowAPI.summary(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCashflowAnomalies() {
  return useQuery({
    queryKey: ["cashflow", "anomalies"],
    queryFn: () => CashflowAPI.anomalies(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => PayoutsAPI.requestPayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["payouts", "balance"] });
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request payout",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      PayoutsAPI.updatePayout(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      toast({
        title: "Success",
        description: "Payout updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payout",
        variant: "destructive",
      });
    },
  });
}

export function useApprovePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PayoutsAPI.approvePayout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      toast({
        title: "Payout Approved",
        description: "Payout has been approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve payout",
        variant: "destructive",
      });
    },
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PayoutsAPI.processPayout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["payouts", "balance"] });
      toast({
        title: "Payout Processed",
        description: "Payout has been processed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payout",
        variant: "destructive",
      });
    },
  });
}