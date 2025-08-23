import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingsAPI } from "@/lib/api";
import type { Booking } from "@/types";

export const useBookings = () => {
  const queryClient = useQueryClient();

  // Fetch company bookings
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings-company"],
    queryFn: BookingsAPI.listCompany,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: BookingsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
    },
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      BookingsAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
    },
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: BookingsAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
    },
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const booking = (bookings as Booking[]).find((b) => b._id === id);
      if (!booking) throw new Error("Booking not found");

      return BookingsAPI.update(id, {
        ...booking,
        status: status as Booking["status"],
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
    },
  });

  return {
    // Data
    bookings,
    isLoadingBookings,
    bookingsError,

    // Mutations
    createBooking: createBookingMutation.mutate,
    updateBooking: updateBookingMutation.mutate,
    deleteBooking: deleteBookingMutation.mutate,
    updateStatus: updateStatusMutation.mutate,

    // Loading states
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
    isDeleting: deleteBookingMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,

    // Errors
    createError: createBookingMutation.error,
    updateError: updateBookingMutation.error,
    deleteError: deleteBookingMutation.error,
    statusUpdateError: updateStatusMutation.error,

    // Actions
    refetchBookings,
    resetErrors: () => {
      createBookingMutation.reset();
      updateBookingMutation.reset();
      deleteBookingMutation.reset();
      updateStatusMutation.reset();
    },
  };
};
