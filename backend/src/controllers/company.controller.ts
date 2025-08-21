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
      company.paystackSubaccountCode = subaccountCode;
    }
    if (feePercent !== undefined) {
      company.feePercent = feePercent;
    }

    await company.save();
    sendSuccess(res, "Payout config updated", { company });
  } catch (e: any) {
    sendError(res, "Failed to update payout config", e.message);
  }
}

// Public companies endpoint - accessible to everyone
export async function getPublicCompanies(req: Request, res: Response) {
  try {
    const { search } = req.query;
    let query: any = {};

    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const companies = await CompanyModel.find(query)
      .select("_id name contactEmail contactPhone location logo")
      .sort({ createdAt: -1 })
      .limit(10);

    sendSuccess(res, "Public companies retrieved successfully", { companies });
  } catch (e: any) {
    sendError(res, "Failed to retrieve public companies", e.message);
  }
}

// Get all companies (for Taurean IT super admins only)
export async function getAllCompanies(req: Request, res: Response) {
  try {
    // Only Taurean IT super admins can see all companies
    if (!(req.user as any)?.isSuperAdmin) {
      sendError(
        res,
        "Forbidden: Only Taurean IT super admins can access this",
        null,
        403
      );
      return;
    }

    const companies = await CompanyModel.find({})
      .select(
        "_id name contactEmail contactPhone location isActive subscription"
      )
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    sendSuccess(res, "Companies retrieved successfully", { companies });
  } catch (e: any) {
    sendError(res, "Failed to retrieve companies", e.message);
  }
}

export async function updateCompany(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      sendError(res, "Company not found", null, 404);
      return;
    }

    // Check if user has permission to update this company
    const userCompanyId =
      (req.user as any)?.company?._id?.toString() ||
      (req.user as any)?.companyId?.toString() ||
      (req.user as any)?.company?.toString();

    // Only allow if user is updating their own company OR is a Taurean IT super admin
    if (userCompanyId !== companyId && !(req.user as any)?.isSuperAdmin) {
      sendError(
        res,
        "Forbidden: You can only update your own company",
        null,
        403
      );
      return;
    }

    // Handle uploaded image (single image)
    if (req.file) {
      const imageData = {
        path: req.file.path,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };

      // Replace the existing image with the new one
      (company as any).logo = imageData;
    }

    // Update company fields
    const updateFields = [
      "name",
      "description",
      "location",
      "website",
      "phone",
      "email",
      "currency",
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (company as any)[field] = req.body[field];
      }
    });

    // Handle fee percentage (only Taurean IT super admins can update)
    if (req.body.feePercent !== undefined && (req.user as any)?.isSuperAdmin) {
      (company as any).feePercent = parseFloat(req.body.feePercent);
    }

    // Handle invoice format
    if (req.body.invoiceFormat) {
      try {
        const invoiceFormat = JSON.parse(req.body.invoiceFormat);
        if (
          invoiceFormat.type &&
          ["auto", "prefix", "paystack"].includes(invoiceFormat.type)
        ) {
          (company as any).invoiceFormat = {
            type: invoiceFormat.type,
            prefix: invoiceFormat.prefix || "",
            nextNumber: invoiceFormat.nextNumber || 1,
            padding: invoiceFormat.padding || 4,
          };
        }
      } catch (e) {
        // If parsing fails, treat as simple string
        (company as any).invoiceFormat = {
          type: "auto",
          prefix: req.body.invoiceFormat,
          nextNumber: 1,
          padding: 4,
        };
      }
    }

    // Ensure Taurean IT is always active
    if (company.name === "Taurean IT") {
      (company as any).isActive = true;
      // Ensure subscription is always valid for Taurean IT
      if (
        !(company as any).subscription ||
        !(company as any).subscription.expiresAt
      ) {
        (company as any).subscription = {
          plan: "annual",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          licenseKey: "TAUREAN-IT-2024",
          status: "active",
          hasUsedTrial: false,
          isTrial: false,
        };
      }
    }

    await company.save();
    sendSuccess(res, "Company updated successfully", { company });
  } catch (e: any) {
    sendError(res, "Failed to update company", e.message);
  }
}

export async function handleJoinRequest(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const userId = (req.user as any)?.id;

    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    if (!companyId) {
      sendError(res, "Company ID is required", null, 400);
      return;
    }

    // Check if company exists
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      sendError(res, "Company not found", null, 404);
      return;
    }

    // Check if user is already associated with a company
    const UserModel = (await import("../models/user.model")).UserModel;
    const user = await UserModel.findById(userId);

    if (user?.company) {
      sendError(res, "User is already associated with a company", null, 400);
      return;
    }

    // Check if join request already exists
    const JoinRequestModel = (
      await import("../models/companyJoinRequest.model")
    ).CompanyJoinRequestModel;
    const existingRequest = await JoinRequestModel.findOne({
      user: userId,
      company: companyId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        sendError(res, "Join request already pending", null, 400);
        return;
      } else if (existingRequest.status === "approved") {
        sendError(
          res,
          "User is already approved to join this company",
          null,
          400
        );
        return;
      }
    }

    // Create join request
    const joinRequest = new JoinRequestModel({
      user: userId,
      company: companyId,
      status: "pending",
      message: req.body.message || "User requests to join company",
    });

    await joinRequest.save();

    sendSuccess(res, "Join request sent successfully", { joinRequest });
  } catch (e: any) {
    sendError(res, "Failed to send join request", e.message);
  }
}

export const CompanyController = {
  pricing,
  activateSubscription,
  renewSubscription,
  updatePayoutConfig,
  getAllCompanies,
  updateCompany,
  getPublicCompanies,
  handleJoinRequest,
};
