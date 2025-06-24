import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Transaction } from 'types';
import { mockUser } from 'data';
import TransactionStatsCards from 'components/transaction/TransactionStatsCard';
import TransactionFilters from 'components/transaction/TransactionFilters';
import TransactionTable from 'components/transaction/TransactionTable';
import EditTransactionModal from 'components/transaction/EditTransactionModal';

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      user: mockUser,
      type: 'booking_payment',
      category: 'facility_booking',
      amount: 1500,
      method: 'card',
      paymentDetails: {
        paystackReference: 'PS_REF_123456789'
      },
      ref: 'TXN_001',
      reconciled: true,
      reconciledAt: new Date('2024-12-20'),
      description: 'Conference Room A booking payment',
      attachments: [],
      tags: ['booking', 'conference'],
      isDeleted: false,
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date('2024-12-20')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

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

  const handleSaveEdit = (updatedTransaction: Transaction) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.ref === updatedTransaction.ref ? updatedTransaction : txn
      )
    );
  };

  const handleReconcile = (transactionRef: string) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.ref === transactionRef
          ? { ...txn, reconciled: true, reconciledAt: new Date() }
          : txn
      )
    );
  };

  return (
    <div className=" min-vh-100">
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Transaction Management</h1>
            <p className="text-muted mb-0">
              Monitor and manage all financial transactions
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/create-transaction" className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Transaction
            </Link>
            <Link to="/admin" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
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
      </Container>
    </div>
  );
};

export default TransactionManagement;
