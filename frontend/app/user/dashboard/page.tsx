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
import { TransactionsAPI, BookingsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { currencyFormat } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import Link from "next/link";
import UserInvitations from "@/components/user/UserInvitations";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";

interface DashboardStats {
  totalBookings: number;
  totalSpent: number;
  pendingPayments: number;
  completedBookings: number;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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

  // Calculate dashboard stats
  const dashboardStats: DashboardStats = React.useMemo(() => {
    const stats = {
      totalBookings: (bookings as any)?.data?.length || 0,
      totalSpent: 0,
      pendingPayments: 0,
      completedBookings: 0,
    };

    if ((transactions as any)?.data) {
      stats.totalSpent = (transactions as any).data
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // Calculate pending payments from transactions
      stats.pendingPayments = (transactions as any).data
        .filter((t: any) => t.status === "pending")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    }

    if ((bookings as any)?.data) {
      stats.completedBookings = (bookings as any).data.filter(
        (booking: any) => booking.status === "completed"
      ).length;
    }

    return stats;
  }, [transactions, bookings]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (transactionsLoading || bookingsLoading) {
    return <Loader text="Loading dashboard..." className="pt-20" />;
  }

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
              {dashboardStats.completedBookings} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormat(dashboardStats.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">Across all bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormat(dashboardStats.pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Bookings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(bookings as any)?.data?.filter(
                (b: any) => b.status === "active"
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Section */}
      {!user?.company && (
        <Card>
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
        <Card>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Join Requests */}
          {!user?.company && (
            <Card>
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
          <Card>
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
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
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
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
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
              ) : !(bookings as any)?.data ||
                (bookings as any).data.length === 0 ? (
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
                    {(bookings as any).data.map((booking: any) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">
                          {booking.bookingNumber}
                        </TableCell>
                        <TableCell>{booking.facility?.name}</TableCell>
                        <TableCell>
                          {new Date(booking.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{booking.duration} hours</TableCell>
                        <TableCell>
                          {currencyFormat(booking.totalAmount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
          <Card>
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
              ) : !(transactions as any)?.data ||
                (transactions as any).data.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(transactions as any).data.map((transaction: any) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-medium">
                          {transaction._id.slice(-8)}
                        </TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {currencyFormat(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
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
        </TabsContent>

        

        

        <TabsContent value="invitations" className="space-y-6">
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
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
                  <Button
                    onClick={() => setActiveTab("chat")}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Open Support Chat
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
