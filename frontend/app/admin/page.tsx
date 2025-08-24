"use client";

import React, { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

import { toast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useBookings } from "@/hooks/useBookings";
import { useFacilities } from "@/hooks/useFacilities";
import { useUsers } from "@/hooks/useUsers";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { useCompanyTransactions } from "@/hooks/useTransactions";
import { CalendarDays, Building2, Users, Package } from "lucide-react";
import BookingCalendar from "@/components/booking/booking-calendar";
import { Booking } from "@/types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { BookingsAPI } from "@/lib/api";

export default function AdminPage() {
  // Use the hooks for data fetching
  const { bookings, isLoadingBookings } = useBookings();
  const { facilities, isLoadingFacilities } = useFacilities();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: inventoryData, isLoading: isLoadingInventory } =
    useInventoryItems();
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useCompanyTransactions();

  // Real-time updates
  useRealtimeUpdates({
    queryKeys: [
      "bookings-company",
      "facilities-company",
      "transactions-company",
      "users",
      "inventoryItems",
    ],
    events: [
      "BookingCreated",
      "BookingUpdated",
      "InventoryCreated",
      "InventoryUpdated",
      "TransactionCreated",
      "TransactionUpdated",
    ],
    showNotifications: true,
    notificationTitle: "Admin Dashboard Update",
  });

  const queryClient = useQueryClient();
  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: string) => BookingsAPI.remove(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
      toast({
        title: "Booking deleted successfully",
        description: "The booking has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting booking",
        description: "An error occurred while deleting the booking",
        variant: "destructive",
      });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: (booking: Partial<Booking>) => {
      const { facility, ...rest } = booking;

      // Handle facility field properly - it could be a string ID or an object with _id
      let facilityId = facility;
      if (typeof facilityId === "object" && facilityId !== null) {
        facilityId = (facilityId as any)._id;
      }

      if (!facilityId) {
        throw new Error("Facility is required");
      }

      if (!booking._id) {
        throw new Error("Booking ID is required for updates");
      }

      return BookingsAPI.update(booking._id, {
        ...rest,
        facility: facilityId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
      toast({
        title: "Booking updated successfully",
        description: "The booking has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating booking",
        description: "An error occurred while updating the booking",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (booking: Partial<Booking>) => {
      // Handle facility field properly - it could be a string ID or an object with _id
      let facilityId = booking.facility;
      if (typeof facilityId === "object" && facilityId !== null) {
        facilityId = (facilityId as any)._id;
      }

      if (!facilityId) {
        throw new Error("Facility is required");
      }

      return BookingsAPI.create({
        ...booking,
        facility: facilityId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
      toast({
        title: "Booking created successfully",
        description: "The booking has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating booking",
        description: "An error occurred while creating the booking",
        variant: "destructive",
      });
    },
  });

  // Calculate dashboard metrics - memoized to prevent unnecessary re-renders
  const metrics = useMemo(
    () => ({
      totalInventory: (inventoryData as any)?.data?.length || 0,
      totalFacilities: (facilities as any)?.facilities?.length || 0,
      totalUsers: (usersData as any)?.data?.users?.length || 0,
      activeBookings:
        (bookings as any)?.filter((b: any) => b.status === "active")?.length ||
        0,
    }),
    [inventoryData, facilities, usersData, bookings]
  );

  const handleDeleteBooking = useCallback(
    async (bookingId: string): Promise<void> => {
      try {
        deleteBookingMutation.mutate(bookingId);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete booking",
          variant: "destructive",
        });
      }
    },
    [deleteBookingMutation]
  );

  const handleUpdateBooking = useCallback(
    async (booking: Partial<Booking>): Promise<void> => {
      try {
        // Validate required fields before updating
        if (!booking._id) {
          toast({
            title: "Validation Error",
            description: "Booking ID is required for updates",
            variant: "destructive",
          });
          return;
        }

        if (!booking.facility) {
          toast({
            title: "Validation Error",
            description: "Facility is required to update a booking",
            variant: "destructive",
          });
          return;
        }

        updateBookingMutation.mutate(booking);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update booking",
          variant: "destructive",
        });
      }
    },
    [updateBookingMutation]
  );

  const handleCreateBooking = useCallback(
    async (booking: Partial<Booking>): Promise<void> => {
      try {
        // Validate required fields before creating
        if (!booking.facility) {
          toast({
            title: "Validation Error",
            description: "Facility is required to create a booking",
            variant: "destructive",
          });
          return;
        }

        if (!booking.startDate || !booking.endDate) {
          toast({
            title: "Validation Error",
            description: "Start date and end date are required",
            variant: "destructive",
          });
          return;
        }

        createBookingMutation.mutate(booking);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create booking",
          variant: "destructive",
        });
      }
    },
    [createBookingMutation]
  );

  if (
    isLoadingBookings ||
    isLoadingFacilities ||
    isLoadingUsers ||
    isLoadingInventory ||
    isLoadingTransactions
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Taurean IT Facility Management System
          </p>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Inventory
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalInventory}</div>
              <p className="text-xs text-muted-foreground">Items in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Facilities
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalFacilities}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for booking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Bookings
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeBookings}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full">
          <BookingCalendar
            facilities={(facilities as any)?.facilities || []}
            bookings={(bookings as any) || []}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onCreateBooking={handleCreateBooking}
          />
        </div>
      </div>
    </div>
  );
}
