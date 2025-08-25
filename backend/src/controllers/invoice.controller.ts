import { Request, Response } from "express";
import { invoiceService, InvoiceService } from "../services/invoice.service";
import { sendSuccess, sendError, sendNotFound, sendValidationError } from "../utils";
import { emailService } from "../services/email.service";
import { emitEvent } from "../realtime/socket";
import { Events } from "../realtime/events";

// Get all invoices for company
const getCompanyInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      sendError(res, "Company context required", 400);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: any = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.facilityId) filters.facilityId = req.query.facilityId;
    if (req.query.search) filters.search = req.query.search;
    if (req.query.startDate) (filters as any).startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) (filters as any).endDate = new Date(req.query.endDate as string);

    const result = await invoiceService.getCompanyInvoices(companyId, filters, page, limit);

    sendSuccess(res, "Invoices retrieved successfully", result);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Get user invoices
const getUserInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, "User not authenticated", 401);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: any = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.facilityId) filters.facilityId = req.query.facilityId;
    if (req.query.startDate) (filters as any).startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) (filters as any).endDate = new Date(req.query.endDate as string);

    const result = await invoiceService.getUserInvoices(userId, filters, page, limit);

    sendSuccess(res, "Invoices retrieved successfully", result);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Get invoice by ID
const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoiceById(id);

    if (!invoice) {
      sendNotFound(res, "Invoice not found");
      return;
    }

    // Check if user has access to this invoice
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    
    if (invoice.user.toString() !== userId && invoice.company.toString() !== companyId) {
      sendError(res, "Access denied", 403);
      return;
    }

    sendSuccess(res, "Invoice retrieved successfully", invoice);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Create new invoice
const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      sendError(res, "Company context required", 400);
      return;
    }

    const {
      userId,
      transactionId,
      bookingId,
      facilityId,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      currency,
      dueDate,
      notes,
      terms,
      customerInfo,
    } = req.body;

    // Validate required fields
    if (!userId || !items || !subtotal || !totalAmount || !dueDate) {
      sendValidationError(res, "Missing required fields");
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      sendValidationError(res, "At least one item is required");
      return;
    }

    const invoiceData = {
      companyId,
      userId,
      transactionId,
      bookingId,
      facilityId,
      items,
      subtotal: parseFloat(subtotal),
      taxAmount: parseFloat(taxAmount || 0),
      discountAmount: parseFloat(discountAmount || 0),
      totalAmount: parseFloat(totalAmount),
      currency: currency || "GHS",
      dueDate: new Date(dueDate),
      notes,
      terms,
      customerInfo,
    };

    const invoice = await invoiceService.createInvoice(invoiceData);

    // Emit real-time event
    emitEvent(Events.InvoiceCreated, {
      id: invoice._id,
      invoice,
    });

    // Send email notification if configured
    try {
      await emailService.sendInvoiceEmail(invoice);
    } catch (emailError) {
      console.error("Failed to send invoice email:", emailError);
    }

    sendSuccess(res, "Invoice created successfully", invoice);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Update invoice status
const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paidDate, paymentMethod } = req.body;

    if (!status) {
      sendValidationError(res, "Status is required");
      return;
    }

    const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"];
    if (!validStatuses.includes(status)) {
      sendValidationError(res, "Invalid status");
      return;
    }

    const invoice = await invoiceService.updateInvoiceStatus(
      id,
      status,
      paidDate ? new Date(paidDate) : undefined,
      paymentMethod
    );

    if (!invoice) {
      sendNotFound(res, "Invoice not found");
      return;
    }

    // Emit real-time event
    emitEvent(Events.InvoicePaid, {
      id: invoice._id,
      invoice,
    });

    sendSuccess(res, "Invoice status updated successfully", invoice);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Download invoice PDF
const downloadInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoiceById(id);

    if (!invoice) {
      sendNotFound(res, "Invoice not found");
      return;
    }

    // Check if user has access to this invoice
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    
    if (invoice.user.toString() !== userId && invoice.company.toString() !== companyId) {
      sendError(res, "Access denied", 403);
      return;
    }

    const pdfBuffer = await invoiceService.generateInvoicePDF(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Download receipt PDF
const downloadReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoiceById(id);

    if (!invoice) {
      sendNotFound(res, "Invoice not found");
      return;
    }

    if (invoice.status !== "paid") {
      sendError(res, "Cannot generate receipt for unpaid invoice", 400);
      return;
    }

    // Check if user has access to this invoice
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    
    if (invoice.user.toString() !== userId && invoice.company.toString() !== companyId) {
      sendError(res, "Access denied", 403);
      return;
    }

    const pdfBuffer = await invoiceService.generateReceiptPDF(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="receipt-${invoice.invoiceNumber}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Get invoice statistics
const getInvoiceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      sendError(res, "Company context required", 400);
      return;
    }

    const stats = await invoiceService.getInvoiceStats(companyId);
    sendSuccess(res, "Invoice statistics retrieved successfully", stats);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Create invoice from transaction
const createInvoiceFromTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      sendValidationError(res, "Transaction ID is required");
      return;
    }

    const invoice = await invoiceService.createInvoiceFromTransaction(transactionId);

    // Emit real-time event
    emitEvent(Events.InvoiceCreated, {
      id: invoice._id,
      invoice,
    });

    sendSuccess(res, "Invoice created from transaction successfully", invoice);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Get company receipts (paid invoices)
const getCompanyReceipts = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      sendError(res, "Company context required", 400);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: any = { status: "paid" };

    if (req.query.startDate) (filters as any).startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) (filters as any).endDate = new Date(req.query.endDate as string);

    const result = await invoiceService.getCompanyInvoices(companyId, filters, page, limit);

    sendSuccess(res, "Receipts retrieved successfully", result);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Get user receipts (paid invoices)
const getUserReceipts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, "User not authenticated", 401);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: any = { status: "paid" };

    if (req.query.startDate) (filters as any).startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) (filters as any).endDate = new Date(req.query.endDate as string);

    const result = await invoiceService.getUserInvoices(userId, filters, page, limit);

    sendSuccess(res, "Receipts retrieved successfully", result);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// Get next invoice number
const getNextInvoiceNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      sendError(res, "Company ID not found", null, 400);
      return;
    }

    const invoiceNumber = await InvoiceService.getNextInvoiceNumber(companyId);
    sendSuccess(res, "Invoice number generated", { invoiceNumber });
  } catch (error: any) {
    sendError(res, error.message, null, 400);
  }
};

// Get receipt number for invoice
const getReceiptNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    const receiptNumber = await InvoiceService.getReceiptNumber(invoiceId);
    sendSuccess(res, "Receipt number generated", { receiptNumber });
  } catch (error: any) {
    sendError(res, error.message, null, 400);
  }
};

export const InvoiceController = {
  getCompanyInvoices,
  getUserInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  downloadInvoice,
  downloadReceipt,
  getInvoiceStats,
  createInvoiceFromTransaction,
  getCompanyReceipts,
  getUserReceipts,
  getNextInvoiceNumber,
  getReceiptNumber,
};