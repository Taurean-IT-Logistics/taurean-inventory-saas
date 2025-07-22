import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { Card, Button, Badge, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCheck,
  faPrint,
  faDownload,
  faExclamationTriangle,
  faFileExcel,
  faFileCsv,
  faSpinner,
  faFileInvoice,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { Transaction } from 'types';
import { currencyFormat } from 'helpers/utils';
import SimplePaginatedList from 'booking/PaginatedComponent';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import CompanyInfo from 'data';
import Logo from 'components/common/Logo';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onReconcile: (transactionId: string) => void;
}

interface InvoiceTemplateRef {
  print: () => void;
  exportToPDF: (isDownload: boolean) => void;
  getDomElement: () => HTMLDivElement | null;
}

interface InvoiceTemplateProps {
  transaction: Transaction;
}

const InvoiceTemplate = forwardRef<InvoiceTemplateRef, InvoiceTemplateProps>(
  ({ transaction }, ref) => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const printInvoice = async (isDownload = false) => {
      if (!invoiceRef.current) return;

      if (isDownload) {
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
        const linkElements = document.querySelectorAll(
          'link[rel="stylesheet"]'
        );
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

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          onclone: clonedDoc => {
            const noPrintElements = clonedDoc.querySelectorAll('.no-print');
            noPrintElements.forEach(el => {
              (el as HTMLElement).style.display = 'none';
            });
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95); // ✅ switch to JPEG
        console.log('Image Data:', imgData.slice(0, 50)); // Debug

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight); // ✅ use JPEG
        pdf.save(`Invoice_${transaction.ref}.pdf`);
      } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
      }
    };

    const exportPDF = async () => {
      try {
        await generatePDFFromCanvas();
      } catch (error) {
        console.error('Error exporting PDF:', error);
        await printInvoice(false); // Fallback to print dialog
      }
    };

    useImperativeHandle(ref, () => ({
      print: printInvoice,
      exportToPDF: exportPDF,
      getDomElement: () => invoiceRef.current
    }));

    return (
      <Card className="border-0 shadow" style={{ display: 'none' }}>
        <Card.Body className="p-4" ref={invoiceRef}>
          {/* Header - Compact */}
          <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom border-primary border-3">
            <div style={{ flex: 1 }}>
              <Logo className="mb-3" />
              <h1 className="h4 fw-bold mb-2">{CompanyInfo.name}</h1>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                <div>{CompanyInfo.address}</div>
                <div>
                  {CompanyInfo.phone} | {CompanyInfo.email}
                </div>
              </div>
            </div>
            <div className="text-end" style={{ flex: 1 }}>
              <h1 className="h2 fw-bold text-danger mb-1">INVOICE</h1>
              <div className="h5 fw-bold text-dark mb-1">{transaction.ref}</div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>
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
                <div className="fw-bold mb-1">{transaction.user.name}</div>
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                  <div>{transaction.user.email}</div>
                  <div>{transaction.user.phone}</div>
                </div>
              </div>

              {/* Transaction Details - Compact */}
              <div className="border border-primary rounded p-3 mb-4">
                <h5 className="text-primary mb-3">
                  <FontAwesomeIcon
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
                    {transaction.category?.replace('_', ' ') || 'N/A'}
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
                <FontAwesomeIcon
                  icon={faCheckCircle}
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
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
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
            <h5 className="text-dark mb-2">Thank you for your business!</h5>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
              <div>
                Questions? Contact us at {CompanyInfo.email} |{' '}
                {CompanyInfo.phone}
              </div>
              <div>Visit us online at {CompanyInfo.website}</div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';

const TransactionTable = ({
  transactions,
  onView,
  onReconcile
}: TransactionTableProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<InvoiceTemplateRef>(null);
  const [isExporting, setIsExporting] = useState(false);

  const getStatusBadge = (reconciled: boolean) =>
    reconciled ? (
      <Badge bg="success">Reconciled</Badge>
    ) : (
      <Badge bg="warning">Pending</Badge>
    );

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

  const printReport = () => {
    if (!reportRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Get Bootstrap CSS and other linked stylesheets
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

      // Print-specific styles
      const printStyles = `
        <style>
          * {
            box-sizing: border-box;
          }
          
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 15px; 
            background: white;
            color: #212529;
            line-height: 1.4;
            font-size: 14px;
          }
          
          .report-container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0;
          }
          
          .no-print { 
            display: none !important; 
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
          }
          
          .table th,
          .table td {
            padding: 0.5rem;
            vertical-align: top;
            border-top: 1px solid #dee2e6;
            border-bottom: 1px solid #dee2e6;
          }
          
          .table thead th {
            background-color: #f8f9fa;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
          }
          
          .table-striped tbody tr:nth-of-type(odd) {
            background-color: rgba(0, 0, 0, 0.05);
          }
          
          .badge {
            display: inline-block;
            padding: 0.35em 0.65em;
            font-size: 0.75em;
            font-weight: 700;
            line-height: 1;
            color: #fff;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 0.25rem;
          }

          .d-flex {display: flex}
          .items-center {align-items: center}
          .justify-content-between {justify-content: space-between}
          
          .badge.bg-success { background-color: #198754 !important; }
          .badge.bg-warning { background-color: #ffc107 !important; color: #000 !important; }
          .badge.bg-primary { background-color: #0d6efd !important; }
          .badge.bg-info { background-color: #0dcaf0 !important; color: #000 !important; }
          .badge.bg-secondary { background-color: #6c757d !important; }
          
          .fw-bold { font-weight: 700 !important; }
          .text-muted { color: #6c757d !important; }
          .text-center { text-align: center !important; }
          .text-end { text-align: right !important; }
          
          .h3 { font-size: 1.75rem; }
          .h5 { font-size: 1.25rem; }
          
          .mb-1 { margin-bottom: 0.25rem !important; }
          .mb-2 { margin-bottom: 0.5rem !important; }
          .mb-3 { margin-bottom: 1rem !important; }
          .mb-4 { margin-bottom: 1.5rem !important; }
          .mt-4 { margin-top: 1.5rem !important; }
          .pt-3 { padding-top: 1rem !important; }
          .pb-3 { padding-bottom: 1rem !important; }
          
          .border-top { border-top: 1px solid #dee2e6 !important; }
          
          .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
          
          .stat-card {
            padding: 1rem;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 10px; 
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .report-container { 
              box-shadow: none; 
            }
            
            /* Prevent page breaks within summary stats */
            .summary-stats {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Prevent page breaks within individual stat cards */
            .stat-card {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Keep table header with table body */
            .table { 
              page-break-inside: avoid; 
            }
            
            /* Keep table header with first few rows */
            .table thead {
              page-break-after: avoid;
            }
            
            /* Prevent orphaned table rows */
            .table tbody tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Keep summary stats and table together on same page */
            .summary-stats,
            .table {
              page-break-before: avoid;
            }
            
            /* Ensure the whole report content stays together when possible */
            .report-container > * {
              page-break-before: avoid;
            }
          }
        </style>
      `;

      printWindow.document.write(`
        <html>
          <head>
            <title>Transaction Report - ${new Date().toLocaleDateString()}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${linkTags}
            ${inlineStyles}
            ${printStyles}
          </head>
          <body>
            <div class="report-container">
              ${reportRef.current?.innerHTML || ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const printReportDialog = () => {
    if (!reportRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      let linkTags = '';
      linkElements.forEach(link => {
        linkTags += link.outerHTML + '\n';
      });

      const styleElements = document.querySelectorAll('style');
      let inlineStyles = '';
      styleElements.forEach(style => {
        inlineStyles += style.outerHTML + '\n';
      });

      const printStyles = `
        <style>
          * {
            box-sizing: border-box;
          }
          
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 15px; 
            background: white;
            color: #212529;
            line-height: 1.4;
            font-size: 14px;
          }
          
          .report-container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0;
          }
          
          .no-print { 
            display: none !important; 
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
          }
          
          .table th,
          .table td {
            padding: 0.5rem;
            vertical-align: top;
            border-top: 1px solid #dee2e6;
            border-bottom: 1px solid #dee2e6;
          }
          
          .table thead th {
            background-color: #f8f9fa;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
          }
          
          .table-striped tbody tr:nth-of-type(odd) {
            background-color: rgba(0, 0, 0, 0.05);
          }
          
          .badge {
            display: inline-block;
            padding: 0.35em 0.65em;
            font-size: 0.75em;
            font-weight: 700;
            line-height: 1;
            color: #fff;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 0.25rem;
          }

          .d-flex {display: flex}
          .items-center {align-items: center}
          .justify-content-between {justify-content: space-between}
          
          .badge.bg-success { background-color: #198754 !important; }
          .badge.bg-warning { background-color: #ffc107 !important; color: #000 !important; }
          .badge.bg-primary { background-color: #0d6efd !important; }
          .badge.bg-info { background-color: #0dcaf0 !important; color: #000 !important; }
          .badge.bg-secondary { background-color: #6c757d !important; }
          
          .fw-bold { font-weight: 700 !important; }
          .text-muted { color: #6c757d !important; }
          .text-center { text-align: center !important; }
          .text-end { text-align: right !important; }
          
          .h3 { font-size: 1.75rem; }
          .h5 { font-size: 1.25rem; }
          
          .mb-1 { margin-bottom: 0.25rem !important; }
          .mb-2 { margin-bottom: 0.5rem !important; }
          .mb-3 { margin-bottom: 1rem !important; }
          .mb-4 { margin-bottom: 1.5rem !important; }
          .mt-4 { margin-top: 1.5rem !important; }
          .pt-3 { padding-top: 1rem !important; }
          .pb-3 { padding-bottom: 1rem !important; }
          
          .border-top { border-top: 1px solid #dee2e6 !important; }
          
          .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
          
          .stat-card {
            padding: 1rem;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 10px; 
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .report-container { 
              box-shadow: none; 
            }
            
            /* Prevent page breaks within summary stats */
            .summary-stats {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Prevent page breaks within individual stat cards */
            .stat-card {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Keep table header with table body */
            .table { 
              page-break-inside: avoid; 
            }
            
            /* Keep table header with first few rows */
            .table thead {
              page-break-after: avoid;
            }
            
            /* Prevent orphaned table rows */
            .table tbody tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Keep summary stats and table together on same page */
            .summary-stats,
            .table {
              page-break-before: avoid;
            }
            
            /* Ensure the whole report content stays together when possible */
            .report-container > * {
              page-break-before: avoid;
            }
          }
        </style>
      `;

      printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Report - ${new Date().toLocaleDateString()}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          ${linkTags}
          ${inlineStyles}
          ${printStyles}
        </head>
        <body>
          <div class="report-container">
            ${reportRef.current?.innerHTML || ''}
          </div>
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePDFReportFromCanvas = async () => {
    const element = reportRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: clonedDoc => {
        clonedDoc.querySelectorAll('.no-print').forEach(el => {
          if ((el as HTMLElement).style) {
            (el as HTMLElement).style.display = 'none';
          }
        });
      }
    });

    const imgWidth = 210; // A4
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const imgData = canvas.toDataURL('image/jpeg', 0.7);
    const pdf = new jsPDF('portrait', 'mm', 'a4');

    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Transaction_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      await generatePDFReportFromCanvas();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      printReportDialog();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintInvoice = () => {
    if (invoiceRef.current) {
      invoiceRef.current.exportToPDF(true);
    }
  };

  const exportToExcel = () => {
    if (!transactions || transactions.length === 0) return;

    const exportData = transactions.map(txn => ({
      Reference: txn.ref,
      Description: txn.description || '',
      'User Name': txn.user.name,
      'User Email': txn.user.email,
      Type: txn.type,
      Amount: txn.amount,
      'Amount (Formatted)': currencyFormat(txn.amount),
      Method: txn.method,
      Status: txn.reconciled ? 'Reconciled' : 'Pending',
      'Created Date': new Date(txn.createdAt).toLocaleDateString(),
      'Paystack Reference': txn.paymentDetails?.paystackReference || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const excelData = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    saveAs(
      new Blob([excelData], { type: 'application/octet-stream' }),
      `transactions-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) return;

    const exportData = transactions.map(txn => ({
      Reference: txn.ref,
      Description: txn.description || '',
      'User Name': txn.user.name,
      'User Email': txn.user.email,
      Type: txn.type,
      Amount: txn.amount,
      'Amount (Formatted)': currencyFormat(txn.amount),
      Method: txn.method,
      Status: txn.reconciled ? 'Reconciled' : 'Pending',
      'Created Date': new Date(txn.createdAt).toLocaleDateString(),
      'Paystack Reference': txn.paymentDetails?.paystackReference || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const csvData = XLSX.write(workbook, {
      bookType: 'csv',
      type: 'array'
    });

    saveAs(
      new Blob([csvData], { type: 'text/csv' }),
      `transactions-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  // Calculate summary statistics
  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const reconciledAmount = transactions
    .filter(txn => txn.reconciled)
    .reduce((sum, txn) => sum + txn.amount, 0);
  const pendingAmount = totalAmount - reconciledAmount;
  const reconciledCount = transactions.filter(txn => txn.reconciled).length;
  const pendingCount = transactions.length - reconciledCount;

  return (
    <div>
      <Card className="border-secondary">
        <Card.Header className="border-secondary d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Transactions</h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={printReport}
              disabled={isExporting}
            >
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Print Report
            </Button>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-success"
                size="sm"
                disabled={isExporting}
              >
                {isExporting ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                ) : (
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                )}
                Export
              </Dropdown.Toggle>
              <Dropdown.Menu className="border-secondary">
                <Dropdown.Item onClick={exportToPDF}>
                  <FontAwesomeIcon icon={faPrint} className="me-2" />
                  Export as PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={exportToExcel}>
                  <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                  Export as Excel
                </Dropdown.Item>
                <Dropdown.Item onClick={exportToCSV}>
                  <FontAwesomeIcon icon={faFileCsv} className="me-2" />
                  Export as CSV
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Header>
        <Card.Body className="px-2">
          <SimplePaginatedList
            data={transactions}
            itemsPerPage={5}
            emptyMessage="No transactions found"
            className="pb-3"
            tableHeaders={
              <tr>
                <th>Reference</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            }
            renderRow={(txn, index) => (
              <>
                <tr key={index}>
                  <td>
                    <div>
                      <div className="fw-semibold">{txn.ref}</div>
                      <small className="text-muted">{txn.description}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{txn.user.name}</div>
                      <small className="text-muted">{txn.user.email}</small>
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
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onView(txn)}
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      {!txn.reconciled && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => onReconcile(txn.ref || '')}
                          title="Reconcile"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </Button>
                      )}
                      {txn.reconciled && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onReconcile(txn.ref || '')}
                          title="Unreconcile"
                        >
                          <FontAwesomeIcon icon={faExclamationTriangle} />
                        </Button>
                      )}
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handlePrintInvoice}
                      >
                        <FontAwesomeIcon icon={faPrint} />
                      </Button>
                    </div>
                  </td>
                </tr>
                <InvoiceTemplate ref={invoiceRef} transaction={txn} />
              </>
            )}
          />
        </Card.Body>
      </Card>

      {/* Hidden Report Template for Printing */}
      <div style={{ display: 'none' }}>
        <div ref={reportRef}>
          <div className="text-center mb-4 d-flex items-center justify-content-between">
            <Logo />
            <h3 className="fw-bold">Transaction Report</h3>
            <p className="text-muted">
              Generated on {new Date().toLocaleDateString()} at{' '}
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Summary Statistics */}
          <div className="summary-stats">
            <div className="stat-card">
              <h5 className="text-center mb-2">Total Transactions</h5>
              <div className="text-center fw-bold h3">
                {transactions.length}
              </div>
            </div>
            <div className="stat-card">
              <h5 className="text-center mb-2">Total Amount</h5>
              <div className="text-center fw-bold h3">
                {currencyFormat(totalAmount)}
              </div>
            </div>
            <div className="stat-card">
              <h5 className="text-center mb-2">Reconciled</h5>
              <div className="text-center fw-bold h3">{reconciledCount}</div>
              <div className="text-center text-muted">
                {currencyFormat(reconciledAmount)}
              </div>
            </div>
            <div className="stat-card">
              <h5 className="text-center mb-2">Pending</h5>
              <div className="text-center fw-bold h3">{pendingCount}</div>
              <div className="text-center text-muted">
                {currencyFormat(pendingAmount)}
              </div>
            </div>
          </div>

          {/* Detailed Transaction Table */}
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Reference</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index}>
                  <td>
                    <div className="fw-bold">{txn.ref}</div>
                    {txn.description && (
                      <small className="text-muted">{txn.description}</small>
                    )}
                  </td>
                  <td>
                    <div>{txn.user.name}</div>
                    <small className="text-muted">{txn.user.email}</small>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{txn.type}</span>
                  </td>
                  <td className="fw-bold">{currencyFormat(txn.amount)}</td>
                  <td>{txn.method}</td>
                  <td>
                    <span
                      className={`badge ${
                        txn.reconciled ? 'bg-success' : 'bg-warning'
                      }`}
                    >
                      {txn.reconciled ? 'Reconciled' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="border-top pt-3 mt-4 text-center">
            <p className="text-muted">
              Report generated from Transaction Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
