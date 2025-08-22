import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useUsers(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => UsersAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompanyUsers(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["users", "company", params],
    queryFn: () => UsersAPI.listCompany(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["users", "profile"],
    queryFn: () => UsersAPI.profile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["users", "stats"],
    queryFn: () => UsersAPI.stats(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubaccounts() {
  return useQuery({
    queryKey: ["users", "subaccounts"],
    queryFn: () => UsersAPI.getSubaccounts(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      UsersAPI.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", "profile"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      UsersAPI.updateRole(id, role),
    onSuccess: () => {
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