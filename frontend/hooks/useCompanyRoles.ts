import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyRoleAPI, CompanyJoinRequestAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useCompanyRoles() {
  return useQuery({
    queryKey: ["company-roles"],
    queryFn: () => CompanyRoleAPI.getCompanyRoles(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCompanyRole(roleId: string) {
  return useQuery({
    queryKey: ["company-roles", roleId],
    queryFn: () => CompanyRoleAPI.getRoleById(roleId),
    enabled: !!roleId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUsersWithRole(roleId: string) {
  return useQuery({
    queryKey: ["company-roles", roleId, "users"],
    queryFn: () => CompanyRoleAPI.getUsersWithRole(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserJoinRequests() {
  return useQuery({
    queryKey: ["company-join-requests", "user"],
    queryFn: () => CompanyJoinRequestAPI.getUserRequests(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCompanyPendingRequests() {
  return useQuery({
    queryKey: ["company-join-requests", "company", "pending"],
    queryFn: () => CompanyJoinRequestAPI.getCompanyPendingRequests(),
    staleTime: 1 * 60 * 1000, // 1 minute - pending requests should be fresh
  });
}

export function useCreateCompanyRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: {
      name: string;
      permissions: {
        viewInvoices?: boolean;
        accessFinancials?: boolean;
        viewBookings?: boolean;
        viewInventory?: boolean;
        createRecords?: boolean;
        editRecords?: boolean;
        manageUsers?: boolean;
        manageFacilities?: boolean;
        manageInventory?: boolean;
        manageTransactions?: boolean;
      };
    }) => CompanyRoleAPI.createRole(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      toast({
        title: "Success",
        description: "Company role created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company role",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCompanyRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, updates }: { roleId: string; updates: any }) =>
      CompanyRoleAPI.updateRole(roleId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      queryClient.invalidateQueries({ queryKey: ["company-roles", variables.roleId] });
      toast({
        title: "Success",
        description: "Company role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company role",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCompanyRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => CompanyRoleAPI.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      toast({
        title: "Success",
        description: "Company role deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company role",
        variant: "destructive",
      });
    },
  });
}

export function useAssignRoleToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      CompanyRoleAPI.assignRoleToUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "Role assigned to user successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role to user",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => CompanyRoleAPI.removeRoleFromUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "Role removed from user successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove role from user",
        variant: "destructive",
      });
    },
  });
}

export function useInitializeDefaultRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => CompanyRoleAPI.initializeDefaultRoles(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      toast({
        title: "Success",
        description: "Default roles initialized successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize default roles",
        variant: "destructive",
      });
    },
  });
}

export function useRequestToJoinCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => CompanyJoinRequestAPI.requestToJoin(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-join-requests"] });
      toast({
        title: "Request Sent",
        description: "Your request to join the company has been sent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send join request",
        variant: "destructive",
      });
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, companyId }: { userId: string; companyId: string }) =>
      CompanyJoinRequestAPI.inviteUser(userId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-join-requests"] });
      toast({
        title: "Invitation Sent",
        description: "User has been invited to join the company",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => CompanyJoinRequestAPI.approveRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Request Approved",
        description: "Join request has been approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve join request",
        variant: "destructive",
      });
    },
  });
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => CompanyJoinRequestAPI.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-join-requests"] });
      toast({
        title: "Request Rejected",
        description: "Join request has been rejected",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject join request",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveUserFromCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => CompanyJoinRequestAPI.removeUserFromCompany(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["company-join-requests"] });
      toast({
        title: "Success",
        description: "User has been removed from the company",
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