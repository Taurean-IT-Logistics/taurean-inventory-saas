import { CompanyModel } from "../models/company.model";
import { InvoiceModel } from "../models/invoice.model";
import { PayoutModel } from "../models/payout.model";

export async function computeCompanyAvailable(companyId: string): Promise<{ available: number; currency: string }> {
  const company = await CompanyModel.findById(companyId).lean();
  if (!company) throw new Error("Company not found");
  const currency = (company as any).currency || "GHS";
  const paidInvoices = await InvoiceModel.aggregate([
    { $match: { company: (company as any)._id, status: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  const payouts = await PayoutModel.aggregate([
    { $match: { company: (company as any)._id, status: { $in: ["approved", "processing", "paid"] } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalPaid = paidInvoices[0]?.total || 0;
  const totalPayouts = payouts[0]?.total || 0;
  const available = Math.max(0, totalPaid - totalPayouts);
  return { available, currency };
}

export async function computePlatformAvailable(): Promise<{ available: number; currency: string }> {
  // Currency not uniform; assume GHS default
  // Sum platform fees = sum over paid invoices of (invoice.total * company.feePercent/100)
  const invoices = await InvoiceModel.aggregate([
    { $match: { status: "paid" } },
    { $lookup: { from: "companies", localField: "company", foreignField: "_id", as: "company" } },
    { $unwind: "$company" },
    { $project: { total: 1, feePercent: { $ifNull: ["$company.feePercent", 5] } } },
    { $group: { _id: null, totalFees: { $sum: { $divide: [{ $multiply: ["$total", "$feePercent"] }, 100] } } } },
  ]);
  const payouts = await PayoutModel.aggregate([
    { $match: { isPlatform: true, status: { $in: ["approved", "processing", "paid"] } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalFees = invoices[0]?.totalFees || 0;
  const totalPlatformPayouts = payouts[0]?.total || 0;
  const available = Math.max(0, totalFees - totalPlatformPayouts);
  return { available, currency: "GHS" };
}