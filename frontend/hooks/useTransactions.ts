import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useCompanyTransactions() {
  return useQuery({
    queryKey: ["transactions", "company"],
    queryFn: () => TransactionsAPI.listCompany(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserTransactions() {
  return useQuery({
    queryKey: ["transactions", "user"],
    queryFn: () => TransactionsAPI.getUserTransactions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTransactionByReference(reference: string) {
  return useQuery({
    queryKey: ["transactions", "reference", reference],
    queryFn: () => TransactionsAPI.detailsByReference(reference),
    enabled: !!reference,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: () => TransactionsAPI.listBanks(),
    staleTime: 60 * 60 * 1000, // 1 hour - banks don't change often
  });
}

export function useAccountDetails(bankCode: string, accountNumber: string) {
  return useQuery({
    queryKey: ["account-details", bankCode, accountNumber],
    queryFn: () => TransactionsAPI.getAccountDetails(bankCode, accountNumber),
    enabled: !!bankCode && !!accountNumber,
    staleTime: 30 * 60 * 1000,
  });
}

export function useSubAccountDetails(subaccountCode: string) {
  return useQuery({
    queryKey: ["subaccount", subaccountCode],
    queryFn: () => TransactionsAPI.getSubAccountDetails(subaccountCode),
    enabled: !!subaccountCode,
    staleTime: 10 * 60 * 1000,
  });
}

export function useInitializeTransactionPayment() {
  return useMutation({
    mutationFn: (payload: any) => TransactionsAPI.initializePayment(payload),
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    },
  });
}

export function useVerifyTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => TransactionsAPI.verifyByReference(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Payment Verified",
        description: "Transaction has been verified successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify transaction",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      TransactionsAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSubAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subaccountCode, payload }: { subaccountCode: string; payload: any }) =>
      TransactionsAPI.updateSubAccount(subaccountCode, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subaccount", variables.subaccountCode] });
      toast({
        title: "Success",
        description: "Subaccount updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subaccount",
        variant: "destructive",
      });
    },
  });
}

