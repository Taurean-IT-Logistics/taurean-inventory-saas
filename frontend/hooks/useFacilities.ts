import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FacilitiesAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useFacilities(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["facilities", params],
    queryFn: () => FacilitiesAPI.list(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCompanyFacilities(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["facilities", "company", params],
    queryFn: () => FacilitiesAPI.listCompany(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacility(id: string) {
  return useQuery({
    queryKey: ["facilities", id],
    queryFn: () => FacilitiesAPI.detail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFacilityReviews(id: string) {
  return useQuery({
    queryKey: ["facilities", id, "reviews"],
    queryFn: () => FacilitiesAPI.reviews(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacilityCalendar(id: string) {
  return useQuery({
    queryKey: ["facilities", id, "calendar"],
    queryFn: () => FacilitiesAPI.calendar(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for calendar data
  });
}

export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, files }: { payload: Record<string, any>; files?: File[] }) =>
      FacilitiesAPI.create(payload, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      toast({
        title: "Success",
        description: "Facility created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create facility",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, files }: { id: string; payload: Record<string, any>; files?: File[] }) =>
      FacilitiesAPI.update(id, payload, files),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["facilities", variables.id] });
      toast({
        title: "Success",
        description: "Facility updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update facility",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FacilitiesAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      toast({
        title: "Success",
        description: "Facility deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete facility",
        variant: "destructive",
      });
    },
  });
}

export function useAddFacilityAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      FacilitiesAPI.addAvailability(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["facilities", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["facilities", variables.id, "calendar"] });
      toast({
        title: "Success",
        description: "Availability added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add availability",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveFacilityAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      FacilitiesAPI.removeAvailability(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["facilities", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["facilities", variables.id, "calendar"] });
      toast({
        title: "Success",
        description: "Availability removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove availability",
        variant: "destructive",
      });
    },
  });
}
