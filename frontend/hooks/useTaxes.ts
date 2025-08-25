import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaxesAPI, TaxSchedulesAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useTaxes() {
  return useQuery({
    queryKey: ["taxes"],
    queryFn: () => TaxesAPI.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCompanyTaxes() {
  return useQuery({
    queryKey: ["taxes", "company"],
    queryFn: () => TaxesAPI.listCompany(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTaxSchedules() {
  return useQuery({
    queryKey: ["tax-schedules"],
    queryFn: () => TaxSchedulesAPI.list(),
    staleTime: 30 * 60 * 1000, // 30 minutes - schedules don't change often
  });
}

export function useCreateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => TaxesAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      toast({
        title: "Success",
        description: "Tax created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tax",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      TaxesAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      toast({
        title: "Success",
        description: "Tax updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tax",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaxesAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      toast({
        title: "Success",
        description: "Tax deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tax",
        variant: "destructive",
      });
    },
  });
}

export function useCreateTaxSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => TaxSchedulesAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-schedules"] });
      toast({
        title: "Success",
        description: "Tax schedule created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tax schedule",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTaxSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      TaxSchedulesAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-schedules"] });
      toast({
        title: "Success",
        description: "Tax schedule updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tax schedule",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTaxSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaxSchedulesAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-schedules"] });
      toast({
        title: "Success",
        description: "Tax schedule deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tax schedule",
        variant: "destructive",
      });
    },
  });
}