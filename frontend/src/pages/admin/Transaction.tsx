import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Transaction } from 'types';
import { currencyFormat } from 'helpers/utils';
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

  const handlePrint = (transactionId: string, type: 'receipt' | 'report') => {
    // Mock print functionality
    console.log(`Printing ${type} for transaction: ${transactionId}`);

    // Create a simple print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const transaction = transactions.find(t => t.ref === transactionId);
      if (transaction) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${
                type === 'receipt' ? 'Receipt' : 'Transaction Report'
              } - ${transactionId}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .details { margin-bottom: 20px; }
                .amount { font-size: 24px; font-weight: bold; color: #007bff; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Facility Management System</h1>
                <h2>${
                  type === 'receipt' ? 'Payment Receipt' : 'Transaction Report'
                }</h2>
              </div>
              <div class="details">
                <p><strong>Reference:</strong> ${transaction.ref}</p>
                <p><strong>Date:</strong> ${transaction.createdAt.toLocaleDateString()}</p>
                <p><strong>User:</strong> ${transaction.user.name}</p>
                <p><strong>Email:</strong> ${transaction.user.email}</p>
                <p><strong>Type:</strong> ${transaction.type}</p>
                <p><strong>Method:</strong> ${transaction.method}</p>
                <p><strong>Status:</strong> ${
                  transaction.reconciled ? 'Reconciled' : 'Pending'
                }</p>
                <p class="amount"><strong>Amount:</strong> ${currencyFormat(
                  transaction.amount
                )}</p>
                ${
                  transaction.description
                    ? `<p><strong>Description:</strong> ${transaction.description}</p>`
                    : ''
                }
              </div>
              <script>window.print(); window.close();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
  //   console.log(`Exporting transactions as ${format}`);

  //   if (format === 'csv') {
  //     // Simple CSV export
  //     const csvContent = [
  //       'Reference,Date,User,Email,Type,Method,Amount,Status',
  //       ...filteredTransactions.map(
  //         txn =>
  //           `${txn.ref},${txn.createdAt.toLocaleDateString()},${
  //             txn.user.name
  //           },${txn.user.email},${txn.type},${txn.method},${txn.amount},${
  //             txn.reconciled ? 'Reconciled' : 'Pending'
  //           }`
  //       )
  //     ].join('\n');

  //     const blob = new Blob([csvContent], { type: 'text/csv' });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   } else {
  //     alert(
  //       `${format.toUpperCase()} export functionality would be implemented here`
  //     );
  //   }
  // };

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Transaction Management</h1>
            <p className="text-muted mb-0">
              Monitor and manage all financial transactions
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/create-transaction" className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Transaction
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
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
          onPrint={handlePrint}
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
