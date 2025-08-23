"use client";

import React, { useState } from "react";
import BookingCalendar from "@/components/booking/booking-calendar";
import { FacilitiesAPI, TransactionsAPI, InvoicesAPI } from "@/lib/api";
import { Facility } from "@/types";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useBookings } from "@/hooks/useBookings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarDays,
  Building2,
  DollarSign,
  Download,
  FileText,
  Receipt,
  BarChart3,
} from "lucide-react";
import { currencyFormat } from "@/lib/utils";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Use the bookings hook for all booking operations
  const {
    bookings,
    isLoadingBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    isCreating,
    isUpdating,
    isDeleting,
  } = useBookings();

  // Real-time updates for bookings and facilities
  useRealtimeUpdates({
    queryKeys: [
      "bookings-company",
      "facilities-company",
      "transactions-company",
      "invoices-company",
    ],
    events: [
      "BookingCreated",
      "BookingUpdated",
      "InventoryCreated",
      "InventoryUpdated",
      "TransactionCreated",
      "InvoiceCreated",
    ],
    showNotifications: true,
    notificationTitle: "Admin Dashboard Update",
  });

  const {
    data: facilities,
    isError: facilitiesError,
    isLoading: facilitiesLoading,
    error: facilitiesErrorMessage,
  } = useQuery({
    queryKey: ["facilities-company"],
    queryFn: () => FacilitiesAPI.listCompany(),
  });

  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ["transactions-company"],
    queryFn: () => TransactionsAPI.listCompany(),
  });

  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices-company"],
    queryFn: () => InvoicesAPI.listCompany(),
  });

  // Calculate dashboard stats
  const dashboardStats = React.useMemo(() => {
    const stats = {
      totalBookings: (bookings as any)?.length || 0,
      totalFacilities: facilities?.facilities?.length || 0,
      totalRevenue: 0,
      pendingInvoices: 0,
      activeBookings: 0,
      completedBookings: 0,
    };

    if ((transactions as any)?.data) {
      stats.totalRevenue = (transactions as any).data
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    }

    if ((invoices as any)?.invoices) {
      stats.pendingInvoices = (invoices as any).invoices.filter(
        (inv: any) => inv.status === "pending"
      ).length;
    }

    if (bookings) {
      stats.activeBookings = (bookings as any).filter(
        (b: any) => b.status === "active"
      ).length;
      stats.completedBookings = (bookings as any).filter(
        (b: any) => b.status === "completed"
      ).length;
    }

    return stats;
  }, [bookings, facilities, transactions, invoices]);

  const handleDeleteBooking = async (bookingId: string) => {
    deleteBooking(bookingId);
  };

  const handleUpdateBooking = async (booking: Partial<Booking>) => {
    try {
      if (booking._id) {
        updateBooking({ id: booking._id, payload: booking });
      }
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
    createBooking(payload);
  };

  const handleExportData = async (
    type: "transactions" | "bookings" | "invoices",
    format: "csv" | "excel"
  ) => {
    try {
      const response = await fetch(
        `/api/v1/transactions/export/${type}?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Failed to export ${type}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${type}-export.${format === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to export ${type}`,
        variant: "destructive",
      });
    }
  };

  if (
    facilitiesLoading ||
    isLoadingBookings ||
    transactionsLoading ||
    invoicesLoading
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  if (facilitiesError) {
    return (
      <ErrorComponent
        message={facilitiesErrorMessage?.message}
        showGoHome={true}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your facilities, bookings, and business operations
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => handleExportData("transactions", "csv")}
            >
              Export Transactions (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExportData("transactions", "excel")}
            >
              Export Transactions (Excel)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExportData("bookings", "csv")}
            >
              Export Bookings (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExportData("invoices", "csv")}
            >
              Export Invoices (CSV)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.activeBookings} active,{" "}
              {dashboardStats.completedBookings} completed
            </p>
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
              {dashboardStats.totalFacilities}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormat(dashboardStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From all transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.pendingInvoices}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Booking Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Recent Bookings
                </CardTitle>
                <CardDescription>Latest facility bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {!bookings || (bookings as any).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No bookings found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {(bookings as any).slice(0, 5).map((booking: any) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {booking.facility?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.user?.name} •{" "}
                            {new Date(booking.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {currencyFormat(booking.totalPrice)}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {booking.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest payment activities</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsError ? (
                  <ErrorComponent
                    title="Error loading transactions"
                    message={transactionsError.message}
                  />
                ) : !(transactions as any)?.data ||
                  (transactions as any).data.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No transactions found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {(transactions as any).data
                      .slice(0, 5)
                      .map((transaction: any) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-medium ${
                                transaction.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {currencyFormat(transaction.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <BookingCalendar
            facilities={facilities?.facilities as Facility[]}
            bookings={bookings as any}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onCreateBooking={handleCreateBooking}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Business Analytics
              </CardTitle>
              <CardDescription>
                Insights and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(
                      (dashboardStats.completedBookings /
                        Math.max(dashboardStats.totalBookings, 1)) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completion Rate
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {currencyFormat(
                      dashboardStats.totalRevenue /
                        Math.max(dashboardStats.totalBookings, 1)
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg. Revenue per Booking
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardStats.totalFacilities > 0
                      ? Math.round(
                          dashboardStats.totalBookings /
                            dashboardStats.totalFacilities
                        )
                      : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg. Bookings per Facility
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
