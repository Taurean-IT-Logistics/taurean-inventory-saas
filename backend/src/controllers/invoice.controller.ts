import { Request, Response } from "express";
import * as InvoiceService from "../services/invoice.service";
import * as PDFService from "../services/pdf.service";
import { sendSuccess, sendError } from "../utils";
import { InvoiceModel } from "../models/invoice.model";
import { ReceiptModel } from "../models/receipt.model";

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { lines, customerId, currency, taxScheduleId } = req.body;
    const companyId = user.companyId;
    const invoice = await InvoiceService.createInvoice({
      companyId,
      createdBy: user.id,
      customerId,
      currency,
      lines,
      taxScheduleId,
    });
    sendSuccess(res, "Invoice created", { invoice }, 201);
  } catch (e: any) {
    sendError(res, "Failed to create invoice", e.message);
  }
}

export async function pay(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { method, provider, reference, timestamp } = req.body;
    const result = await InvoiceService.payInvoice({
      invoiceId: id,
      method,
      provider,
      reference,
      timestamp,
    });
    sendSuccess(res, "Invoice paid", result, 200);
  } catch (e: any) {
    sendError(res, "Failed to pay invoice", e.message);
  }
}

export async function listCompanyInvoices(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const companyId = (req.user as any)?.companyId;

    if (!companyId) {
      sendError(
        res,
        "Company ID not found. User must be associated with a company."
      );
      return;
    }

    const docs = await InvoiceModel.find({ company: companyId }).sort({
      createdAt: -1,
    });
    sendSuccess(res, "Company invoices", { invoices: docs });
  } catch (e: any) {
    sendError(res, "Failed to list invoices", e.message);
  }
}

export async function listUserInvoices(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req.user as any)?.id;
    const docs = await InvoiceModel.find({ customer: userId }).sort({
      createdAt: -1,
    });
    sendSuccess(res, "My invoices", { invoices: docs });
  } catch (e: any) {
    sendError(res, "Failed to list invoices", e.message);
  }
}

export async function listCompanyReceipts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const companyId = (req.user as any)?.companyId;
    
    if (!companyId) {
      sendError(res, "Company ID not found. User must be associated with a company.");
      return;
    }

    const invoices = await InvoiceModel.find({ company: companyId }).select(
      "_id"
    );
    const ids = invoices.map((i) => i._id);
    const docs = await ReceiptModel.find({ invoice: { $in: ids } }).sort({
      createdAt: -1,
    });
    sendSuccess(res, "Company receipts", { receipts: docs });
  } catch (e: any) {
    sendError(res, "Failed to list receipts", e.message);
  }
}

export async function listUserReceipts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req.user as any)?.id;
    const invoices = await InvoiceModel.find({ customer: userId }).select(
      "_id"
    );
    const ids = invoices.map((i) => i._id);
    const docs = await ReceiptModel.find({ invoice: { $in: ids } }).sort({
      createdAt: -1,
    });
    sendSuccess(res, "My receipts", { receipts: docs });
  } catch (e: any) {
    sendError(res, "Failed to list receipts", e.message);
  }
}

export async function downloadInvoicePDF(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user as any;

    // Check if user has access to this invoice
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      sendError(res, "Invoice not found", 404);
      return;
    }

    // Check permissions - either owner or company member
    const isOwner = invoice.customer?.toString() === user.id;
    const isCompanyMember = invoice.company?.toString() === user.companyId;

    if (!isOwner && !isCompanyMember) {
      sendError(res, "Access denied", 403);
      return;
    }

    const pdfBuffer = await PDFService.generateInvoicePDF(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (e: any) {
    sendError(res, "Failed to generate invoice PDF", e.message);
  }
}

export async function downloadReceiptPDF(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user as any;

    // Check if user has access to this receipt
    const receipt = await ReceiptModel.findById(id).populate("invoice");
    if (!receipt || !receipt.invoice) {
      sendError(res, "Receipt not found", 404);
      return;
    }

    const invoice = receipt.invoice as any;

    // Check permissions - either owner or company member
    const isOwner = invoice.customer?.toString() === user.id;
    const isCompanyMember = invoice.company?.toString() === user.companyId;

    if (!isOwner && !isCompanyMember) {
      sendError(res, "Access denied", 403);
      return;
    }

    const pdfBuffer = await PDFService.generateReceiptPDF(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt-${receipt._id}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (e: any) {
    sendError(res, "Failed to generate receipt PDF", e.message);
  }
}
