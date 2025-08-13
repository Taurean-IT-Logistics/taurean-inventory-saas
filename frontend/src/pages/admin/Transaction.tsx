import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'components/ui';
import {  } from '';
import { faPlus, faArrowLeft } from 'lucide-react';
import { Transaction } from 'types';
import TransactionStatsCards from 'components/transaction/TransactionStatsCard';
import TransactionFilters from 'components/transaction/TransactionFilters';
import TransactionTable from 'components/transaction/TransactionTable';
import EditTransactionModal from 'components/transaction/EditTransactionModal';
import { TransactionController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { RootState } from 'lib/store';
import { showToast } from 'components/toaster/toaster';
import QuickActionsSidebar from 'components/dashboard/QuickActions';

const TransactionManagement = () => {
  const { tokens } = useAppSelector((state: RootState) => state.auth);
  const accessToken = tokens.accessToken;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response =
        await TransactionController.getAllTransactions(accessToken);

      if (response.success) {
        setTransactions(response.data as Transaction[]);
      }
    }

    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch =
      txn.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'reconciled' && txn.reconciled) ||
      (statusFilter === 'pending' && !txn.reconciled);
    const matchesType = typeFilter === 'all' || txn.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType && !txn.isDeleted;
  });

  const handleView = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedTransaction: Transaction) => {
    try {
      const response = await TransactionController.updateTransaction(
        updatedTransaction._id,
        updatedTransaction,
        accessToken
      );

      if (response.success) {
        setTransactions(prev =>
          prev.map(txn =>
            txn.ref === updatedTransaction.ref ? updatedTransaction : txn
          )
        );
        showToast('success', 'Transaction updated successfully');
      }
    } catch (error) {
      showToast('error', error);
    }
  };

  const handleReconcile = async (transactionRef: string) => {
    try {
      const transaction = transactions.find(t => t.ref === transactionRef);

      transaction.reconciled = !transaction.reconciled;
      const response = await TransactionController.updateTransaction(
        transaction._id,
        transaction,
        accessToken
      );
      if (response.success) {
        setTransactions(prev =>
          prev.map(txn =>
            txn.ref === transactionRef
              ? { ...txn, reconciled: true, reconciledAt: new Date() }
              : txn
          )
        );
        showToast('success', 'Transaction reconciled successfully');
      }
    } catch (error) {
      showToast('error', error);
    }
  };

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Transaction Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              Monitor and manage all financial transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/create-transaction" className="btn btn-primary">
              < icon={faPlus} className="me-2" />
              Add Transaction
            </Link>
            <Link to="/admin/" className="btn btn-outline-secondary">
              < icon={faArrowLeft} className="me-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <TransactionStatsCards transactions={transactions} />

        <TransactionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
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

        <div className="mt-6">
          <QuickActionsSidebar />
        </div>
      </Container>
    </div>
  );
};

export default TransactionManagement;
