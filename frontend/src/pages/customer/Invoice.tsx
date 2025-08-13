import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {  } from '';
import {
  faPrint,
  faDownload,
  faArrowLeft,
  faFileInvoice,
  faEye,
  CheckCircle
} from 'lucide-react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Spinner
} from 'components/ui';
import { Transaction } from 'types';
import { currencyFormat } from 'helpers/utils';
import { TransactionController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { showToast } from 'components/toaster/toaster';
import CompanyInfo from 'data';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Logo from 'components/common/Logo';

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
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8f9fa;
              }
              
              .invoice-container {
                max-width: 800px;
                margin: 20px auto;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
              }
              
              .invoice-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                position: relative;
              }
              
              .invoice-header::before {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 100px;
                height: 100px;
                background: rgba(255,255,255,0.1);
                border-radius: 50%;
                transform: translate(30px, -30px);
              }
              
              .header-top {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
              }
              
              .logo-section h1 {
                font-size: 2.5em;
                font-weight: 300;
                letter-spacing: 2px;
                margin-bottom: 5px;
              }
              
              .logo-section .subtitle {
                font-size: 0.9em;
                opacity: 0.9;
                font-weight: 300;
              }
              
              .company-details {
                text-align: right;
                font-size: 0.9em;
                opacity: 0.9;
              }
              
              .company-details h3 {
                font-size: 1.1em;
                margin-bottom: 5px;
                opacity: 1;
              }
              
              .invoice-info {
                display: flex;
                justify-content: space-between;
                font-size: 0.9em;
              }
              
              .invoice-body {
                padding: 40px;
              }
              
              .report-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              
              .report-to h4 {
                color: #333;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
              }
              
              .report-meta {
                text-align: right;
              }
              
              .report-meta h4 {
                color: #333;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
              }
              
              .transactions-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                font-size: 0.9em;
              }
              
              .transactions-table th {
                background: #f8f9fa;
                padding: 15px 12px;
                text-align: left;
                font-weight: 600;
                color: #333;
                text-transform: uppercase;
                font-size: 0.8em;
                letter-spacing: 0.5px;
                border-bottom: 2px solid #e9ecef;
              }
              
              .transactions-table td {
                padding: 15px 12px;
                border-bottom: 1px solid #e9ecef;
                vertical-align: top;
              }
              
              .transactions-table tr:hover {
                background: #f8f9fa;
              }
              
              .amount {
                font-weight: 600;
                color: #28a745;
              }
              
              .status-reconciled {
                color: #28a745;
                font-weight: 600;
              }
              
              .status-pending {
                color: #ffc107;
                font-weight: 600;
              }
              
              .summary-section {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 8px;
                margin-top: 30px;
              }
              
              .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
              }
              
              .summary-row:last-child {
                border-bottom: none;
                font-weight: 600;
                font-size: 1.1em;
                color: #333;
              }
              
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                text-align: center;
                color: #666;
                font-size: 0.8em;
              }
              
              .footer-contact {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 10px;
              }
              
              .footer-contact i {
                margin-right: 5px;
                color: #007bff;
              }
              
              .report-details i {
                margin-right: 5px;
                color: #007bff;
              }
              
              .status-reconciled i {
                margin-right: 5px;
              }
              
              .status-pending i {
                margin-right: 5px;
              }
              
              @media print {
                body { 
                  background: white;
                  margin: 0;
                }
                .invoice-container {
                  box-shadow: none;
                  margin: 0;
                  max-width: none;
                }
                .transactions-table tr:hover {
                  background: transparent;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="invoice-header">
                <div class="header-top">
                  <div class="logo-section">
                    <h1>TRANSACTIONS</h1>
                    <div class="subtitle">Financial Report</div>
                  </div>
                  <div class="company-details">
                    <h3>${CompanyInfo.name}</h3>
                    <div>${CompanyInfo.address}</div>
                  </div>
                </div>
                <div class="invoice-info">
                  <div>
                    <strong>REPORT DATE:</strong> ${new Date().toLocaleDateString()}
                  </div>
                  <div>
                    <strong>TOTAL RECORDS:</strong> ${transactions.length}
                  </div>
                </div>
              </div>
              
              <div class="invoice-body">
                <div class="report-details">
                  <div class="report-to">
                    <h4>Report Generated For</h4>
                    <div><strong>${CompanyInfo.name}</strong></div>
                    <div>Financial Department</div>
                    <div><i class="fas fa-phone"></i> ${CompanyInfo.phone}</div>
                    <div><i class="fas fa-envelope"></i> ${
                      CompanyInfo.email
                    }</div>
                  </div>
                  <div class="report-meta">
                    <h4>Report Information</h4>
                    <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                    <div><strong>Period:</strong> All Time</div>
                    <div><strong>Status:</strong> Complete</div>
                  </div>
                </div>
                
                <table class="transactions-table">
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
                        <td><strong>${txn.ref}</strong></td>
                        <td>${new Date(txn.createdAt).toLocaleDateString()}</td>
                        <td>${txn.type}</td>
                        <td>${txn.method}</td>
                        <td class="amount">${currencyFormat(txn.amount)}</td>
                        <td class="${
                          txn.reconciled
                            ? 'status-reconciled'
                            : 'status-pending'
                        }">
                          ${
                            txn.reconciled
                              ? '<i class="fas fa-check-circle"></i> Reconciled'
                              : '<i class="fas fa-clock"></i> Pending'
                          }
                        </td>
                        <td>${txn.description || '-'}</td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
                
                <div class="summary-section">
                  <div class="summary-row">
                    <span>Sub-Total:</span>
                    <span>${currencyFormat(
                      transactions.reduce((sum, txn) => sum + txn.amount, 0)
                    )}</span>
                  </div>
                  <div class="summary-row">
                    <span>Processing Fee (2%):</span>
                    <span>${currencyFormat(
                      transactions.reduce((sum, txn) => sum + txn.amount, 0) *
                        0.02
                    )}</span>
                  </div>
                  <div class="summary-row">
                    <span>Total Amount:</span>
                    <span>${currencyFormat(
                      transactions.reduce((sum, txn) => sum + txn.amount, 0) *
                        1.02
                    )}</span>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <div><strong><i class="fas fa-file-contract"></i> Terms & Conditions</strong></div>
                <p>This report contains confidential financial information. Handle with care according to company data protection policies.</p>
                <div class="footer-contact">
                  <span><i class="fas fa-phone"></i> <strong>Phone:</strong> ${
                    CompanyInfo.phone
                  }</span>
                  <span><i class="fas fa-envelope"></i> <strong>Email:</strong> ${
                    CompanyInfo.email
                  }</span>
                  <span><i class="fas fa-globe"></i> <strong>Website:</strong> ${
                    CompanyInfo.website
                  }</span>
                </div>
              </div>
            </div>
            
            <script>
              window.addEventListener('load', function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              });
            </script>
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
          < icon={faFileInvoice} className="me-2" />
          All Transactions
        </h5>
        <div className="flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={printTable}>
            < icon={faPrint} className="me-2" />
            Print Report
          </Button>
          <Button variant="outline-success" size="sm" onClick={exportToCSV}>
            < icon={faDownload} className="me-2" />
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
                        <div className="font-semibold">{txn.ref}</div>
                        <small className="text-gray-600 dark:text-gray-400">{txn.description}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{txn.type}</Badge>
                    </td>
                    <td>
                      <span className="font-bold">
                        {currencyFormat(txn.amount)}
                      </span>
                    </td>
                    <td>{getMethodBadge(txn.method)}</td>
                    <td>{getStatusBadge(txn.reconciled)}</td>
                    <td>
                      <span className="text-gray-600 dark:text-gray-400">
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
                          < icon={faEye} />
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

  const printInvoice = async (isDownload = false) => {
    if (!invoiceRef.current) return;

    if (isDownload) {
      // Direct PDF download using html2canvas + jsPDF
      try {
        await generatePDFFromCanvas();
      } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback to print dialog
        printInvoiceDialog();
      }
    } else {
      printInvoiceDialog();
    }
  };

  const printInvoiceDialog = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      let linkTags = '';

      linkElements.forEach(link => {
        linkTags += link.outerHTML + '\n';
      });

      // Get inline styles
      const styleElements = document.querySelectorAll('style');
      let inlineStyles = '';

      styleElements.forEach(style => {
        inlineStyles += style.outerHTML + '\n';
      });

      // Comprehensive print styles
      const printStyles = `
        <style>
          * {
            box-sizing: border-box;
          }
          
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0; 
            padding: 15px; 
            background: white;
            color: #212529;
            line-height: 1.4;
            font-size: 14px;
          }
          
          .invoice-container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 0;
            page-break-inside: avoid;
          }
          
          .no-print { 
            display: none !important; 
          }
          
          .card {
            border: 1px solid #dee2e6 !important;
            border-radius: 0.375rem;
            box-shadow: none !important;
          }
          
          .card-body {
            padding: 1.5rem !important;
          }
          
          .border-primary {
            border-color: #0d6efd !important;
          }
          
          .bg-primary {
            background-color: #0d6efd !important;
            color: white !important;
          }
          
          .bg-success {
            background-color: #198754 !important;
            color: white !important;
          }
          
          .text-primary {
            color: #0d6efd !important;
          }
          
          .text-danger {
            color: #dc3545 !important;
          }
          
          .text-muted {
            color: #6c757d !important;
          }
          
          .fw-bold {
            font-weight: 700 !important;
          }
          
          .d-flex {
            display: flex !important;
          }
          
          .justify-content-between {
            justify-content: space-between !important;
          }
          
          .align-items-start {
            align-items: flex-start !important;
          }
          
          .text-end {
            text-align: right !important;
          }
          
          .text-center {
            text-align: center !important;
          }
          
          .text-capitalize {
            text-transform: capitalize !important;
          }
          
          .rounded {
            border-radius: 0.375rem !important;
          }
          
          .border-top {
            border-top: 1px solid #dee2e6 !important;
          }
          
          .border-bottom {
            border-bottom: 1px solid #dee2e6 !important;
          }
          
          .border-3 {
            border-width: 3px !important;
          }
          
          .mb-1 { margin-bottom: 0.25rem !important; }
          .mb-2 { margin-bottom: 0.5rem !important; }
          .mb-3 { margin-bottom: 1rem !important; }
          .mb-4 { margin-bottom: 1.5rem !important; }
          .mb-5 { margin-bottom: 3rem !important; }
          .mt-3 { margin-top: 1rem !important; }
          .pt-3 { padding-top: 1rem !important; }
          .pt-4 { padding-top: 1.5rem !important; }
          .pb-4 { padding-bottom: 1.5rem !important; }
          .p-3 { padding: 1rem !important; }
          .p-4 { padding: 1.5rem !important; }
          
          .h2 { font-size: 2rem; }
          .h4 { font-size: 1.5rem; }
          .h5 { font-size: 1.25rem; }
          .display-3 { font-size: 4.5rem; }
          .display-4 { font-size: 3.5rem; }
          
          .row {
            display: flex;
            flex-wrap: wrap;
            margin-right: -0.75rem;
            margin-left: -0.75rem;
          }
          
          .col-md-6 {
            flex: 0 0 auto;
            width: 50%;
            padding-right: 0.75rem;
            padding-left: 0.75rem;
          }
          
          .d-block {
            display: block !important;
          }
          
          .font-monospace {
            font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          }
          
          .opacity-75 {
            opacity: 0.75 !important;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 10px; 
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .invoice-container { 
              box-shadow: none; 
              page-break-inside: avoid;
            }
          }
        </style>
      `;

      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${transaction.ref}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${linkTags}
            ${inlineStyles}
            ${printStyles}
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

  const generatePDFFromCanvas = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,

      onclone: clonedDoc => {
        // Hide any no-print elements in the cloned document
        const noPrintElements = clonedDoc.querySelectorAll('.no-print');
        noPrintElements.forEach(el => {
          if ((el as HTMLElement).style) {
            (el as HTMLElement).style.display = 'none';
          }
        });
      }
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const imgData = canvas.toDataURL('image/jpeg', 0.7);

    // Create PDF using jsPDF
    const pdf = new jsPDF('portrait', 'mm', 'a4');

    let position = 0;

    // Add image to PDF (handle multiple pages if needed)
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    pdf.save(`Invoice_${transaction.ref}.pdf`);
  };

  const exportToPDF = async (isDownload = false) => {
    setIsExporting(true);

    try {
      await printInvoice(isDownload);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      await printInvoice(false); // Fallback to print dialog
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex justify-content-end gap-2 mb-4 no-print">
        <Button
          variant="outline-primary"
          onClick={() => printInvoice()}
          disabled={isExporting}
        >
          < icon={faPrint} className="me-2" />
          Print Invoice
        </Button>
        <Button
          variant="outline-success"
          onClick={() => exportToPDF(true)}
          disabled={isExporting}
        >
          {isExporting ? (
            <Spinner size="sm" className="me-2" />
          ) : (
            < icon={faDownload} className="me-2" />
          )}
          Export PDF
        </Button>
      </div>

      {/* Invoice Content - Compact One-Pager */}
      <Card className="border-0 shadow">
        <Card.Body className="p-4" ref={invoiceRef}>
          {/* Header - Compact */}
          <div className="flex justify-content-between align-items-start mb-4 pb-3 border-bottom border-primary border-3">
            <div style={{ flex: 1 }}>
              <Logo className="mb-3" />
              <h1 className="h4 fw-bold mb-2">{CompanyInfo.name}</h1>
              <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.875rem' }}>
                <div>{CompanyInfo.address}</div>
                <div>
                  {CompanyInfo.phone} | {CompanyInfo.email}
                </div>
              </div>
            </div>
            <div className="text-end" style={{ flex: 1 }}>
              <h1 className="h2 fw-bold text-danger mb-1">INVOICE</h1>
              <div className="h5 fw-bold text-dark mb-1">{transaction.ref}</div>
              <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.875rem' }}>
                <div>
                  <strong>Date:</strong>{' '}
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="row mb-4">
            {/* Left Column - Bill To & Transaction Details */}
            <div className="col-md-6">
              {/* Bill To Section - Compact */}
              <div className="mb-4">
                <h5 className="text-primary mb-2">Bill To:</h5>
                <div className="font-bold mb-1">{transaction.user.name}</div>
                <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.875rem' }}>
                  <div>{transaction.user.email}</div>
                  <div>{transaction.user.phone}</div>
                </div>
              </div>

              {/* Transaction Details - Compact */}
              <div className="border border-primary rounded p-3 mb-4">
                <h5 className="text-primary mb-3">
                  <
                    icon={faFileInvoice}
                    size="sm"
                    className="me-2"
                  />
                  Transaction Details
                </h5>
                <div className="mb-2">
                  <strong className="d-block">Type:</strong>
                  <span className="text-capitalize">
                    {transaction.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="mb-2">
                  <strong className="d-block">Method:</strong>
                  <span className="text-capitalize">{transaction.method}</span>
                </div>
                <div className="mb-2">
                  <strong className="d-block">Category:</strong>
                  <span className="text-capitalize">
                    {transaction.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="mb-2">
                  <strong className="d-block">Reference:</strong>
                  <span className="font-monospace">{transaction.ref}</span>
                </div>
                {transaction.paymentDetails?.paystackReference && (
                  <div className="mb-2">
                    <strong className="d-block">Paystack Ref:</strong>
                    <span
                      className="font-monospace"
                      style={{ fontSize: '0.875rem' }}
                    >
                      {transaction.paymentDetails.paystackReference}
                    </span>
                  </div>
                )}
                {transaction.description && (
                  <div className="border-top pt-2 mt-2">
                    <strong className="d-block mb-1">Description:</strong>
                    <p className="mb-0" style={{ fontSize: '0.875rem' }}>
                      {transaction.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Amount & Status */}
            <div className="col-md-6">
              {/* Amount Section - Compact */}
              <div className="bg-primary p-4 rounded text-center mb-4">
                <div className="h5 mb-2 opacity-75">Total Amount</div>
                <div className="h2 text-white fw-bold">
                  {currencyFormat(transaction.amount)}
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-success text-white p-3 rounded text-center mb-4">
                <
                  icon={CheckCircle}
                  size="sm"
                  className="me-2"
                />
                <strong>
                  Payment {transaction.reconciled ? 'Completed' : 'Pending'}
                </strong>
              </div>

              {/* Additional Info */}
              <div className="border rounded p-3">
                <h6 className="mb-2">Payment Information</h6>
                <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.875rem' }}>
                  <div>
                    <strong>Transaction ID:</strong> {transaction.ref}
                  </div>
                  <div>
                    <strong>Status:</strong>{' '}
                    {transaction.reconciled ? 'Completed' : 'Pending'}
                  </div>
                  <div>
                    <strong>Processed:</strong>{' '}
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Compact */}
          <div className="text-center border-top pt-3">
            <h5 className="text-gray-900 dark:text-gray-100 mb-2">Thank you for your business!</h5>
            <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.875rem' }}>
              <div>
                Questions? Contact us at {CompanyInfo.email} |{' '}
                {CompanyInfo.phone}
              </div>
              <div>Visit us online at {CompanyInfo.website}</div>
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
  const accessToken = tokens?.accessToken;
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
            await TransactionController.getAllUserTransactions(accessToken);

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
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
          <Row className="justify-center">
            <Col md={6}>
              <Card className="border-danger shadow">
                <Card.Body className="text-center p-5">
                  <div className="text-danger mb-4">
                    < icon={faFileInvoice} size="4x" />
                  </div>
                  <h3 className="text-danger mb-3">Error Loading Data</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {reference
                      ? `Unable to load transaction details for reference: ${reference}`
                      : 'Unable to load transaction list'}
                  </p>
                  <div className="flex gap-2 justify-content-center">
                    <Button variant="primary" onClick={handleRetry}>
                      < icon={faArrowLeft} className="me-2" />
                      Try Again
                    </Button>
                    <Link to="/" className="btn btn-outline-secondary">
                      < icon={faArrowLeft} className="me-2" />
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
          <div className="flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1">Invoices & Transactions</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-0">
                View and print all transaction records ({transactions.length}{' '}
                total)
              </p>
            </div>
            <Link to="/" className="btn btn-outline-secondary">
              < icon={faArrowLeft} className="me-2" />
              Back to Home
            </Link>
          </div>

          {transactions.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <
                  icon={faFileInvoice}
                  size="3x"
                  className="text-gray-600 dark:text-gray-400 mb-3"
                />
                <h4 className="text-gray-600 dark:text-gray-400">No Transactions Found</h4>
                <p className="text-gray-600 dark:text-gray-400">
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
          <Row className="justify-center">
            <Col md={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-5">
                  <
                    icon={faFileInvoice}
                    size="4x"
                    className="text-gray-600 dark:text-gray-400 mb-4"
                  />
                  <h3 className="mb-3">Transaction Not Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested transaction with reference{' '}
                    <strong>{reference}</strong> could not be found.
                  </p>
                  <div className="flex gap-2 justify-content-center">
                    <Link to="/invoices" className="btn btn-primary">
                      < icon={faFileInvoice} className="me-2" />
                      View All Transactions
                    </Link>
                    <Link to="/" className="btn btn-outline-secondary">
                      < icon={faArrowLeft} className="me-2" />
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
        <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Invoice {singleTransaction.ref}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              Issued on{' '}
              {new Date(singleTransaction.createdAt).toLocaleDateString()} •
              Status:{' '}
              <Badge bg={singleTransaction.reconciled ? 'success' : 'warning'}>
                {singleTransaction.reconciled ? 'Paid' : 'Pending'}
              </Badge>
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/invoices" className="btn btn-outline-info">
              < icon={faFileInvoice} className="me-2" />
              All Invoices
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              < icon={faArrowLeft} className="me-2" />
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
