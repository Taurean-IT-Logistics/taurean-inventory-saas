import * as XLSX from 'xlsx';
import { createObjectCsvWriter } from 'csv-writer';
import { TransactionModel } from '../models/transaction.model';
import { InvoiceModel } from '../models/invoice.model';
import { BookingModel } from '../models/booking.model';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

interface ExportOptions {
  format: 'csv' | 'excel';
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
  userId?: string;
  type?: 'income' | 'expense' | 'all';
}

interface TransactionExportData {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference?: string;
  customerName?: string;
  customerEmail?: string;
  facilityName?: string;
  createdBy?: string;
  reconciled: boolean;
  reconciledAt?: string;
}

interface BookingExportData {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  facilityName: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
}

interface InvoiceExportData {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  customerEmail?: string;
  issueDate: string;
  dueDate?: string;
  status: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdBy?: string;
}

export async function exportTransactions(options: ExportOptions): Promise<string> {
  try {
    // Build query
    const query: any = {};
    
    if (options.companyId) {
      query.company = options.companyId;
    }
    
    if (options.userId) {
      query.user = options.userId;
    }
    
    if (options.type && options.type !== 'all') {
      query.type = options.type;
    }
    
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        query.createdAt.$gte = options.startDate;
      }
      if (options.endDate) {
        query.createdAt.$lte = options.endDate;
      }
    }

    // Fetch transactions with populated data
    const transactions = await TransactionModel.find(query)
      .populate('user', 'name email')
      .populate('facility', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Transform data for export
    const exportData: TransactionExportData[] = transactions.map(transaction => ({
      id: transaction._id.toString(),
      date: new Date(transaction.createdAt).toISOString().split('T')[0],
      type: transaction.type,
      category: transaction.category || '',
      description: transaction.description || '',
      amount: transaction.amount || 0,
      currency: transaction.currency || 'GHS',
      method: transaction.method || '',
      status: transaction.status || 'pending',
      reference: transaction.ref || transaction.paymentDetails?.paystackReference || '',
      customerName: (transaction.user as any)?.name || '',
      customerEmail: (transaction.user as any)?.email || '',
      facilityName: (transaction.facility as any)?.name || '',
      createdBy: (transaction.createdBy as any)?.name || '',
      reconciled: transaction.reconciled || false,
      reconciledAt: transaction.reconciledAt ? new Date(transaction.reconciledAt).toISOString().split('T')[0] : ''
    }));

    // Generate file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `transactions-export-${timestamp}`;
    
    if (options.format === 'csv') {
      return await generateCSV(exportData, fileName);
    } else {
      return await generateExcel(exportData, fileName, 'Transactions');
    }

  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw new Error('Failed to export transactions');
  }
}

export async function exportBookings(options: ExportOptions): Promise<string> {
  try {
    // Build query
    const query: any = {};
    
    if (options.companyId) {
      query.company = options.companyId;
    }
    
    if (options.userId) {
      query.user = options.userId;
    }
    
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        query.createdAt.$gte = options.startDate;
      }
      if (options.endDate) {
        query.createdAt.$lte = options.endDate;
      }
    }

    // Fetch bookings with populated data
    const bookings = await BookingModel.find(query)
      .populate('user', 'name email')
      .populate('facility', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Transform data for export
    const exportData: BookingExportData[] = bookings.map(booking => ({
      id: booking._id.toString(),
      bookingNumber: booking.bookingNumber || '',
      customerName: (booking.user as any)?.name || '',
      customerEmail: (booking.user as any)?.email || '',
      facilityName: (booking.facility as any)?.name || '',
      startDate: new Date(booking.startDate).toISOString(),
      endDate: new Date(booking.endDate).toISOString(),
      duration: booking.duration || 0,
      status: booking.status || '',
      totalAmount: booking.totalAmount || 0,
      currency: booking.currency || 'GHS',
      paymentStatus: booking.paymentStatus || 'pending',
      createdAt: new Date(booking.createdAt).toISOString().split('T')[0]
    }));

    // Generate file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `bookings-export-${timestamp}`;
    
    if (options.format === 'csv') {
      return await generateCSV(exportData, fileName);
    } else {
      return await generateExcel(exportData, fileName, 'Bookings');
    }

  } catch (error) {
    console.error('Error exporting bookings:', error);
    throw new Error('Failed to export bookings');
  }
}

export async function exportInvoices(options: ExportOptions): Promise<string> {
  try {
    // Build query
    const query: any = {};
    
    if (options.companyId) {
      query.company = options.companyId;
    }
    
    if (options.userId) {
      query.customer = options.userId;
    }
    
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        query.createdAt.$gte = options.startDate;
      }
      if (options.endDate) {
        query.createdAt.$lte = options.endDate;
      }
    }

    // Fetch invoices with populated data
    const invoices = await InvoiceModel.find(query)
      .populate('customer', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Transform data for export
    const exportData: InvoiceExportData[] = invoices.map(invoice => ({
      id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      customerName: (invoice.customer as any)?.name || 'Walk-in Customer',
      customerEmail: (invoice.customer as any)?.email || '',
      issueDate: new Date(invoice.createdAt).toISOString().split('T')[0],
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxTotal,
      total: invoice.total,
      currency: invoice.currency,
      paymentMethod: invoice.payment?.method || '',
      paymentReference: invoice.payment?.reference || '',
      createdBy: (invoice.createdBy as any)?.name || ''
    }));

    // Generate file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `invoices-export-${timestamp}`;
    
    if (options.format === 'csv') {
      return await generateCSV(exportData, fileName);
    } else {
      return await generateExcel(exportData, fileName, 'Invoices');
    }

  } catch (error) {
    console.error('Error exporting invoices:', error);
    throw new Error('Failed to export invoices');
  }
}

async function generateCSV(data: any[], fileName: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'temp', `${fileName}.csv`);
  
  // Ensure temp directory exists
  const tempDir = path.dirname(filePath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  if (data.length === 0) {
    await writeFile(filePath, 'No data available for export\n');
    return filePath;
  }

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: Object.keys(data[0]).map(key => ({ id: key, title: key.charAt(0).toUpperCase() + key.slice(1) }))
  });

  await csvWriter.writeRecords(data);
  return filePath;
}

async function generateExcel(data: any[], fileName: string, sheetName: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'temp', `${fileName}.xlsx`);
  
  // Ensure temp directory exists
  const tempDir = path.dirname(filePath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  if (data.length === 0) {
    const worksheet = XLSX.utils.json_to_sheet([{ message: 'No data available for export' }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filePath);
    return filePath;
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns
  const colWidths: any[] = [];
  const headers = Object.keys(data[0]);
  
  headers.forEach((header, index) => {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => String(row[header] || '').length)
    );
    colWidths[index] = { width: Math.min(maxLength + 2, 50) };
  });
  
  worksheet['!cols'] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write file
  XLSX.writeFile(workbook, filePath);
  
  return filePath;
}

export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
}