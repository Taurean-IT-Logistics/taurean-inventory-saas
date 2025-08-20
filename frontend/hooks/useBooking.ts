import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useBookings(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => BookingsAPI.listAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => BookingsAPI.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserBookings() {
  return useQuery({
    queryKey: ["bookings", "user"],
    queryFn: () => BookingsAPI.getUserBookings(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCompanyBookings() {
  return useQuery({
    queryKey: ["bookings", "company"],
    queryFn: () => BookingsAPI.listCompany(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: BookingsAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      BookingsAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.id] });
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => BookingsAPI.remove(bookingId),
    onSuccess: (data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] });
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });
}

export function useCheckAvailability() {
  return useMutation({
    mutationFn: (payload: {
      facilityId: string;
      startDate: string;
      endDate: string;
    }) => BookingsAPI.checkAvailability(payload),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check availability",
        variant: "destructive",
      });
    },
  });
}

export function useCheckInBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => BookingsAPI.checkIn(bookingId),
    onSuccess: (data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] });
      toast({
        title: "Success",
        description: "Checked in successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check in",
        variant: "destructive",
      });
    },
  });
}

export function useCheckOutBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => BookingsAPI.checkOut(bookingId),
    onSuccess: (data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] });
      toast({
        title: "Success",
        description: "Checked out successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check out",
        variant: "destructive",
      });
    },
  });
}
