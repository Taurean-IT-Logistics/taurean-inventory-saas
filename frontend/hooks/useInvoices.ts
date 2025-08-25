import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoicesAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useCompanyInvoices() {
  return useQuery({
    queryKey: ["invoices", "company"],
    queryFn: () => InvoicesAPI.listCompany(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserInvoices() {
  return useQuery({
    queryKey: ["invoices", "user"],
    queryFn: () => InvoicesAPI.listMine(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanyReceipts() {
  return useQuery({
    queryKey: ["receipts", "company"],
    queryFn: () => InvoicesAPI.receiptsCompany(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserReceipts() {
  return useQuery({
    queryKey: ["receipts", "user"],
    queryFn: () => InvoicesAPI.receiptsMine(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => InvoicesAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });
}

export function usePayInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      InvoicesAPI.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Payment Successful",
        description: "Invoice has been paid successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (id: string) => InvoicesAPI.downloadInvoice(id),
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Invoice download has been initiated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
    },
  });
}

export function useDownloadReceipt() {
  return useMutation({
    mutationFn: (id: string) => InvoicesAPI.downloadReceipt(id),
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Receipt download has been initiated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download receipt",
        variant: "destructive",
      });
    },
  });
}