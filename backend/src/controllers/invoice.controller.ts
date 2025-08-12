import { Request, Response } from "express";
import * as InvoiceService from "../services/invoice.service";
import { sendSuccess, sendError } from "../utils";
import { InvoiceModel } from "../models/invoice.model";
import { ReceiptModel } from "../models/receipt.model";

export async function create(req: Request, res: Response) {
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

export async function pay(req: Request, res: Response) {
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

export async function listCompanyInvoices(req: Request, res: Response) {
  try {
    const companyId = (req.user as any)?.companyId;
    const docs = await InvoiceModel.find({ company: companyId }).sort({
      createdAt: -1,
    });
    sendSuccess(res, "Company invoices", { invoices: docs });
  } catch (e: any) {
    sendError(res, "Failed to list invoices", e.message);
  }
}

export async function listUserInvoices(req: Request, res: Response) {
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

export async function listCompanyReceipts(req: Request, res: Response) {
  try {
    const companyId = (req.user as any)?.companyId;
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

export async function listUserReceipts(req: Request, res: Response) {
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
