import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useInventoryItems(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["inventoryItems", params],
    queryFn: () => {
      const stringParams = params ? 
        Object.fromEntries(
          Object.entries(params).map(([key, value]) => [key, String(value)])
        ) : undefined;
      return InventoryAPI.list(stringParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ["inventoryItems", id],
    queryFn: () => InventoryAPI.getItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ["inventoryItems", "low-stock"],
    queryFn: () => InventoryAPI.lowStock(),
    staleTime: 2 * 60 * 1000, // 2 minutes - low stock should be fresh
  });
}

export function useCompanyInventoryItems(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["inventoryItems", "company", params],
    queryFn: () => {
      const stringParams = params ? 
        Object.fromEntries(
          Object.entries(params).map(([key, value]) => [key, String(value)])
        ) : undefined;
      return InventoryAPI.listCompany(stringParams);
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, files }: { payload: Record<string, any>; files?: File[] }) =>
      InventoryAPI.create(payload, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create inventory item",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, files }: { id: string; payload: Record<string, any>; files?: File[] }) =>
      InventoryAPI.update(id, payload, files),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems", variables.id] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InventoryAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inventory item",
        variant: "destructive",
      });
    },
  });
}

export function useRestoreInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InventoryAPI.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast({
        title: "Success",
        description: "Inventory item restored successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore inventory item",
        variant: "destructive",
      });
    },
  });
}

export function useReturnInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      InventoryAPI.returnItem(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems", variables.id] });
      toast({
        title: "Success",
        description: "Inventory item returned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to return inventory item",
        variant: "destructive",
      });
    },
  });
}

export function useAddMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      InventoryAPI.addMaintenance(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems", variables.id] });
      toast({
        title: "Success",
        description: "Maintenance record added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add maintenance record",
        variant: "destructive",
      });
    },
  });
}
