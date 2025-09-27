"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Transaction } from "@/types";
import TransactionStatsCards from "@/components/transactions/transactionStatCards";
import TransactionFilters from "@/components/transactions/transactionFilters";
import TransactionTable from "@/components/transactions/transactionTable";
import EditTransactionModal from "@/components/transactions/editTransactionModal";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { TransactionsAPI } from "@/lib/api";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

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

  if (isLoading) {
    return <Loader text="Loading..." />;
  }

  if (isError) {
    return (
      <ErrorComponent message="Error loading transactions" onRetry={refetch} />
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
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Cash Payment
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Split Payment
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Advance Payment
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        <TransactionStatsCards transactions={transactions as Transaction[]} />

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
      </div>
    </div>
  );
}
