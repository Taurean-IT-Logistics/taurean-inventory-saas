import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuperAdminAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useSuperAdminCompanies() {
  return useQuery({
    queryKey: ["super-admin", "companies"],
    queryFn: () => SuperAdminAPI.getAllCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSuperAdminCompanyDetails(companyId: string) {
  return useQuery({
    queryKey: ["super-admin", "companies", companyId],
    queryFn: () => SuperAdminAPI.getCompanyDetails(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuperAdminUsers() {
  return useQuery({
    queryKey: ["super-admin", "users"],
    queryFn: () => SuperAdminAPI.getAllUsers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUnassignedUsers() {
  return useQuery({
    queryKey: ["super-admin", "users", "unassigned"],
    queryFn: () => SuperAdminAPI.getUnassignedUsers(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSystemStatistics() {
  return useQuery({
    queryKey: ["super-admin", "statistics"],
    queryFn: () => SuperAdminAPI.getSystemStatistics(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentActivity(limit?: number) {
  return useQuery({
    queryKey: ["super-admin", "activity", limit],
    queryFn: () => SuperAdminAPI.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minute - activity should be fresh
  });
}

export function useSearchCompanies() {
  return useMutation({
    mutationFn: (query: string) => SuperAdminAPI.searchCompanies(query),
  });
}

export function useSearchUsers() {
  return useMutation({
    mutationFn: (query: string) => SuperAdminAPI.searchUsers(query),
  });
}

export function useActivateCompanySubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      companyId, 
      plan, 
      duration 
    }: { 
      companyId: string; 
      plan: string; 
      duration: number 
    }) => SuperAdminAPI.activateCompanySubscription(companyId, plan, duration),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin", "companies", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Subscription Activated",
        description: "Company subscription has been activated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate company subscription",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateCompanySubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => SuperAdminAPI.deactivateCompanySubscription(companyId),
    onSuccess: (data, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin", "companies", companyId] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Subscription Deactivated",
        description: "Company subscription has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate company subscription",
        variant: "destructive",
      });
    },
  });
}

export function useSuperAdminUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      SuperAdminAPI.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });
}

export function useAssignUserToCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, companyId }: { userId: string; companyId: string }) =>
      SuperAdminAPI.assignUserToCompany(userId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User assigned to company successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign user to company",
        variant: "destructive",
      });
    },
  });
}

export function useSuperAdminRemoveUserFromCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => SuperAdminAPI.removeUserFromCompany(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User removed from company successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from company",
        variant: "destructive",
      });
    },
  });
}