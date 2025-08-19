"use client";

import React, { useState } from "react";
import BookingCalendar from "@/components/booking/booking-calendar";
import { BookingsAPI, FacilitiesAPI } from "@/lib/api";
import { Booking, Facility } from "@/types";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

export default function AdminPage() {
  const queryClient = useQueryClient();

  // Real-time updates for bookings and facilities
  useRealtimeUpdates({
    queryKeys: ["bookings-company", "facilities-company"],
    events: [
      "BookingCreated",
      "BookingUpdated",
      "InventoryCreated",
      "InventoryUpdated",
    ],
    showNotifications: true,
    notificationTitle: "Admin Dashboard Update",
  });

  const {
    data: facilities,
    isError: facilitiesError,
    isLoading: facilitiesLoading,
    error: facilitiesErrorMessage,
    refetch: facilitiesRefetch,
  } = useQuery({
    queryKey: ["facilities-company"],
    queryFn: () => FacilitiesAPI.listCompany(),
  });

  const {
    data: bookings,
    isError: bookingsError,
    error: bookingsErrorMessage,
    isLoading: bookingsLoading,
    refetch: bookingsRefetch,
  } = useQuery({
    queryKey: ["bookings-company"],
    queryFn: () => BookingsAPI.listCompany(),
  });

  // Mutations with toast notifications
  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: string) => BookingsAPI.remove(bookingId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking deleted successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: (booking: Partial<Booking>) =>
      BookingsAPI.update(booking._id!, booking),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Booking updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (booking: Partial<Booking>) => BookingsAPI.create(booking),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking created successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleDeleteBooking = async (bookingId: string) => {
    deleteBookingMutation.mutate(bookingId);
  };

  const handleUpdateBooking = async (booking: Partial<Booking>) => {
    try {
      await BookingsAPI.update(booking._id!, booking);
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handleCreateBooking = async (booking: Partial<Booking>) => {
    const payload = { ...booking };
    if (payload.facility) {
      payload.facility = (payload.facility as any)._id;
    }
    if (payload.user) {
      payload.user = (payload.user as any)._id;
    }
    try {
      await createBookingMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  if (facilitiesLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (facilitiesError || bookingsError) {
    return (
      <ErrorComponent
        message={
          facilitiesErrorMessage?.message || bookingsErrorMessage?.message
        }
        showGoHome={true}
      />
    );
  }
  return (
    <div>
      <BookingCalendar
        onRefresh={bookingsRefetch}
        facilities={facilities?.facilities as Facility[]}
        bookings={bookings as Booking[]}
        onUpdateBooking={handleUpdateBooking}
        onDeleteBooking={handleDeleteBooking}
        onCreateBooking={handleCreateBooking}
      />
    </div>
  );
}
