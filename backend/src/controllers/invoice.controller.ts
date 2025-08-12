import { Request, Response } from "express";
import * as InvoiceService from "../services/invoice.service";
import { sendSuccess, sendError } from "../utils";

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
    return sendSuccess(res, "Invoice created", { invoice }, 201);
  } catch (e: any) {
    return sendError(res, "Failed to create invoice", e.message);
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
    return sendSuccess(res, "Invoice paid", result, 200);
  } catch (e: any) {
    return sendError(res, "Failed to pay invoice", e.message);
  }
}