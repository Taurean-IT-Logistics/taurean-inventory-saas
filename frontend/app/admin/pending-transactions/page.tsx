"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PendingTransactionsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { currencyFormat } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, Eye, Search, Filter } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/pagination";

export default function PendingTransactionsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processData, setProcessData] = useState({
    status: "confirmed" as "confirmed" | "rejected",
    notes: "",
    rejectionReason: "",
  });

  const { pagination, setPage, setLimit } = usePagination({
    initialPage: 1,
    initialLimit: 10,
  });

  // Fetch pending transactions
  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "pending-transactions",
      pagination.page,
      pagination.limit,
      searchTerm,
      statusFilter,
    ],
    queryFn: () =>
      PendingTransactionsAPI.listCompany({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    staleTime: 5 * 60 * 1000,
  });

  // Process transaction mutation
  const processTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      PendingTransactionsAPI.process(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-transactions"] });
      setIsProcessDialogOpen(false);
      setProcessData({ status: "confirmed", notes: "", rejectionReason: "" });
      setSelectedTransaction(null);
      toast({
        title: "Success",
        description: "Transaction processed successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process transaction",
        variant: "destructive",
      });
    },
  });

  const handleProcessTransaction = () => {
    if (!selectedTransaction) return;

    const data = {
      status: processData.status,
      notes: processData.notes,
      rejectionReason:
        processData.status === "rejected"
          ? processData.rejectionReason
          : undefined,
    };

    processTransactionMutation.mutate({
      id: selectedTransaction._id || selectedTransaction.id,
      data,
    });
  };

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
    return <Loader text="Loading pending transactions..." />;
  }

  if (error) {
    return (
      <ErrorComponent
        message={(error as any)?.message}
        title="Failed to load pending transactions"
        onRetry={refetch}
      />
    );
  }

  const transactions = (transactionsData as any)?.data || [];
  const total = (transactionsData as any)?.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Transactions
          </h1>
          <p className="text-gray-600 mt-2">
            Manage cash and cheque payments that need to be processed at the
            facility
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {transactions.filter((t: any) => t.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Confirmed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
                  transactions.filter((t: any) => t.status === "confirmed")
                    .length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rejected Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {
                  transactions.filter((t: any) => t.status === "rejected")
                    .length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {currencyFormat(
                  transactions.reduce(
                    (sum: number, t: any) => sum + (t.amount || 0),
                    0
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by user, amount, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Transactions</CardTitle>
            <CardDescription>
              Review and process payments made at the facility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction._id || transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transaction.user?.firstName}{" "}
                            {transaction.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {currencyFormat(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(transaction.paymentMethod)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(transaction.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedTransaction(transaction)
                                }
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                                <DialogDescription>
                                  Review transaction information before
                                  processing
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>User</Label>
                                    <p className="text-sm font-medium">
                                      {transaction.user?.firstName}{" "}
                                      {transaction.user?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {transaction.user?.email}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Amount</Label>
                                    <p className="text-sm font-medium">
                                      {currencyFormat(transaction.amount)}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Payment Method</Label>
                                    <p className="text-sm font-medium capitalize">
                                      {transaction.paymentMethod}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <div className="mt-1">
                                      {getStatusBadge(transaction.status)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Type</Label>
                                    <p className="text-sm font-medium capitalize">
                                      {transaction.type}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Created</Label>
                                    <p className="text-sm font-medium">
                                      {format(
                                        new Date(transaction.createdAt),
                                        "MMM dd, yyyy HH:mm"
                                      )}
                                    </p>
                                  </div>
                                </div>
                                {transaction.notes && (
                                  <div>
                                    <Label>Notes</Label>
                                    <p className="text-sm bg-gray-50 p-3 rounded-md">
                                      {transaction.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {transaction.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setIsProcessDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Process
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={total}
                  itemsPerPage={pagination.limit}
                  onPageChange={setPage}
                  onItemsPerPageChange={setLimit}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Process Transaction Dialog */}
        <Dialog
          open={isProcessDialogOpen}
          onOpenChange={setIsProcessDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Transaction</DialogTitle>
              <DialogDescription>
                Confirm or reject this pending transaction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={processData.status}
                  onValueChange={(value: "confirmed" | "rejected") =>
                    setProcessData({ ...processData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirm</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this transaction..."
                  value={processData.notes}
                  onChange={(e) =>
                    setProcessData({ ...processData, notes: e.target.value })
                  }
                />
              </div>

              {processData.status === "rejected" && (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Explain why this transaction is being rejected..."
                    value={processData.rejectionReason}
                    onChange={(e) =>
                      setProcessData({
                        ...processData,
                        rejectionReason: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsProcessDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessTransaction}
                disabled={
                  processTransactionMutation.isPending ||
                  (processData.status === "rejected" &&
                    !processData.rejectionReason.trim())
                }
              >
                {processTransactionMutation.isPending
                  ? "Processing..."
                  : "Process Transaction"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
