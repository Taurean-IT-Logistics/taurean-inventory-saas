import { Request, Response } from "express";
import { CompanyModel } from "../models/company.model";
import { sendSuccess, sendError } from "../utils";
import crypto from "crypto";

const plans = [
  { id: "monthly", label: "Monthly", durationDays: 30 },
  { id: "biannual", label: "Bi-Annual", durationDays: 182 },
  { id: "annual", label: "Annual", durationDays: 365 },
  { id: "triannual", label: "Tri-Annual", durationDays: 365 * 3 },
];

export async function pricing(req: Request, res: Response) {
  sendSuccess(res, "Pricing plans", { plans });
}

function generateLicenseKey(companyId: string): string {
  const nonce = crypto.randomBytes(8).toString("hex");
  return `${companyId.slice(-6)}-${nonce}`.toUpperCase();
}

export async function activateSubscription(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) {
      sendError(res, "Forbidden", null, 403);
      return;
    }

    const { companyId, plan } = req.body;
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      sendError(res, "Company not found", null, 404);
      return;
    }

    const p = plans.find((x) => x.id === plan);
    if (!p) {
      sendError(res, "Invalid plan", null, 400);
      return;
    }

    const expiresAt = new Date(
      Date.now() + p.durationDays * 24 * 60 * 60 * 1000
    );
    const licenseKey = generateLicenseKey((company as any)._id.toString());
    company.subscription = { plan: plan as any, expiresAt, licenseKey } as any;
    await company.save();
    sendSuccess(res, "Subscription activated", { company });
  } catch (e: any) {
    sendError(res, "Failed to activate subscription", e.message);
  }
}

export async function renewSubscription(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) {
      sendError(res, "Forbidden", null, 403);
      return;
    }

    const { companyId } = req.body;
    const company = await CompanyModel.findById(companyId);
    if (!company || !company.subscription) {
      sendError(res, "Company or subscription not found", null, 404);
      return;
    }

    const p = plans.find((x) => x.id === (company.subscription as any).plan);
    if (!p) {
      sendError(res, "Invalid plan on company", null, 400);
      return;
    }

    const expiresAt = new Date(
      Date.now() + p.durationDays * 24 * 60 * 60 * 1000
    );
    const licenseKey = generateLicenseKey((company as any)._id.toString());
    company.subscription = {
      plan: (company.subscription as any).plan,
      expiresAt,
      licenseKey,
    } as any;
    await company.save();
    sendSuccess(res, "Subscription renewed", { company });
  } catch (e: any) {
    sendError(res, "Failed to renew subscription", e.message);
  }
}

export async function updatePayoutConfig(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) {
      sendError(res, "Forbidden", null, 403);
      return;
    }

    const { companyId, subaccountCode, feePercent } = req.body;
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      sendError(res, "Company not found", null, 404);
      return;
    }

    if (subaccountCode) {
      (company as any).paystackSubaccountCode = subaccountCode;
    }
    if (feePercent !== undefined) {
      (company as any).feePercent = feePercent;
    }
    await company.save();
    sendSuccess(res, "Payout config updated", { company });
  } catch (e: any) {
    sendError(res, "Failed to update payout config", e.message);
  }
}
