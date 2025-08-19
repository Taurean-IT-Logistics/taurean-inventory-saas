import { InvoiceModel } from '../models/invoice.model';
import { ReceiptModel } from '../models/receipt.model';

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  try {
    // For now, return a simple PDF placeholder
    const invoice = await InvoiceModel.findById(invoiceId).populate('company').populate('customer');
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Simple HTML content for PDF generation
    const htmlContent = `
      <html>
        <body>
          <h1>Invoice #${invoice.invoiceNumber}</h1>
          <p>Company: ${(invoice.company as any)?.name}</p>
          <p>Customer: ${(invoice.customer as any)?.name || 'Walk-in Customer'}</p>
          <p>Total: ${invoice.currency} ${invoice.total}</p>
          <p>Status: ${invoice.status}</p>
        </body>
      </html>
    `;
    
    // Return HTML as buffer for now - can be enhanced later with proper PDF generation
    return Buffer.from(htmlContent);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw new Error('Failed to generate invoice PDF');
  }
}

export async function generateReceiptPDF(receiptId: string): Promise<Buffer> {
  try {
    const receipt = await ReceiptModel.findById(receiptId).populate({
      path: 'invoice',
      populate: {
        path: 'company customer'
      }
    });

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    const invoice = receipt.invoice as any;
    
    const htmlContent = `
      <html>
        <body>
          <h1>Payment Receipt</h1>
          <p>Receipt ID: ${receipt._id}</p>
          <p>Invoice: #${invoice.invoiceNumber}</p>
          <p>Amount: ${invoice.currency} ${receipt.amount}</p>
          <p>Date: ${new Date(receipt.timestamp).toLocaleDateString()}</p>
        </body>
      </html>
    `;
    
    return Buffer.from(htmlContent);
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    throw new Error('Failed to generate receipt PDF');
  }
}