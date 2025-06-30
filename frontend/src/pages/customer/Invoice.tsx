import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPrint,
  faDownload,
  faArrowLeft,
  faFileInvoice,
  faEye,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Spinner
} from 'react-bootstrap';
import { Transaction } from 'types';
import { currencyFormat } from 'helpers/utils';
import { TransactionController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { showToast } from 'components/toaster/toaster';

const companyInfo = {
  name: 'Taurean Inventory Saas',
  address: '123 Business District, Downtown Financial Center, Accra',
  phone: '+233 (0) 302 123 456',
  email: 'billing@taureanlogistics.com',
  website: 'www.taurean-inventory-saas.com'
};

const TransactionsTable = ({
  transactions
}: {
  transactions: Transaction[];
}) => {
  const printTable = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Transactions Report</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #000;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
              }
              .company-info {
                margin-bottom: 20px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left; 
              }
              th { 
                background-color: #007bff; 
                color: white; 
                font-weight: bold;
              }
              tr:nth-child(even) { 
                background-color: #f8f9fa; 
              }
              .amount { 
                font-weight: bold; 
                color: #28a745; 
              }
              .status-reconciled { 
                color: #28a745; 
                font-weight: bold; 
              }
              .status-pending { 
                color: #ffc107; 
                font-weight: bold; 
              }
              @media print { 
                body { margin: 0; } 
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${companyInfo.name}</h1>
              <div class="company-info">
                <p>${companyInfo.address}</p>
                <p>Phone: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
                <p>Website: ${companyInfo.website}</p>
              </div>
              <h2>Transactions Report</h2>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${transactions
                  .map(
                    txn => `
                  <tr>
                    <td>${txn.ref}</td>
                    <td>${new Date(txn.createdAt).toLocaleDateString()}</td>
                    <td>${txn.type}</td>
                    <td>${txn.method}</td>
                    <td class="amount">${currencyFormat(txn.amount)}</td>
                    <td class="${
                      txn.reconciled ? 'status-reconciled' : 'status-pending'
                    }">
                      ${txn.reconciled ? 'Reconciled' : 'Pending'}
                    </td>
                    <td>${txn.description || '-'}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
              <p><strong>Total Transactions:</strong> ${transactions.length}</p>
              <p><strong>Total Amount:</strong> ${currencyFormat(
                transactions.reduce((sum, txn) => sum + txn.amount, 0)
              )}</p>
            </div>
            
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      'Reference,Date,User ,Email,Type,Method,Amount,Status,Description',
      ...transactions.map(
        txn =>
          `${txn.ref},${new Date(txn.createdAt).toLocaleDateString()},"${
            txn.user.name
          }",${txn.user.email},${txn.type},${txn.method},${txn.amount},${
            txn.reconciled ? 'Reconciled' : 'Pending'
          },"${txn.description || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (reconciled: boolean) => {
    return reconciled ? (
      <Badge bg="success">Reconciled</Badge>
    ) : (
      <Badge bg="warning">Pending</Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      card: { bg: 'primary', text: 'Card' },
      mobile_money: { bg: 'info', text: 'Mobile Money' },
      bank: { bg: 'secondary', text: 'Bank Transfer' },
      cash: { bg: 'success', text: 'Cash' }
    };

    const config = methodConfig[method as keyof typeof methodConfig] || {
      bg: 'secondary',
      text: method
    };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  return (
    <Card className="border-secondary">
      <Card.Header className="border-secondary d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
          All Transactions
        </h5>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={printTable}>
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            Print Report
          </Button>
          <Button variant="outline-success" size="sm" onClick={exportToCSV}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Export CSV
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="px-2">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transactions) && transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <div className="fw-semibold">{txn.ref}</div>
                        <small className="text-muted">{txn.description}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{txn.type}</Badge>
                    </td>
                    <td>
                      <span className="fw-bold">
                        {currencyFormat(txn.amount)}
                      </span>
                    </td>
                    <td>{getMethodBadge(txn.method)}</td>
                    <td>{getStatusBadge(txn.reconciled)}</td>
                    <td>
                      <span className="text-muted">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/invoices/${txn.paymentDetails.paystackReference}`}
                      >
                        <Button
                          variant="outline-primary"
                          size="sm"
                          title="View Invoice"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    No transactions available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

// Individual Invoice Template
const InvoiceTemplate = ({ transaction }: { transaction: Transaction }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const printInvoice = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${transaction.ref}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: white;
                color: #2c3e50;
                line-height: 1.6;
              }
              .invoice-container { 
                max-width: 800px; 
                margin: 0 auto; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                padding: 40px;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                border-bottom: 3px solid #3498db;
                padding-bottom: 20px;
              }
              .company-info {
                flex: 1;
              }
              .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
              }
              .company-details {
                color: #7f8c8d;
                font-size: 14px;
              }
              .invoice-title {
                text-align: right;
                flex: 1;
              }
              .invoice-number {
                font-size: 36px;
                font-weight: bold;
                color: #e74c3c;
                margin-bottom: 10px;
              }
              .invoice-details {
                color: #7f8c8d;
                font-size: 14px;
              }
              .bill-to {
                background: #ecf0f1;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
              }
              .bill-to h4 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 18px;
              }
              .transaction-details {
                background: #fff;
                border: 2px solid #3498db;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
              }
              .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
              }
              .detail-item {
                margin-bottom: 15px;
              }
              .detail-label {
                font-weight: bold;
                color: #34495e;
                display: block;
                margin-bottom: 5px;
              }
              .detail-value {
                color: #2c3e50;
                font-size: 16px;
              }
              .amount-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 30px;
              }
              .amount-label {
                font-size: 18px;
                margin-bottom: 10px;
                opacity: 0.9;
              }
              .amount-value {
                font-size: 48px;
                font-weight: bold;
              }
              .status-section {
                background: #2ecc71;
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 30px;
              }
              .footer {
                text-align: center;
                border-top: 2px solid #ecf0f1;
                padding-top: 30px;
                color: #7f8c8d;
              }
              .footer h4 {
                color: #2c3e50;
                margin-bottom: 15px;
              }
              @media print { 
                body { margin: 0; padding: 10px; } 
                .no-print { display: none !important; }
                .invoice-container { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${invoiceRef.current?.innerHTML || ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    // Simple export - in real app, you'd use html2canvas and jsPDF
    setTimeout(() => {
      printInvoice();
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <Button
          variant="outline-primary"
          onClick={printInvoice}
          disabled={isExporting}
        >
          <FontAwesomeIcon icon={faPrint} className="me-2" />
          Print Invoice
        </Button>
        <Button
          variant="outline-success"
          onClick={exportToPDF}
          disabled={isExporting}
        >
          {isExporting ? (
            <Spinner size="sm" className="me-2" />
          ) : (
            <FontAwesomeIcon icon={faDownload} className="me-2" />
          )}
          Export PDF
        </Button>
      </div>

      {/* Invoice Content */}
      <Card className="border-0 shadow">
        <Card.Body className="p-5" ref={invoiceRef}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-5 pb-4 border-bottom border-primary border-3">
            <div>
              <h1 className="h2 fw-bold mb-3">{companyInfo.name}</h1>
              <div className="text-muted">
                <div>{companyInfo.address}</div>
                <div>{companyInfo.phone}</div>
                <div>{companyInfo.email}</div>
                <div>{companyInfo.website}</div>
              </div>
            </div>
            <div className="text-end">
              <h1 className="display-4 fw-bold text-danger mb-2">INVOICE</h1>
              <div className="h4 fw-bold text-dark mb-2">{transaction.ref}</div>
              <div className="text-muted">
                <div>
                  <strong>Issue Date:</strong>{' '}
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <strong>Due Date:</strong>{' '}
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="p-4 rounded mb-4">
            <h4 className="mb-3">Bill To:</h4>
            <div className="h5 fw-bold mb-2">{transaction.user.name}</div>
            <div className="mb-1">{transaction.user.email}</div>
            <div>{transaction.user.phone}</div>
          </div>

          {/* Transaction Details */}
          <div className="border border-primary rounded p-4 mb-4">
            <h4 className="text-primary mb-3">
              <FontAwesomeIcon
                icon={faFileInvoice}
                size="sm"
                className="me-2"
              />
              Transaction Details
            </h4>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <strong className="d-block">Transaction Type:</strong>
                  <span className="text-capitalize">
                    {transaction.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="mb-3">
                  <strong className="d-block">Payment Method:</strong>
                  <span className="text-capitalize">{transaction.method}</span>
                </div>
                <div className="mb-3">
                  <strong className="d-block">Category:</strong>
                  <span className="text-capitalize">
                    {transaction.category.replace('_', ' ')}
                  </span>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <strong className="d-block">Transaction Date:</strong>
                  <span>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-3">
                  <strong className="d-block">Reference:</strong>
                  <span className="font-monospace">{transaction.ref}</span>
                </div>
                {transaction.paymentDetails?.paystackReference && (
                  <div className="mb-3">
                    <strong className="d-block">Paystack Reference:</strong>
                    <span className="font-monospace">
                      {transaction.paymentDetails.paystackReference}
                    </span>
                  </div>
                )}
              </Col>
            </Row>
            {transaction.description && (
              <div className="border-top pt-3 mt-3">
                <strong className="d-block mb-2">Description:</strong>
                <p className="mb-0">{transaction.description}</p>
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div className="bg-primary p-4 rounded text-center mb-4">
            <div className="h5 mb-2 opacity-75">Total Amount</div>
            <div className="display-3 text-white fw-bold">
              {currencyFormat(transaction.amount)}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-success text-white p-3 rounded text-center mb-4">
            <FontAwesomeIcon icon={faCheckCircle} size="sm" className="me-2" />
            <strong>
              Payment {transaction.reconciled ? 'Completed' : 'Pending'}
            </strong>
          </div>

          {/* Footer */}
          <div className="text-center border-top pt-4">
            <h4 className="text-dark mb-3">Thank you for your business!</h4>
            <div className="text-muted">
              <div>
                For questions about this invoice, please contact us at{' '}
                {companyInfo.email}
              </div>
              <div>
                Visit us online at {companyInfo.website} | Call us at{' '}
                {companyInfo.phone}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const InvoicePage = () => {
  const { tokens } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );
  const accessToken = tokens.accessToken;
  const { reference } = useParams<{ reference: string }>();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [singleTransaction, setSingleTransaction] =
    useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setHasError(false);

      try {
        if (reference) {
          // Fetch single transaction
          showToast('info', 'Loading transaction details...');

          const data = await TransactionController.getTransaction(
            reference,
            accessToken
          );

          setSingleTransaction(
            (data.data as any).transaction as unknown as Transaction
          );
          showToast('success', 'Transaction loaded successfully!');
        } else {
          //fetch all transactions
          showToast('info', 'Loading all transaction details...');

          const data =
            await TransactionController.getAllTransactions(accessToken);

          console.log(data);

          setTransactions(data.data as Transaction[]);
          showToast(
            'success',
            `${
              (data.data as Transaction[]).length
            } transactions loaded successfully!`
          );
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        const errorMessage = error?.message || 'Failed to load data';
        setError(errorMessage);
        setHasError(true);

        showToast('error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
    } else {
      setError('Authentication required');
      setHasError(true);
      setIsLoading(false);
      showToast('error', 'Please login to view transactions');
    }
  }, [reference, accessToken]);

  // Retry function
  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Container>
          <div className="text-center">
            <Spinner
              animation="border"
              variant="primary"
              style={{ width: '4rem', height: '4rem' }}
              className="mb-4"
            />
            <h4 className="mb-3">
              {reference
                ? 'Loading Invoice Details...'
                : 'Loading Transactions...'}
            </h4>
            <p className="text-muted mb-4">
              {reference
                ? `Fetching details for transaction ${reference}`
                : 'Retrieving all transaction records'}
            </p>
            <div
              className="progress mx-auto"
              style={{ width: '300px', height: '6px' }}
            >
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (hasError || error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="border-danger shadow">
                <Card.Body className="text-center p-5">
                  <div className="text-danger mb-4">
                    <FontAwesomeIcon icon={faFileInvoice} size="4x" />
                  </div>
                  <h3 className="text-danger mb-3">Error Loading Data</h3>
                  <p className="text-muted mb-4">
                    {reference
                      ? `Unable to load transaction details for reference: ${reference}`
                      : 'Unable to load transaction list'}
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="primary" onClick={handleRetry}>
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Try Again
                    </Button>
                    <Link to="/" className="btn btn-outline-secondary">
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Back to Home
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // If no reference provided, show all transactions
  if (!reference) {
    return (
      <div className="min-vh-100">
        <Container fluid className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1">Invoices & Transactions</h1>
              <p className="text-muted mb-0">
                View and print all transaction records ({transactions.length}{' '}
                total)
              </p>
            </div>
            <Link to="/" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Home
            </Link>
          </div>

          {transactions.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FontAwesomeIcon
                  icon={faFileInvoice}
                  size="3x"
                  className="text-muted mb-3"
                />
                <h4 className="text-muted">No Transactions Found</h4>
                <p className="text-muted">
                  There are no transactions to display at this time.
                </p>
              </Card.Body>
            </Card>
          ) : (
            <TransactionsTable transactions={transactions} />
          )}
        </Container>
      </div>
    );
  }

  // Show single transaction
  if (!singleTransaction) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-5">
                  <FontAwesomeIcon
                    icon={faFileInvoice}
                    size="4x"
                    className="text-muted mb-4"
                  />
                  <h3 className="mb-3">Transaction Not Found</h3>
                  <p className="text-muted mb-4">
                    The requested transaction with reference{' '}
                    <strong>{reference}</strong> could not be found.
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Link to="/invoices" className="btn btn-primary">
                      <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                      View All Transactions
                    </Link>
                    <Link to="/" className="btn btn-outline-secondary">
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Back to Home
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Invoice {singleTransaction.ref}</h1>
            <p className="text-muted mb-0">
              Issued on{' '}
              {new Date(singleTransaction.createdAt).toLocaleDateString()} •
              Status:{' '}
              <Badge bg={singleTransaction.reconciled ? 'success' : 'warning'}>
                {singleTransaction.reconciled ? 'Paid' : 'Pending'}
              </Badge>
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/invoices" className="btn btn-outline-info">
              <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
              All Invoices
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Dashboard
            </Link>
          </div>
        </div>

        <InvoiceTemplate transaction={singleTransaction} />
      </Container>
    </div>
  );
};

export default InvoicePage;
