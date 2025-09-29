"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Booking, Facility } from "@/types";
import { currencyFormat } from "@/lib/utils";
import { FacilitiesAPI, BookingsAPI } from "@/lib/api";
import BookingManagement from "@/components/booking/bookingManagement";
import BookingCalendar from "@/components/booking/booking-calendar";
import {
  Calendar,
  CalendarDays,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  List,
  Plus,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import SimplePaginatedList from "@/components/paginatedList";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { BookingStatusBadge } from "@/components/booking/booking-calendar/bookingStatusBadge";

interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  todayBookings: number;
  weeklyGrowth: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  averageBookingValue: number;
}

const BookingDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  const queryClient = useQueryClient();

  // Real-time updates for bookings
  useRealtimeUpdates({
    queryKeys: ["bookings-company", "facilities-company"],
    events: ["BookingCreated", "BookingUpdated"],
    showNotifications: true,
    notificationTitle: "Booking Update",
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
    data: bookings = [] as Booking[],
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
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
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
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
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
      toast({
        title: "Success",
        description: "Booking created successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  // Stats calculation
  const isValidDate = (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  const parseDate = useCallback((dateValue: any): Date | null => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
      return isValidDate(dateValue) ? dateValue : null;
    }

    if (typeof dateValue === "string" || typeof dateValue === "number") {
      const parsed = new Date(dateValue);
      return isValidDate(parsed) ? parsed : null;
    }

    return null;
  }, []);

  const getDateRange = (days: number): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const calculateStats = useCallback(
    (data: Booking[]): void => {
      if (!Array.isArray(data) || data.length === 0) {
        setStats({
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          totalRevenue: 0,
          todayBookings: 0,
          weeklyGrowth: 0,
          monthlyRevenue: 0,
          weeklyRevenue: 0,
          averageBookingValue: 0,
        });
        return;
      }

      // Filter out deleted bookings and validate data
      const validBookings = data.filter(
        (booking) =>
          booking &&
          !booking.isDeleted &&
          typeof booking.totalPrice === "number" &&
          !isNaN(booking.totalPrice) &&
          booking.totalPrice >= 0
      );

      const totalBookings = validBookings.length;
      const confirmedBookings = validBookings.filter(
        (b) => b.status === "confirmed" || b.status === "completed"
      ).length;
      const pendingBookings = validBookings.filter(
        (b) => b.status === "pending"
      ).length;

      // Calculate total revenue (only from confirmed and completed bookings)
      const revenueGeneratingStatuses = ["confirmed", "completed"];
      const totalRevenue = validBookings
        .filter((b) => revenueGeneratingStatuses.includes(b.status))
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      // Today's bookings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayBookings = validBookings.filter((b) => {
        const startDate = parseDate(b.startDate);
        return startDate && startDate >= today && startDate < tomorrow;
      }).length;

      // Weekly revenue (last 7 days)
      const { start: weekStart, end: weekEnd } = getDateRange(7);
      const weeklyRevenue = validBookings
        .filter((b) => {
          const startDate = parseDate(b.startDate);
          return (
            startDate &&
            startDate >= weekStart &&
            startDate <= weekEnd &&
            revenueGeneratingStatuses.includes(b.status)
          );
        })
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      // Monthly revenue (last 30 days)
      const { start: monthStart, end: monthEnd } = getDateRange(30);
      const monthlyRevenue = validBookings
        .filter((b) => {
          const startDate = parseDate(b.startDate);
          return (
            startDate &&
            startDate >= monthStart &&
            startDate <= monthEnd &&
            revenueGeneratingStatuses.includes(b.status)
          );
        })
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      const { start: prevWeekStart } = getDateRange(14);
      const prevWeekRevenue = validBookings
        .filter((b) => {
          const startDate = parseDate(b.startDate);
          return (
            startDate &&
            startDate >= prevWeekStart &&
            startDate < weekStart &&
            revenueGeneratingStatuses.includes(b.status)
          );
        })
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      const weeklyGrowth =
        prevWeekRevenue > 0
          ? ((weeklyRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
          : weeklyRevenue > 0
          ? 100
          : 0;

      const averageBookingValue =
        totalRevenue > 0 && totalBookings > 0
          ? totalRevenue / totalBookings
          : 0;

      setStats({
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalRevenue,
        todayBookings,
        weeklyGrowth: Math.round(weeklyGrowth * 100) / 100, // Round to 2 decimal places
        monthlyRevenue,
        weeklyRevenue,
        averageBookingValue,
      });
    },
    [parseDate, setStats]
  );

  // Update stats and recent bookings when bookings change
  useEffect(() => {
    if (bookings && Array.isArray(bookings)) {
      calculateStats(bookings);
      setRecentBookings(
        bookings
          .slice()
          .sort(
            (a, b) =>
              (parseDate(b.startDate)?.getTime() || 0) -
              (parseDate(a.startDate)?.getTime() || 0)
          )
          .slice(0, 10)
      );
    }
  }, [bookings, calculateStats, parseDate]);

  // Handlers using mutations
  const handleDeleteBooking = async (bookingId: string) => {
    deleteBookingMutation.mutate(bookingId);
  };

  const handleUpdateBooking = async (booking: Partial<Booking>) => {
    try {
      const { facility, ...rest } = booking;

      // Handle facility field properly - it could be a string ID or an object with _id
      let facilityId = facility;
      if (typeof facilityId === "object" && facilityId !== null) {
        facilityId = (facilityId as any)._id;
      }

      if (!facilityId) {
        throw new Error("Facility is required");
      }

      await updateBookingMutation.mutateAsync({
        ...rest,
        facility: facilityId,
      });
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handleCreateBooking = async (booking: Partial<Booking>) => {
    const payload = { ...booking };

    // Handle facility field properly
    if (payload.facility) {
      if (typeof payload.facility === "object" && payload.facility !== null) {
        payload.facility = (payload.facility as any)._id;
      }
      // If it's already a string, keep it as is
    }

    // Handle user field properly
    if (payload.user) {
      if (typeof payload.user === "object" && payload.user !== null) {
        payload.user = (payload.user as any)._id;
      }
      // If it's already a string, keep it as is
    }

    try {
      await createBookingMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  const formatDate = (date: Date | string | null): string => {
    const parsedDate = parseDate(date);
    return parsedDate ? parsedDate.toLocaleDateString() : "Invalid Date";
  };

  const safeGetUserName = (booking: Booking): string => {
    // Handle user field properly - it could be a string ID or an object with name
    if (!booking?.user) return "Unknown User";

    if (typeof booking.user === "object" && booking.user !== null) {
      // If it's an object, use the name property
      return (booking.user as any)?.name || "Unknown User";
    }

    // If it's a string ID, we can't look it up without users data
    return "Unknown User";
  };

  const safeGetUserEmail = (booking: Booking): string => {
    // Handle user field properly - it could be a string ID or an object with email
    if (!booking?.user) return "No email";

    if (typeof booking.user === "object" && booking.user !== null) {
      // If it's an object, use the email property
      return (booking.user as any)?.email || "No email";
    }

    // If it's a string ID, we can't look it up without users data
    return "No email";
  };

  const safeGetFacilityName = (booking: Booking): string => {
    // Handle facility field properly - it could be a string ID or an object with name
    if (!booking?.facility) return "Unknown Facility";

    if (typeof booking.facility === "string") {
      // If it's a string ID, find the facility in the facilities array
      const facilityList = (facilities as any)?.data || (facilities as any)?.facilities || [];
      const facility = facilityList.find(
        (f: any) => f._id === booking.facility
      );
      return facility?.name || "Unknown Facility";
    } else if (
      typeof booking.facility === "object" &&
      booking.facility !== null
    ) {
      // If it's an object, use the name property
      return (booking.facility as any)?.name || "Unknown Facility";
    }

    return "Unknown Facility";
  };

  const handleRetry = () => {
    facilitiesRefetch();
    bookingsRefetch();
  };

  if (facilitiesLoading || bookingsLoading) {
    return <Loader text="Loading dashboard..." />;
  }

  if (facilitiesError || bookingsError) {
    return (
      <ErrorComponent
        title="Error Loading Dashboard"
        message={
          facilitiesErrorMessage?.message || bookingsErrorMessage?.message
        }
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Dashboard
            </h1>
            <p className="text-gray-600">
              Overview of all facility bookings and performance metrics
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link href="/admin/facilities/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Facility
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full flex flex-row justify-between">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 w-full"
            >
              <Gauge className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex w-full items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex w-full items-center gap-2"
            >
              <List className="h-4 w-4" />
              All Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.totalBookings}
                        </p>
                        <p className="text-sm text-gray-600">Total Bookings</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <CalendarDays className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <Badge
                        variant={
                          stats.weeklyGrowth >= 0 ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {stats.weeklyGrowth >= 0 ? "+" : ""}
                        {stats.weeklyGrowth}%
                      </Badge>
                      <span className="text-xs text-gray-500 ml-2">
                        from last week
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.confirmedBookings}
                        </p>
                        <p className="text-sm text-gray-600">Confirmed</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-xs text-gray-500">
                        {stats.totalBookings > 0
                          ? (
                              (stats.confirmedBookings / stats.totalBookings) *
                              100
                            ).toFixed(1)
                          : "0"}
                        % of total
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {currencyFormat(stats.totalRevenue)}
                        </p>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-xs text-gray-500">
                        Avg: {currencyFormat(stats.averageBookingValue)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.pendingBookings}
                        </p>
                        <p className="text-sm text-gray-600">Pending Review</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-xs text-gray-500">
                        {stats.pendingBookings > 0
                          ? "Requires attention"
                          : "All caught up!"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {currencyFormat(stats.weeklyRevenue)}
                        </p>
                        <p className="text-sm text-gray-600">Weekly Revenue</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {currencyFormat(stats.monthlyRevenue)}
                        </p>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePaginatedList
                  data={recentBookings}
                  itemsPerPage={5}
                  emptyMessage="No recent bookings found"
                  tableHeaders={
                    <tr>
                      <th className="text-left font-semibold text-gray-900 p-4">
                        Customer
                      </th>
                      <th className="text-left font-semibold text-gray-900 p-4">
                        Facility
                      </th>
                      <th className="text-left font-semibold text-gray-900 p-4">
                        Date
                      </th>
                      <th className="text-left font-semibold text-gray-900 p-4">
                        Status
                      </th>
                      <th className="text-left font-semibold text-gray-900 p-4">
                        Amount
                      </th>
                    </tr>
                  }
                  renderRow={(booking, index) => (
                    <tr
                      key={booking._id || index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {safeGetUserName(booking)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {safeGetUserEmail(booking)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {safeGetFacilityName(booking)}
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {formatDate(booking.startDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.duration || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">
                          {currencyFormat(booking.totalPrice || 0)}
                        </span>
                      </td>
                    </tr>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <BookingCalendar
              facilities={(facilities as any)?.data || (facilities as any)?.facilities || []}
              bookings={bookings as Booking[]}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
              onCreateBooking={handleCreateBooking}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement
              bookings={bookings as Booking[]}
              facilities={(facilities as any)?.data || (facilities as any)?.facilities || []}
              onRefresh={facilitiesRefetch}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
              onCreateBooking={handleCreateBooking}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingDashboard;
