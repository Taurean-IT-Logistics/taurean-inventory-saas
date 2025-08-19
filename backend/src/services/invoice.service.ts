import { Types } from "mongoose";
import { CompanyModel } from "../models/company.model";
import { InvoiceModel, InvoiceDocument } from "../models/invoice.model";
import { ReceiptModel, ReceiptDocument } from "../models/receipt.model";
import { TaxScheduleModel } from "../models/taxSchedule.model";
import { emitEvent } from "../realtime/socket";
import { Events } from "../realtime/events";
import { notifyCompany } from "./notification.service";
import { emailService } from "./email.service";

function computeLineAmount(qty: number, unitPrice: number, duration?: number): number {
  const dur = duration && duration > 0 ? duration : 1;
  return qty * unitPrice * dur;
}

async function generateInvoiceNumber(companyId: string): Promise<string> {
  const company = await CompanyModel.findById(companyId);
  if (!company) throw new Error("Company not found");
  const format = company.invoiceFormat || { type: "auto", nextNumber: 1, padding: 4 } as any;
  const next = format.nextNumber || 1;
  const pad = format.padding || 4;
  let number = String(next).padStart(pad, "0");
  if (format.type === "prefix" && format.prefix) {
    number = `${format.prefix}${number}`;
  } else if (format.type === "paystack") {
    const idStr = (company as any)._id?.toString?.() || "0000";
    number = `${idStr.slice(-4)}-${number}`;
  }
  company.invoiceFormat = { ...format, nextNumber: next + 1 } as any;
  await company.save();
  return number;
}

export async function createInvoice(params: {
  companyId: string;
  createdBy: string;
  customerId?: string;
  currency?: string;
  lines: { sku?: string; description: string; quantity: number; unitPrice: number; duration?: number; durationPeriod?: "Hours" | "Days" | "Weeks" | "Months" }[];
  taxScheduleId?: string;
}): Promise<InvoiceDocument> {
  const invoiceNumber = await generateInvoiceNumber(params.companyId);
  const company = await CompanyModel.findById(params.companyId).lean();
  if (!company) throw new Error("Company not found");
  const currency = params.currency || company.currency || "GHS";

  const computedLines = params.lines.map((l) => ({
    ...l,
    amount: computeLineAmount(l.quantity, l.unitPrice, l.duration),
  }));
  const subtotal = computedLines.reduce((s, l) => s + (l.amount || 0), 0);

  let taxTotal = 0;
  let scheduleSnapshot: any = undefined;
  if (params.taxScheduleId) {
    const schedule = await TaxScheduleModel.findById(params.taxScheduleId).lean();
    if (!schedule) throw new Error("Tax schedule not found");
    scheduleSnapshot = {
      name: schedule.name,
      components: schedule.components.map((c) => ({ name: c.name, rate: c.rate })),
      taxOnTax: schedule.taxOnTax,
    };
    if (!schedule.taxOnTax) {
      taxTotal = schedule.components.reduce((acc, c) => acc + subtotal * c.rate, 0);
    } else {
      let base = subtotal;
      for (const c of schedule.components) {
        const t = base * c.rate;
        taxTotal += t;
        base += t;
      }
    }
  }
  const total = subtotal + taxTotal;

  const doc = await InvoiceModel.create({
    company: new Types.ObjectId(params.companyId),
    createdBy: new Types.ObjectId(params.createdBy),
    customer: params.customerId ? new Types.ObjectId(params.customerId) : undefined,
    invoiceNumber,
    status: "pending",
    currency,
    lines: computedLines as any,
    subtotal,
    taxTotal,
    total,
    scheduleSnapshot,
  } as any);

  try {
    emitEvent(Events.InvoiceCreated, { id: (doc as any)._id, invoice: doc }, `company:${params.companyId}`);
    await notifyCompany(params.companyId, { title: "Invoice created", message: `Invoice ${invoiceNumber} created`, type: "info" });
    
    // Send invoice email if customer exists
    if (params.customerId) {
      await emailService.sendInvoiceEmail((doc as any)._id.toString(), true);
    }
  } catch (emailError) {
    console.warn('Failed to send invoice email:', emailError);
  }

  return doc as any;
}

export async function payInvoice(params: {
  invoiceId: string;
  method: "cash" | "mobile_money" | "card";
  provider?: "mtn" | "vodafone" | "airteltigo" | "telecel" | "visa" | "mastercard" | "unknown";
  reference?: string; // Paystack ref
  timestamp?: Date;
}): Promise<{ invoice: InvoiceDocument; receipt: ReceiptDocument }>{
  const inv = await InvoiceModel.findById(params.invoiceId);
  if (!inv) throw new Error("Invoice not found");
  inv.payment = {
    method: params.method,
    provider: params.provider || "unknown",
    reference: params.reference,
    status: "paid",
    timestamp: params.timestamp || new Date(),
  } as any;
  inv.status = "paid";
  await inv.save();

  const receipt = await ReceiptModel.create({
    invoice: inv._id,
    amount: inv.total,
    timestamp: inv.payment.timestamp,
    reference: inv.payment.reference,
  } as any);

  try {
    emitEvent(Events.InvoicePaid, { id: (inv as any)._id, invoice: inv }, `company:${(inv as any).company?.toString?.()}`);
    await notifyCompany((inv as any).company?.toString?.(), { title: "Invoice paid", message: `Invoice ${inv.invoiceNumber} paid`, type: "success" });
    
    // Send receipt email
    await emailService.sendReceiptEmail((receipt as any)._id.toString(), true);
  } catch (emailError) {
    console.warn('Failed to send receipt email:', emailError);
  }

  return { invoice: inv as any, receipt: receipt as any };
}