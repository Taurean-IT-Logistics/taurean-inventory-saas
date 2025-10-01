"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreVertical,
  CreditCard,
  Split,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { currencyFormat } from "@/lib/utils";
import { format } from "date-fns";
import type { Transaction } from "@/types";
import TransactionStatsCards from "@/components/transactions/transactionStatCards";
import TransactionFilters from "@/components/transactions/transactionFilters";
import TransactionTable from "@/components/transactions/transactionTable";
import EditTransactionModal from "@/components/transactions/editTransactionModal";
import CashChequeTransactionModal from "@/components/transactions/CashChequeTransactionModal";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { TransactionsAPI, PendingTransactionsAPI } from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

export default function AdminTransactionsPage() {
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Real-time updates for transactions
  useRealtimeUpdates({
    queryKeys: ["transactions-company"],
    events: ["TransactionCreated", "TransactionUpdated"],
    showNotifications: true,
    notificationTitle: "Transaction Update",
  });

  const {
    data: transactions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["transactions-company"],
    queryFn: () => TransactionsAPI.listCompany(),
  });

  // Fetch pending transactions
  const {
    data: pendingTransactionsData,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ["pending-transactions"],
    queryFn: () =>
      PendingTransactionsAPI.listCompany({
        page: 1,
        limit: 100,
        search: "",
        status: undefined,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const updateTransactionMutation = useMutation({
    mutationFn: (transaction: Transaction) =>
      TransactionsAPI.update(transaction._id, transaction),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions-company"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update transaction",
      });
    },
  });

  // Process transaction mutation
  const processTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      PendingTransactionsAPI.process(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-company"] });
      setIsProcessDialogOpen(false);
      setProcessData({ status: "confirmed", notes: "", rejectionReason: "" });
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processData, setProcessData] = useState({
    status: "confirmed" as "confirmed" | "rejected",
    notes: "",
    rejectionReason: "",
  });

  // Cash/Cheque transaction modal state
  const [isCashChequeModalOpen, setIsCashChequeModalOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<
    "cash" | "cheque" | "split" | "advance"
  >("cash");

  const filteredTransactions = (transactions as Transaction[]).filter((txn) => {
    const matchesSearch =
      txn.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "reconciled" && txn.reconciled) ||
      (statusFilter === "pending" && !txn.reconciled);
    const matchesType = typeFilter === "all" || txn.type === typeFilter;
    const matchesPaymentMethod =
      paymentMethodFilter === "all" ||
      (paymentMethodFilter === "paystack" && txn.method === "paystack") ||
      (paymentMethodFilter === "cash" && txn.method === "cash") ||
      (paymentMethodFilter === "cheque" && txn.method === "cheque") ||
      (paymentMethodFilter === "split" && txn.method === "split") ||
      (paymentMethodFilter === "advance" && txn.method === "advance");
    return (
      matchesSearch && matchesStatus && matchesType && matchesPaymentMethod
    );
  });

  const handleView = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedTransaction: Transaction) => {
    await updateTransactionMutation.mutateAsync(updatedTransaction);
    setShowEditModal(false);
    setEditingTransaction(null);
  };

  const handleReconcile = async (transactionRef: string) => {
    const transaction = (transactions as Transaction[]).find(
      (txn) => txn.ref === transactionRef
    );
    if (!transaction) return;
    await updateTransactionMutation.mutateAsync({
      ...transaction,
      reconciled: !transaction.reconciled,
    });
  };

  const handleProcessTransaction = () => {
    if (!editingTransaction) return;

    processTransactionMutation.mutate({
      id: editingTransaction._id,
      data: processData,
    });
  };

  const handleProcessPendingTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsProcessDialogOpen(true);
  };

  // Handle opening cash/cheque transaction modal
  const handleOpenCashChequeModal = (
    type: "cash" | "cheque" | "split" | "advance"
  ) => {
    setSelectedTransactionType(type);
    setIsCashChequeModalOpen(true);
  };

  // Handle closing cash/cheque transaction modal
  const handleCloseCashChequeModal = () => {
    setIsCashChequeModalOpen(false);
    setSelectedTransactionType("cash");
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      paystack: { className: "bg-blue-100 text-blue-800", text: "Paystack" },
      card: { className: "bg-blue-100 text-blue-800", text: "Card" },
      mobile_money: {
        className: "bg-cyan-100 text-cyan-800",
        text: "Mobile Money",
      },
      bank: { className: "bg-gray-100 text-gray-800", text: "Bank Transfer" },
      cash: { className: "bg-green-100 text-green-800", text: "Cash" },
      cheque: { className: "bg-orange-100 text-orange-800", text: "Cheque" },
      split: {
        className: "bg-indigo-100 text-indigo-800",
        text: "Split Payment",
      },
      advance: {
        className: "bg-pink-100 text-pink-800",
        text: "Advance Payment",
      },
    };

    const config = methodConfig[method as keyof typeof methodConfig] || {
      className: "bg-gray-100 text-gray-800",
      text: method,
    };
    return (
      <Badge variant="secondary" className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const pendingTransactions = (pendingTransactionsData as any)?.data || [];

  if (isLoading || pendingLoading) {
    return <Loader text="Loading transactions..." />;
  }

  if (isError || pendingError) {
    return (
      <ErrorComponent
        message={
          (isError as any)?.message ||
          (pendingError as any)?.message ||
          "Error loading transactions"
        }
        onRetry={() => {
          refetch();
          refetchPending();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Transaction Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage all financial transactions
            </p>
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                  <MoreVertical className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => handleOpenCashChequeModal("cash")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Cash Payment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenCashChequeModal("cheque")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Cheque Payment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenCashChequeModal("split")}
                >
                  <Split className="w-4 h-4 mr-2" />
                  Split Payment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenCashChequeModal("advance")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Advance Payment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TransactionStatsCards transactions={transactions as Transaction[]} />

        {/* Pending Transactions Section */}
        {pendingTransactions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Pending Transactions ({pendingTransactions.length})
              </CardTitle>
              <CardDescription>
                Cash and cheque payments that need to be processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTransactions.slice(0, 5).map((transaction: any) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-orange-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {transaction.ref}
                          </div>
                          <div className="text-sm text-gray-600">
                            {transaction.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {currencyFormat(transaction.amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {transaction.user?.name}
                          </div>
                        </div>
                        <div>{getPaymentMethodBadge(transaction.method)}</div>
                        <div className="text-sm text-gray-500">
                          {format(
                            new Date(transaction.createdAt),
                            "MMM dd, yyyy"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleProcessPendingTransaction(transaction)
                        }
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Process
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingTransactions.length > 5 && (
                  <div className="text-center text-gray-500 text-sm">
                    And {pendingTransactions.length - 5} more pending
                    transactions...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <TransactionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          paymentMethodFilter={paymentMethodFilter}
          setPaymentMethodFilter={setPaymentMethodFilter}
          filteredCount={filteredTransactions.length}
        />

        <TransactionTable
          transactions={filteredTransactions}
          onView={handleView}
          onReconcile={handleReconcile}
        />

        <EditTransactionModal
          transaction={editingTransaction}
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveEdit}
        />

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

            {editingTransaction && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Reference
                      </Label>
                      <div className="text-sm text-gray-900">
                        {editingTransaction.ref}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Amount
                      </Label>
                      <div className="text-sm font-bold text-gray-900">
                        {currencyFormat(editingTransaction.amount)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Method
                      </Label>
                      <div className="text-sm text-gray-900">
                        {editingTransaction.method}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        User
                      </Label>
                      <div className="text-sm text-gray-900">
                        {editingTransaction.user?.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes..."
                    value={processData.notes}
                    onChange={(e) =>
                      setProcessData({ ...processData, notes: e.target.value })
                    }
                  />
                </div>

                {processData.status === "rejected" && (
                  <div>
                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Why is this transaction being rejected?"
                      value={processData.rejectionReason}
                      onChange={(e) =>
                        setProcessData({
                          ...processData,
                          rejectionReason: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsProcessDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessTransaction}
                disabled={processTransactionMutation.isPending}
                className={
                  processData.status === "confirmed"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {processTransactionMutation.isPending ? (
                  "Processing..."
                ) : processData.status === "confirmed" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cash/Cheque Transaction Modal */}
        <CashChequeTransactionModal
          isOpen={isCashChequeModalOpen}
          onClose={handleCloseCashChequeModal}
          transactionType={selectedTransactionType}
        />
      </div>
    </div>
  );
}
