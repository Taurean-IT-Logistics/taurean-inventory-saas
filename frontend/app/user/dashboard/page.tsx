"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarDays,
  CreditCard,
  MoreHorizontal,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Building2,
  Home,
  MessageSquare,
} from "lucide-react";
import {
  TransactionsAPI,
  BookingsAPI,
  InventoryAPI,
  PendingTransactionsAPI,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { currencyFormat } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import Link from "next/link";
import UserInvitations from "@/components/user/UserInvitations";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";
import { PaymentStatusBadge } from "@/components/booking/booking-calendar/paymentStatusBadge";
import { BookingStatusBadge } from "@/components/booking/booking-calendar/bookingStatusBadge";
import { InvoiceTemplate } from "@/components/templates/invoiceTemplate";
import { ReceiptTemplate } from "@/components/templates/receiptTemplate";
import { RentalGrid } from "@/components/rentals/rental-grid";

// Pending Payments Tab Component
function PendingPaymentsTab() {
  const {
    data: pendingTransactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-pending-transactions"],
    queryFn: () => PendingTransactionsAPI.getUserPendingTransactions(),
    staleTime: 5 * 60 * 1000,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Cash
          </Badge>
        );
      case "cheque":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Cheque
          </Badge>
        );
      case "bank_transfer":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Bank Transfer
          </Badge>
        );
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  if (isLoading) {
    return <Loader text="Loading pending payments..." />;
  }

  if (error) {
    return (
      <ErrorComponent
        message={(error as any)?.message}
        title="Failed to load pending payments"
      />
    );
  }

  const transactions = (pendingTransactions as any)?.data || [];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Payments
        </CardTitle>
        <CardDescription>
          Payments that need to be completed at the facility
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No pending payments
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don&apos;t have any pending payments at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction: any) => (
              <div
                key={transaction._id || transaction.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {transaction.type} Payment
                      </h4>
                      {getStatusBadge(transaction.status)}
                      {getPaymentMethodBadge(transaction.paymentMethod)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Amount:</strong>{" "}
                        {currencyFormat(transaction.amount)}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                      {transaction.notes && (
                        <p>
                          <strong>Notes:</strong> {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {currencyFormat(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.paymentMethod === "cash"
                        ? "Pay with cash"
                        : "Pay with cheque"}
                    </div>
                  </div>
                </div>
                {transaction.status === "pending" && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">
                          Payment Required at Facility
                        </p>
                        <p className="mt-1">
                          Please bring the exact amount in{" "}
                          {transaction.paymentMethod} when you arrive at the
                          facility. Your booking will be confirmed once payment
                          is received.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStats {
  totalBookings: number;
  totalSpent: number;
  pendingPayments: number;
  completedBookings: number;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Fetch user transactions
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ["user-transactions"],
    queryFn: () => TransactionsAPI.getUserTransactions(),
    enabled: !!user,
  });

  // Fetch user bookings
  const {
    data: bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ["user-bookings"],
    queryFn: () => BookingsAPI.getUserBookings(),
    enabled: !!user,
  });

  // Fetch available rentals
  const {
    data: rentals,
    isLoading: rentalsLoading,
    error: rentalsError,
  } = useQuery({
    queryKey: ["rentals"],
    queryFn: () => InventoryAPI.list({ status: "in_stock" }),
    enabled: !!user,
  });

  // Calculate dashboard stats
  const dashboardStats: DashboardStats = React.useMemo(() => {
    const stats = {
      totalBookings: (bookings as any)?.length || 0,
      totalSpent: 0,
      pendingPayments: 0,
      completedBookings: 0,
    };

    if (transactions as any) {
      stats.totalSpent = (transactions as any)
        .filter((t: any) => t.reconciled === true)
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // Calculate pending payments from transactions
      stats.pendingPayments = (transactions as any)
        .filter((t: any) => t.reconciled === false)
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    }

    if (bookings as any) {
      stats.completedBookings = (bookings as any).filter(
        (booking: any) => booking.status === "completed"
      ).length;
    }

    return stats;
  }, [transactions, bookings]);

  if (transactionsLoading || bookingsLoading || rentalsLoading) {
    return <Loader text="Loading dashboard..." className="pt-20" />;
  }

  const handleViewInvoice = (transactionId: string) => {
    setViewingInvoice(transactionId);
  };

  const handleCloseInvoice = () => {
    setViewingInvoice(null);
  };

  const handleViewReceipt = (transactionId: string) => {
    setViewingReceipt(transactionId);
  };

  const handleCloseReceipt = () => {
    setViewingReceipt(null);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8 mt-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here&apos;s your account overview.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <div className="p-3 bg-blue-100 rounded-xl">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {dashboardStats.totalBookings}
            </div>
            <p className="text-sm text-muted-foreground">
              {dashboardStats.completedBookings} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {currencyFormat(dashboardStats.totalSpent)}
            </div>
            <p className="text-sm text-muted-foreground">Across all bookings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Wallet className="h-6 w-6 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {currencyFormat(dashboardStats.pendingPayments)}
            </div>
            <p className="text-sm text-muted-foreground">
              Outstanding invoices
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Bookings
            </CardTitle>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {(bookings as any)?.filter(
                (b: any) =>
                  b.status !== "cancelled" &&
                  b.status !== "completed" &&
                  b.status !== "pending"
              ).length || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Section */}
      {!user?.company && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Access
            </CardTitle>
            <CardDescription>
              Join a company to access business features and manage facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You&apos;re not currently associated with any company
                </p>
                <p className="text-sm text-muted-foreground">
                  Request to join a company or become a host to get started
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/user/join-requests">
                    <Building2 className="h-4 w-4 mr-2" />
                    View Join Requests
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/user/host">
                    <Home className="h-4 w-4 mr-2" />
                    Become a Host
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Status Section */}
      {user?.company && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Status
            </CardTitle>
            <CardDescription>
              You are currently associated with a company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Company: {(user.company as any)?.name || "Unknown Company"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Role: {user.role || "User"}
                </p>
              </div>
              <Button asChild>
                <Link href="/admin">
                  <Building2 className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="pending-payments">Pending Payments</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Join Requests */}
          {!user?.company && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Recent Join Requests
                </CardTitle>
                <CardDescription>
                  Your latest company join requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This will be populated by the UserJoinRequests component */}
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Loading join requests...
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/user/join-requests">
                      <Building2 className="h-4 w-4 mr-2" />
                      View All Join Requests
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Your latest payment activities</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsError ? (
                <ErrorComponent
                  title="Error loading transactions"
                  message={transactionsError.message}
                />
              ) : !(transactions as any) ||
                (transactions as any).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found
                </p>
              ) : (
                <div className="space-y-4">
                  {(transactions as any).slice(0, 5).map((transaction: any) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <PaymentStatusBadge
                          status={
                            transaction.reconciled ? "completed" : "pending"
                          }
                        />
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
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {currencyFormat(transaction.amount)}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(transaction._id)}
                            className="mt-1 h-6 px-2 text-xs"
                          >
                            Invoice
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReceipt(transaction._id)}
                            className="mt-1 h-6 px-2 text-xs"
                          >
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                My Bookings
              </CardTitle>
              <CardDescription>All your facility bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsError ? (
                <ErrorComponent
                  title="Error loading bookings"
                  message={bookingsError.message}
                />
              ) : !(bookings as any) || (bookings as any).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No bookings found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking #</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(bookings as any).map((booking: any) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">
                          #{booking._id.slice(-8)}
                        </TableCell>
                        <TableCell>{booking.facility?.name}</TableCell>
                        <TableCell>
                          {new Date(booking.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{booking.duration} hours</TableCell>
                        <TableCell>
                          {currencyFormat(booking.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              {booking.status === "pending" && (
                                <DropdownMenuItem>
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {viewingInvoice ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Invoice Details
                  </CardTitle>
                  <Button variant="outline" onClick={handleCloseInvoice}>
                    ← Back to Transactions
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const transaction = (transactions as any)?.find(
                    (t: any) => t._id === viewingInvoice
                  );
                  if (!transaction) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        Transaction not found
                      </div>
                    );
                  }
                  return <InvoiceTemplate transaction={transaction} />;
                })()}
              </CardContent>
            </Card>
          ) : viewingReceipt ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Receipt Details
                  </CardTitle>
                  <Button variant="outline" onClick={handleCloseReceipt}>
                    ← Back to Transactions
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const transaction = (transactions as any)?.find(
                    (t: any) => t._id === viewingReceipt
                  );
                  if (!transaction) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        Transaction not found
                      </div>
                    );
                  }
                  return <ReceiptTemplate transaction={transaction} />;
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  All Transactions
                </CardTitle>
                <CardDescription>
                  Detailed list of all your transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsError ? (
                  <ErrorComponent
                    title="Error loading transactions"
                    message={transactionsError.message}
                  />
                ) : !(transactions as any) ||
                  (transactions as any).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No transactions found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(transactions as any).map((transaction: any) => (
                        <TableRow key={transaction._id}>
                          <TableCell className="font-medium">
                            #{transaction._id.slice(-8)}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {currencyFormat(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <PaymentStatusBadge
                              status={
                                transaction.reconciled ? "completed" : "pending"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewInvoice(transaction._id)
                                  }
                                >
                                  View Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewReceipt(transaction._id)
                                  }
                                >
                                  View Receipt
                                </DropdownMenuItem>
                                {transaction.status === "pending" && (
                                  <DropdownMenuItem>
                                    Cancel Transaction
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending-payments" className="space-y-6">
          <PendingPaymentsTab />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                My Invitations
              </CardTitle>
              <CardDescription>
                Invitations you have received to join companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserInvitations />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Available Rentals
              </CardTitle>
              <CardDescription>
                Browse and rent equipment for your events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rentalsError ? (
                <ErrorComponent
                  title="Error loading rentals"
                  message={rentalsError.message}
                />
              ) : (
                <RentalGrid
                  title="Available Equipment"
                  rentals={(rentals as any) || []}
                  isLoading={rentalsLoading}
                  error={
                    (rentalsError as any).message || "Error loading rentals"
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Support
              </CardTitle>
              <CardDescription>
                Get help and support from our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Support assistance available</p>
                <p className="text-sm">
                  Use the chat widget in the bottom-right corner for immediate
                  support
                </p>
                <div className="mt-4">
                  <Button asChild className="flex items-center gap-2">
                    <Link href="/support">
                      <MessageSquare className="h-4 w-4" />
                      Visit Support Page
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Chat Widget - Always visible */}
      <EnhancedChatWidget />
    </div>
  );
};

export default UserDashboard;
