import puppeteer from 'puppeteer';
import { InvoiceModel } from '../models/invoice.model';
import { ReceiptModel } from '../models/receipt.model';

interface InvoicePDFData {
  invoice: any;
  company: any;
  customer?: any;
}

interface ReceiptPDFData {
  receipt: any;
  invoice: any;
  company: any;
  customer?: any;
}

const generateInvoiceHTML = (data: InvoicePDFData): string => {
  const { invoice, company, customer } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1f2937;
                line-height: 1.6;
                background: #ffffff;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 60px;
                padding-bottom: 30px;
                border-bottom: 3px solid #e5e7eb;
            }
            
            .company-section {
                flex: 1;
            }
            
            .company-logo {
                max-width: 200px;
                max-height: 80px;
                margin-bottom: 20px;
                border-radius: 8px;
            }
            
            .company-name {
                font-size: 28px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 8px;
            }
            
            .company-details {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .invoice-section {
                text-align: right;
                flex: 1;
            }
            
            .invoice-title {
                font-size: 42px;
                font-weight: 800;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 15px;
            }
            
            .invoice-number {
                font-size: 18px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .invoice-meta {
                color: #6b7280;
                font-size: 14px;
            }
            
            .billing-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 50px;
                gap: 40px;
            }
            
            .billing-card {
                flex: 1;
                padding: 25px;
                background: #f9fafb;
                border-radius: 12px;
                border-left: 4px solid #667eea;
            }
            
            .billing-title {
                font-size: 16px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .billing-content {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .billing-name {
                font-size: 16px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 8px;
            }
            
            .items-section {
                margin-bottom: 40px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .items-table thead {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .items-table th {
                padding: 18px 20px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .items-table td {
                padding: 20px;
                border-bottom: 1px solid #f3f4f6;
                font-size: 14px;
            }
            
            .items-table tr:last-child td {
                border-bottom: none;
            }
            
            .items-table tr:hover {
                background-color: #f9fafb;
            }
            
            .text-right {
                text-align: right;
            }
            
            .item-description {
                font-weight: 600;
                color: #111827;
                margin-bottom: 4px;
            }
            
            .item-sku {
                font-size: 12px;
                color: #6b7280;
                font-family: 'Monaco', 'Consolas', monospace;
            }
            
            .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 40px;
            }
            
            .totals-table {
                width: 350px;
                border-collapse: collapse;
            }
            
            .totals-table td {
                padding: 12px 20px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 15px;
            }
            
            .totals-table .total-label {
                font-weight: 600;
                color: #374151;
            }
            
            .totals-table .total-amount {
                text-align: right;
                font-weight: 600;
                color: #111827;
            }
            
            .grand-total {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                font-size: 18px !important;
                font-weight: 700 !important;
            }
            
            .grand-total td {
                border-bottom: none !important;
                color: white !important;
            }
            
            .payment-section {
                background: #f0f9ff;
                border: 2px solid #e0f2fe;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 40px;
            }
            
            .payment-title {
                font-size: 18px;
                font-weight: 700;
                color: #0c4a6e;
                margin-bottom: 15px;
            }
            
            .payment-status {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-paid {
                background: #dcfce7;
                color: #166534;
                border: 1px solid #bbf7d0;
            }
            
            .status-pending {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #fde68a;
            }
            
            .status-overdue {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #fecaca;
            }
            
            .payment-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-top: 20px;
            }
            
            .payment-detail {
                font-size: 14px;
            }
            
            .payment-label {
                font-weight: 600;
                color: #374151;
            }
            
            .payment-value {
                color: #6b7280;
            }
            
            .footer {
                text-align: center;
                padding-top: 30px;
                border-top: 2px solid #e5e7eb;
                color: #6b7280;
                font-size: 13px;
            }
            
            .footer-message {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 10px;
            }
            
            .company-branding {
                color: #667eea;
                font-weight: 600;
            }
            
            @media print {
                .invoice-container {
                    box-shadow: none;
                    padding: 20px;
                }
                
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <div class="company-section">
                    ${company.logo ? `<img src="${company.logo}" alt="${company.name}" class="company-logo">` : ''}
                    <div class="company-name">${company.name}</div>
                    <div class="company-details">
                        ${company.address ? `${company.address}<br>` : ''}
                        ${company.email ? `${company.email}<br>` : ''}
                        ${company.phone ? `${company.phone}` : ''}
                    </div>
                </div>
                
                <div class="invoice-section">
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-number">#${invoice.invoiceNumber}</div>
                    <div class="invoice-meta">
                        <div>Date: ${new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div>Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Upon Receipt'}</div>
                    </div>
                </div>
            </div>
            
            <div class="billing-section">
                <div class="billing-card">
                    <div class="billing-title">Bill From</div>
                    <div class="billing-name">${company.name}</div>
                    <div class="billing-content">
                        ${company.address ? `${company.address}<br>` : ''}
                        ${company.email ? `${company.email}<br>` : ''}
                        ${company.phone ? `${company.phone}` : ''}
                    </div>
                </div>
                
                <div class="billing-card">
                    <div class="billing-title">Bill To</div>
                    ${customer ? `
                        <div class="billing-name">${customer.name}</div>
                        <div class="billing-content">
                            ${customer.email ? `${customer.email}<br>` : ''}
                            ${customer.phone ? `${customer.phone}<br>` : ''}
                            ${customer.address ? `${customer.address}` : ''}
                        </div>
                    ` : `
                        <div class="billing-name">Walk-in Customer</div>
                        <div class="billing-content">No customer details available</div>
                    `}
                </div>
            </div>
            
            <div class="items-section">
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Duration</th>
                            <th class="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.lines.map((line: any) => `
                            <tr>
                                <td>
                                    <div class="item-description">${line.description}</div>
                                    ${line.sku ? `<div class="item-sku">SKU: ${line.sku}</div>` : ''}
                                </td>
                                <td>${line.quantity}</td>
                                <td>${invoice.currency} ${line.unitPrice.toFixed(2)}</td>
                                <td>${line.duration || 1} ${line.durationPeriod || 'Unit(s)'}</td>
                                <td class="text-right">${invoice.currency} ${(line.amount || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td class="total-label">Subtotal:</td>
                        <td class="total-amount">${invoice.currency} ${invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    ${invoice.scheduleSnapshot && invoice.taxTotal > 0 ? `
                        ${invoice.scheduleSnapshot.components.map((tax: any) => `
                            <tr>
                                <td class="total-label">${tax.name} (${(tax.rate * 100).toFixed(1)}%):</td>
                                <td class="total-amount">${invoice.currency} ${(invoice.subtotal * tax.rate).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    ` : ''}
                    <tr class="grand-total">
                        <td class="total-label">Total:</td>
                        <td class="total-amount">${invoice.currency} ${invoice.total.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="payment-section">
                <div class="payment-title">Payment Information</div>
                <div>
                    Status: <span class="payment-status ${invoice.status === 'paid' ? 'status-paid' : invoice.status === 'pending' ? 'status-pending' : 'status-overdue'}">${invoice.status.toUpperCase()}</span>
                </div>
                
                ${invoice.payment ? `
                    <div class="payment-details">
                        <div class="payment-detail">
                            <span class="payment-label">Method:</span><br>
                            <span class="payment-value">${invoice.payment.method?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
                        </div>
                        ${invoice.payment.reference ? `
                            <div class="payment-detail">
                                <span class="payment-label">Reference:</span><br>
                                <span class="payment-value">${invoice.payment.reference}</span>
                            </div>
                        ` : ''}
                        ${invoice.payment.timestamp ? `
                            <div class="payment-detail">
                                <span class="payment-label">Payment Date:</span><br>
                                <span class="payment-value">${new Date(invoice.payment.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        ` : ''}
                        ${invoice.payment.provider ? `
                            <div class="payment-detail">
                                <span class="payment-label">Provider:</span><br>
                                <span class="payment-value">${invoice.payment.provider.toUpperCase()}</span>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <div class="footer-message">Thank you for your business!</div>
                <div>This invoice was generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} by <span class="company-branding">${company.name}</span></div>
                <div style="margin-top: 10px; font-size: 12px;">
                    Invoice ID: ${invoice._id} | Generated via ${company.name} Facility Management System
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateReceiptHTML = (data: ReceiptPDFData): string => {
  const { receipt, invoice, company, customer } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt ${receipt._id}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1f2937;
                line-height: 1.6;
                background: #ffffff;
            }
            
            .receipt-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 3px solid #10b981;
            }
            
            .company-logo {
                max-width: 150px;
                max-height: 60px;
                margin-bottom: 15px;
                border-radius: 8px;
            }
            
            .receipt-title {
                font-size: 36px;
                font-weight: 800;
                color: #10b981;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .company-name {
                font-size: 24px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 8px;
            }
            
            .company-details {
                color: #6b7280;
                font-size: 14px;
            }
            
            .receipt-info {
                background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
                border: 2px solid #10b981;
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 30px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
            }
            
            .info-label {
                font-size: 12px;
                font-weight: 700;
                color: #059669;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            
            .info-value {
                font-size: 15px;
                font-weight: 600;
                color: #111827;
            }
            
            .amount-section {
                text-align: center;
                margin: 40px 0;
                padding: 30px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border-radius: 15px;
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            }
            
            .amount-label {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 10px;
                opacity: 0.9;
            }
            
            .amount-value {
                font-size: 42px;
                font-weight: 800;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .payment-details {
                background: #f8fafc;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
            }
            
            .payment-title {
                font-size: 18px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
            }
            
            .payment-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .payment-item {
                display: flex;
                flex-direction: column;
            }
            
            .payment-label {
                font-size: 12px;
                font-weight: 700;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            
            .payment-value {
                font-size: 14px;
                font-weight: 600;
                color: #111827;
            }
            
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                background: #10b981;
                color: white;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .footer {
                text-align: center;
                padding-top: 30px;
                border-top: 2px solid #e5e7eb;
                color: #6b7280;
                font-size: 13px;
            }
            
            .footer-message {
                font-size: 18px;
                font-weight: 700;
                color: #10b981;
                margin-bottom: 15px;
            }
            
            .footer-note {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin: 10px 0;
            }
            
            @media print {
                .receipt-container {
                    box-shadow: none;
                    padding: 20px;
                }
                
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                ${company.logo ? `<img src="${company.logo}" alt="${company.name}" class="company-logo">` : ''}
                <div class="receipt-title">Payment Receipt</div>
                <div class="company-name">${company.name}</div>
                <div class="company-details">
                    ${company.address ? `${company.address}<br>` : ''}
                    ${company.email && company.phone ? `${company.email} • ${company.phone}` : company.email || company.phone || ''}
                </div>
            </div>
            
            <div class="receipt-info">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Receipt ID</div>
                        <div class="info-value">${receipt._id.toString().slice(-8).toUpperCase()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Invoice Number</div>
                        <div class="info-value">#${invoice.invoiceNumber}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Date</div>
                        <div class="info-value">${new Date(receipt.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Time</div>
                        <div class="info-value">${new Date(receipt.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    ${customer ? `
                        <div class="info-item" style="grid-column: 1 / -1;">
                            <div class="info-label">Customer</div>
                            <div class="info-value">${customer.name} ${customer.email ? `(${customer.email})` : ''}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="amount-section">
                <div class="amount-label">Amount Paid</div>
                <div class="amount-value">${invoice.currency} ${receipt.amount.toFixed(2)}</div>
            </div>
            
            <div class="payment-details">
                <div class="payment-title">Payment Details</div>
                <div class="payment-grid">
                    ${invoice.payment ? `
                        <div class="payment-item">
                            <div class="payment-label">Payment Method</div>
                            <div class="payment-value">${invoice.payment.method?.replace('_', ' ').toUpperCase() || 'N/A'}</div>
                        </div>
                        ${invoice.payment.provider ? `
                            <div class="payment-item">
                                <div class="payment-label">Provider</div>
                                <div class="payment-value">${invoice.payment.provider.toUpperCase()}</div>
                            </div>
                        ` : ''}
                        ${receipt.reference ? `
                            <div class="payment-item">
                                <div class="payment-label">Transaction Reference</div>
                                <div class="payment-value">${receipt.reference}</div>
                            </div>
                        ` : ''}
                    ` : ''}
                    <div class="payment-item">
                        <div class="payment-label">Status</div>
                        <div class="payment-value"><span class="status-badge">Paid</span></div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-message">Thank you for your payment!</div>
                <div class="footer-note">Please keep this receipt for your records</div>
                <div>Receipt generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} by ${company.name}</div>
                <div style="margin-top: 10px; font-size: 12px;">
                    Receipt ID: ${receipt._id} | Generated via ${company.name} Facility Management System
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  try {
    const invoice = await InvoiceModel.findById(invoiceId)
      .populate('company')
      .populate('customer')
      .lean();

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const company = invoice.company as any;
    const customer = invoice.customer as any;

    const html = generateInvoiceHTML({
      invoice: invoice as any,
      company,
      customer
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }
    });

    await browser.close();
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw new Error('Failed to generate invoice PDF');
  }
}

export async function generateReceiptPDF(receiptId: string): Promise<Buffer> {
  try {
    const receipt = await ReceiptModel.findById(receiptId)
      .populate({
        path: 'invoice',
        populate: {
          path: 'company customer'
        }
      })
      .lean();

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    const invoice = receipt.invoice as any;
    const company = invoice.company;
    const customer = invoice.customer;

    const html = generateReceiptHTML({
      receipt: receipt as any,
      invoice,
      company,
      customer
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }
    });

    await browser.close();
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    throw new Error('Failed to generate receipt PDF');
  }
}