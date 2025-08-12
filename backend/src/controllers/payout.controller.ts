import { Request, Response } from "express";
import { PayoutModel } from "../models/payout.model";
import { CompanyModel } from "../models/company.model";
import { sendSuccess, sendError } from "../utils";
import axios from "axios";
import { CONFIG } from "../config";
import { computeCompanyAvailable, computePlatformAvailable } from "../services/balance.service";

export async function requestPayout(req: Request, res: Response) {
  try {
    const { amount, currency = "GHS" } = req.body;
    const companyId = (req.user as any).companyId;
    if (!companyId) return sendError(res, "No company context", null, 400);
    const company = await CompanyModel.findById(companyId).lean();
    if (!company || !(company as any).paystackRecipientCode) {
      return sendError(res, "Recipient not configured", null, 400);
    }
    const bal = await computeCompanyAvailable(companyId);
    if (amount > bal.available) return sendError(res, "Insufficient available balance", null, 400);
    const doc = await PayoutModel.create({
      company: companyId,
      amount,
      currency,
      recipientCode: (company as any).paystackRecipientCode,
      status: "pending",
      requestedBy: (req.user as any).id,
    } as any);
    return sendSuccess(res, "Payout requested", { payout: doc }, 201);
  } catch (e: any) {
    return sendError(res, "Failed to request payout", e.message);
  }
}

export async function approvePayout(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) return sendError(res, "Forbidden", null, 403);
    const { id } = req.params;
    const doc = await PayoutModel.findByIdAndUpdate(id, { status: "approved", processedBy: (req.user as any).id }, { new: true });
    if (!doc) return sendError(res, "Payout not found", null, 404);
    return sendSuccess(res, "Payout approved", { payout: doc });
  } catch (e: any) {
    return sendError(res, "Failed to approve payout", e.message);
  }
}

export async function processPayout(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) return sendError(res, "Forbidden", null, 403);
    const { id } = req.params;
    const doc = await PayoutModel.findById(id);
    if (!doc) return sendError(res, "Payout not found", null, 404);
    if ((doc as any).status !== "approved") return sendError(res, "Payout must be approved", null, 400);
    // Initiate Paystack transfer
    const response = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        reason: (doc as any).reason || `Payout ${(doc as any)._id}`,
        amount: Math.round(((doc as any).amount || 0) * 100),
        recipient: (doc as any).recipientCode,
        currency: (doc as any).currency || "GHS",
      },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    (doc as any).status = "processing";
    (doc as any).paystackTransferCode = response?.data?.data?.transfer_code;
    (doc as any).paystackTransferId = response?.data?.data?.id?.toString?.();
    await doc.save();
    return sendSuccess(res, "Payout processing initiated", { payout: doc });
  } catch (e: any) {
    return sendError(res, "Failed to process payout", e.message);
  }
}

export async function companyBalance(req: Request, res: Response) {
  try {
    const companyId = (req.user as any)?.companyId;
    const bal = await computeCompanyAvailable(companyId);
    return sendSuccess(res, "Company available balance", bal);
  } catch (e: any) {
    return sendError(res, "Failed to compute balance", e.message);
  }
}

export async function platformBalance(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) return sendError(res, "Forbidden", null, 403);
    const bal = await computePlatformAvailable();
    return sendSuccess(res, "Platform available balance", bal);
  } catch (e: any) {
    return sendError(res, "Failed to compute platform balance", e.message);
  }
}