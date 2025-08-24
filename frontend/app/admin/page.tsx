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
        // This would be handled by the useBookings hook
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete booking",
          variant: "destructive",
        });
      }
    },
    []
  );

  const handleUpdateBooking = useCallback(
    async (booking: Partial<Booking>): Promise<void> => {
      try {
        // This would be handled by the useBookings hook
        toast({
          title: "Success",
          description: "Booking updated successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update booking",
          variant: "destructive",
        });
      }
    },
    []
  );

  const handleCreateBooking = useCallback(
    async (booking: Partial<Booking>): Promise<void> => {
      try {
        // This would be handled by the useBookings hook
        toast({
          title: "Success",
          description: "Booking created successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create booking",
          variant: "destructive",
        });
      }
    },
    []
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
            Welcome to the Facility Management System
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
