"use client";

import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CashflowAPI, PayoutsAPI, UsersAPI, TransactionsAPI } from "@/lib/api";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import PaginatedList from "@/components/paginatedList";
import {
  DollarSign,
  CreditCard,
  Banknote,
  Calendar,
  User,
  Edit,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { currencyFormat } from "@/lib/utils";

interface PayoutRequest {
  _id: string;
  company: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "processing" | "completed" | "failed";
  recipientCode: string;
  requestedBy: string;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SubaccountDetails {
  _id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  paystackSubaccountCode: string;
  paystackSubaccountId: string;
  settlementBank: string;
  accountNumber: string;
  accountName: string;
  percentageCharge: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutPage = () => {
  const queryClient = useQueryClient();
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    notes: "",
  });

  // Real-time updates for payouts
  useRealtimeUpdates({
    queryKeys: ["payouts", "cashflow-summary"],
    events: ["TransactionCreated", "TransactionUpdated"],
    showNotifications: true,
    notificationTitle: "Payout Update",
  });

  // Fetch payout data
  const { data: cashflowData, isLoading: balanceLoading } = useQuery({
    queryKey: ["cashflow-summary"],
    queryFn: () => CashflowAPI.summary(),
  });

  const { data: payoutsData, isLoading: payoutsLoading } = useQuery({
    queryKey: ["payouts"],
    queryFn: () => PayoutsAPI.getPayouts(),
  });

  const { data: subaccountsData, isLoading: subaccountsLoading } = useQuery({
    queryKey: ["subaccounts"],
    queryFn: () => UsersAPI.getSubaccounts(),
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => TransactionsAPI.listCompany(),
  });

  // Extract data with proper typing
  const payableBalance = (cashflowData as any)?.net || 0;
  const payouts = (payoutsData as any)?.payouts || payoutsData || [];
  const subaccounts =
    (subaccountsData as any)?.subaccounts || subaccountsData || [];
  const recentTransactions =
    (transactionsData as any)?.transactions || transactionsData || [];

  // Mutations
  const updatePayoutMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<PayoutRequest> }) =>
      PayoutsAPI.updatePayout(data.id, data.updates),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payout updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payout",
      });
    },
  });

  const requestPayoutMutation = useMutation({
    mutationFn: (data: { amount: number; currency: string }) =>
      PayoutsAPI.requestPayout(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payout request submitted successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["payouts", "cashflow-summary"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request payout",
      });
    },
  });

  const handleEditPayout = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setEditForm({
      status: payout.status,
      notes: "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPayout) return;

    updatePayoutMutation.mutate({
      id: selectedPayout._id,
      updates: { status: editForm.status as PayoutRequest["status"] },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "warning";
      case "approved":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <AlertCircle className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (
    balanceLoading ||
    payoutsLoading ||
    subaccountsLoading ||
    transactionsLoading
  ) {
    return <Loader text="Loading payout data..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payout Management
          </h1>
          <p className="text-gray-600">
            Manage user payouts and subaccount details
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {currencyFormat(payableBalance)}
                  </p>
                  <p className="text-sm text-gray-600">Net Cash Flow</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(payouts)
                      ? payouts.filter(
                          (p: PayoutRequest) => p.status === "pending"
                        ).length
                      : 0}
                  </p>
                  <p className="text-sm text-gray-600">Pending Payouts</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {currencyFormat(
                      Array.isArray(payouts)
                        ? payouts.reduce(
                            (sum: number, p: PayoutRequest) =>
                              p.status === "completed" ? sum + p.amount : sum,
                            0
                          )
                        : 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Paid</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(subaccounts) ? subaccounts.length : 0}
                  </p>
                  <p className="text-sm text-gray-600">Active Subaccounts</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subaccount Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subaccount Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(subaccounts) && subaccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">User</th>
                      <th className="text-left p-4 font-semibold">
                        Account Details
                      </th>
                      <th className="text-left p-4 font-semibold">
                        Paystack Code
                      </th>
                      <th className="text-left p-4 font-semibold">Charge %</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subaccounts.map((subaccount: SubaccountDetails) => (
                      <tr
                        key={subaccount._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium">
                              {subaccount.user?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subaccount.user?.email || "No email"}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">
                              {subaccount.accountName || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subaccount.settlementBank || "N/A"} -{" "}
                              {subaccount.accountNumber || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {subaccount.paystackSubaccountCode || "N/A"}
                          </code>
                        </td>
                        <td className="p-4">
                          {subaccount.percentageCharge || 0}%
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              subaccount.isActive ? "default" : "secondary"
                            }
                          >
                            {subaccount.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No subaccounts found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout Requests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Payout Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(payouts) && payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Company</th>
                      <th className="text-left p-4 font-semibold">Amount</th>
                      <th className="text-left p-4 font-semibold">Recipient</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Date</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout: PayoutRequest) => (
                      <tr
                        key={payout._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium">
                              Company ID: {payout.company}
                            </div>
                            <div className="text-sm text-gray-500">
                              Requested by: {payout.requestedBy}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold">
                          {currencyFormat(payout.amount || 0)} {payout.currency}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {payout.recipientCode || "N/A"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={getStatusColor(payout.status) as any}
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(payout.status)}
                            {(payout.status || "pending").toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {payout.createdAt
                            ? new Date(payout.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPayout(payout)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No payout requests found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(recentTransactions) &&
            recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">User</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Amount</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.slice(0, 20).map((transaction: any) => (
                      <tr
                        key={transaction._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div className="font-medium">
                            {transaction.user?.name || "Unknown"}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {(transaction.type || "unknown").toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 font-semibold">
                          {currencyFormat(transaction.amount || 0)}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {(transaction.status || "pending").toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {transaction.createdAt
                            ? new Date(
                                transaction.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent transactions found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Payout Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Payout Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder="Add any notes about this payout..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updatePayoutMutation.isPending}
                >
                  {updatePayoutMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PayoutPage;
