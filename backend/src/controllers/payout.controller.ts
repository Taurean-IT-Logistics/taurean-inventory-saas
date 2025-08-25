import { Request, Response } from "express";
import { PayoutModel } from "../models/payout.model";
import { CompanyModel } from "../models/company.model";
import { sendSuccess, sendError } from "../utils";
import axios from "axios";
import { CONFIG } from "../config";

export async function approvePayout(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) {
      sendError(res, "Forbidden", null, 403);
      return;
    }
    const { id } = req.params;
    const doc = await PayoutModel.findByIdAndUpdate(
      id,
      { status: "approved", processedBy: (req.user as any).id },
      { new: true }
    );
    if (!doc) {
      sendError(res, "Payout not found", null, 404);
      return;
    }
    sendSuccess(res, "Payout approved", { payout: doc });
  } catch (e: any) {
    sendError(res, "Failed to approve payout", e.message);
  }
}

export async function processPayout(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) {
      sendError(res, "Forbidden", null, 403);
      return;
    }
    const { id } = req.params;
    const doc = await PayoutModel.findById(id);
    if (!doc) {
      sendError(res, "Payout not found", null, 404);
      return;
    }
    if ((doc as any).status !== "approved") {
      sendError(res, "Payout must be approved", null, 400);
      return;
    }
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
    sendSuccess(res, "Payout processing initiated", { payout: doc });
  } catch (e: any) {
    sendError(res, "Failed to process payout", e.message);
  }
}
