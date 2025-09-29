"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TransactionsAPI,
  BookingsAPI,
  InventoryAPI,
  PendingTransactionsAPI,
} from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import UserInvitationsSection from "@/components/user/UserInvitationsSection";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";
import PaymentBalanceTracking from "@/components/user/PaymentBalanceTracking";
import DashboardStats from "@/components/user/DashboardStats";
import RecentTransactions from "@/components/user/RecentTransactions";
import BookingsTable from "@/components/user/BookingsTable";
import TransactionsTable from "@/components/user/TransactionsTable";
import CompanyAccess from "@/components/user/CompanyAccess";
import RecentJoinRequests from "@/components/user/RecentJoinRequests";
import RentalsSection from "@/components/user/RentalsSection";

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [transactionsViewingInvoice, setTransactionsViewingInvoice] = useState<
    string | null
  >(null);
  const [transactionsViewingReceipt, setTransactionsViewingReceipt] = useState<
    string | null
  >(null);

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

  // Fetch pending transactions
  const {
    data: pendingTransactions,
    isLoading: pendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ["user-pending-transactions"],
    queryFn: () => PendingTransactionsAPI.getUserPendingTransactions(),
    enabled: !!user,
  });

  // Calculate dashboard stats
  const dashboardStats = React.useMemo(() => {
    const stats = {
      totalBookings: (bookings as any)?.length || 0,
      totalSpent: 0,
      pendingPayments: 0,
      completedBookings: 0,
      activeBookings: 0,
    };

    if (transactions as any) {
      // Calculate total spent (reconciled transactions)
      const reconciledAmount = (transactions as any)
        .filter((t: any) => t.reconciled === true)
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // Calculate pending payments from transactions
      const pendingAmount = (transactions as any)
        .filter((t: any) => t.reconciled === false)
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // Total spent includes both reconciled and pending payments
      stats.totalSpent = reconciledAmount + pendingAmount;
      stats.pendingPayments = pendingAmount;
    }

    if (bookings as any) {
      stats.completedBookings = (bookings as any).filter(
        (booking: any) => booking.status === "completed"
      ).length;

      stats.activeBookings = (bookings as any).filter(
        (b: any) =>
          b.status !== "cancelled" &&
          b.status !== "completed" &&
          b.status !== "pending"
      ).length;
    }

    return stats;
  }, [transactions, bookings]);

  if (
    transactionsLoading ||
    bookingsLoading ||
    rentalsLoading ||
    pendingLoading
  ) {
    return <Loader text="Loading dashboard..." className="pt-20" />;
  }

  const handleViewInvoice = (
    transactionId: string,
    tab: string = "overview"
  ) => {
    if (tab === "transactions") {
      setTransactionsViewingInvoice(transactionId);
    } else {
      setViewingInvoice(transactionId);
    }
  };

  const handleCloseInvoice = (tab: string = "overview") => {
    if (tab === "transactions") {
      setTransactionsViewingInvoice(null);
    } else {
      setViewingInvoice(null);
    }
  };

  const handleViewReceipt = (
    transactionId: string,
    tab: string = "overview"
  ) => {
    if (tab === "transactions") {
      setTransactionsViewingReceipt(transactionId);
    } else {
      setViewingReceipt(transactionId);
    }
  };

  const handleCloseReceipt = (tab: string = "overview") => {
    if (tab === "transactions") {
      setTransactionsViewingReceipt(null);
    } else {
      setViewingReceipt(null);
    }
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
      <DashboardStats {...dashboardStats} />

      {/* Company Access Section */}
      <CompanyAccess user={user} />

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
          <TabsTrigger value="rentals">Rentals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!user?.company && <RecentJoinRequests />}
          <RecentTransactions
            transactions={transactions}
            transactionsError={transactionsError}
            viewingInvoice={viewingInvoice}
            viewingReceipt={viewingReceipt}
            onViewInvoice={handleViewInvoice}
            onViewReceipt={handleViewReceipt}
            onCloseInvoice={handleCloseInvoice}
            onCloseReceipt={handleCloseReceipt}
          />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <BookingsTable bookings={bookings} bookingsError={bookingsError} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionsTable
            transactions={transactions}
            transactionsError={transactionsError}
            viewingInvoice={transactionsViewingInvoice}
            viewingReceipt={transactionsViewingReceipt}
            onViewInvoice={(id) => handleViewInvoice(id, "transactions")}
            onViewReceipt={(id) => handleViewReceipt(id, "transactions")}
            onCloseInvoice={() => handleCloseInvoice("transactions")}
            onCloseReceipt={() => handleCloseReceipt("transactions")}
          />
        </TabsContent>

        <TabsContent value="pending-payments" className="space-y-6">
          <PaymentBalanceTracking
            transactions={transactions}
            bookings={bookings}
            rentals={rentals}
            pendingTransactions={pendingTransactions}
            isLoading={
              transactionsLoading ||
              bookingsLoading ||
              rentalsLoading ||
              pendingLoading
            }
            error={
              transactionsError || bookingsError || rentalsError || pendingError
            }
          />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <UserInvitationsSection />
        </TabsContent>

        <TabsContent value="rentals" className="space-y-6">
          <RentalsSection
            rentals={rentals}
            rentalsError={rentalsError}
            rentalsLoading={rentalsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Enhanced Chat Widget - Always visible */}
      <EnhancedChatWidget />
    </div>
  );
};

export default UserDashboard;
