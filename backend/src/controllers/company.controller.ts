import { Request, Response } from "express";
import { CompanyModel } from "../models/company.model";
import { sendSuccess, sendError } from "../utils";
import crypto from "crypto";
import {
  createSubaccount,
  getSubaccountDetails,
  updateSubAccount,
} from "../services/payment.service";
import { Company } from "../types";
import { Types } from "mongoose";

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

    // Handle file uploads
    const logoFile = (req as any).file;
    let logoData = null;

    if (logoFile) {
      // Structure logo data according to company model
      logoData = {
        path: logoFile.path,
        originalName: logoFile.originalname,
        mimetype: logoFile.mimetype,
        size: logoFile.size,
      };
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

// Get pending join requests for a company
export async function getPendingJoinRequests(req: Request, res: Response) {
  try {
    const companyId = (req.user as any)?.companyId;
    const userRole = (req.user as any)?.role;

    if (!companyId) {
      sendError(res, "Company context required", null, 400);
      return;
    }

    // Only admins can view join requests
    if (userRole !== "admin") {
      sendError(res, "Insufficient permissions", null, 403);
      return;
    }

    const JoinRequestModel = (
      await import("../models/companyJoinRequest.model")
    ).CompanyJoinRequestModel;

    const joinRequests = await JoinRequestModel.find({
      company: companyId,
      status: "pending",
    })
      .populate("user", "firstName lastName email username")
      .sort({ createdAt: -1 });

    sendSuccess(res, "Pending join requests retrieved successfully", {
      joinRequests,
    });
  } catch (e: any) {
    sendError(res, "Failed to retrieve join requests", e.message);
  }
}

// Approve or reject join request
export async function handleJoinRequestResponse(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const { action, reason } = req.body; // action: "approve" or "reject"
    const companyId = (req.user as any)?.companyId;
    const userRole = (req.user as any)?.role;

    if (!companyId || userRole !== "admin") {
      sendError(res, "Insufficient permissions", null, 403);
      return;
    }

    const JoinRequestModel = (
      await import("../models/companyJoinRequest.model")
    ).CompanyJoinRequestModel;

    const joinRequest = await JoinRequestModel.findById(requestId)
      .populate("user", "firstName lastName email")
      .populate("company", "name");

    if (!joinRequest) {
      sendError(res, "Join request not found", null, 404);
      return;
    }

    if ((joinRequest.company as any)._id.toString() !== companyId) {
      sendError(res, "Access denied", null, 403);
      return;
    }

    if (joinRequest.status !== "pending") {
      sendError(res, "Join request is not pending", null, 400);
      return;
    }

    if (action === "approve") {
      // Approve the request
      joinRequest.status = "approved";
      joinRequest.approvedBy = (req.user as any)?.id;
      joinRequest.approvedAt = new Date();
      await joinRequest.save();

      // Add user to company
      const UserModel = (await import("../models/user.model")).UserModel;
      await UserModel.findByIdAndUpdate(
        (joinRequest.user as any)._id.toString(),
        {
          company: companyId,
          role: "user", // Default role for new members
        }
      );

      sendSuccess(res, "Join request approved successfully", { joinRequest });
    } else if (action === "reject") {
      // Reject the request
      joinRequest.status = "rejected";
      joinRequest.rejectedBy = (req.user as any)?.id;
      joinRequest.rejectedAt = new Date();
      joinRequest.rejectionReason = reason || "Request rejected by admin";
      await joinRequest.save();

      sendSuccess(res, "Join request rejected successfully", { joinRequest });
    } else {
      sendError(res, "Invalid action. Use 'approve' or 'reject'", null, 400);
    }
  } catch (e: any) {
    sendError(res, "Failed to handle join request", e.message);
  }
}

// Get user's join requests
export async function getUserJoinRequests(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const JoinRequestModel = (
      await import("../models/companyJoinRequest.model")
    ).CompanyJoinRequestModel;

    const joinRequests = await JoinRequestModel.find({
      user: userId,
    })
      .populate("company", "name logo")
      .sort({ createdAt: -1 });

    sendSuccess(res, "User join requests retrieved successfully", {
      joinRequests,
    });
  } catch (e: any) {
    sendError(res, "Failed to retrieve user join requests", e.message);
  }
}

// Get company subaccount details
export async function getCompanySubaccount(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const userCompanyId = (req.user as any)?.companyId;
    const userRole = (req.user as any)?.role;

    if (
      !companyId ||
      (userCompanyId !== companyId && userRole !== "super_admin")
    ) {
      sendError(res, "Access denied", null, 403);
      return;
    }

    const company = await CompanyModel.findById(companyId)
      .select("name paystackSubaccountCode feePercent")
      .lean();

    if (!company) {
      sendError(res, "Company not found", null, 404);
      return;
    }

    // If company has Paystack subaccount code, fetch details
    let subaccountDetails = null;
    if ((company as any).paystackSubaccountCode) {
      try {
        const { getSubaccountDetails } = await import(
          "../services/payment.service"
        );
        subaccountDetails = await getSubaccountDetails(
          (company as any).paystackSubaccountCode
        );
      } catch (error) {
        console.warn("Failed to fetch Paystack subaccount details:", error);
      }
    }

    const response = {
      company: {
        name: company.name,
        paystackSubaccountCode: (company as any).paystackSubaccountCode,
        feePercent: (company as any).feePercent,
      },
      subaccountDetails,
    };

    sendSuccess(
      res,
      "Company subaccount details retrieved successfully",
      response
    );
  } catch (e: any) {
    sendError(res, "Failed to retrieve company subaccount details", e.message);
  }
}

// Update company subaccount details
export async function updateCompanySubaccount(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const { settlement_bank, account_number, description, percentage_charge } =
      req.body;
    const userCompanyId = (req.user as any)?.companyId;
    const userRole = (req.user as any)?.role;

    if (
      !companyId ||
      (userCompanyId !== companyId && userRole !== "super_admin")
    ) {
      sendError(res, "Access denied", null, 403);
      return;
    }

    const company = await CompanyModel.findById(companyId);
    if (!company) {
      sendError(res, "Company not found", null, 404);
      return;
    }

    // Create or update Paystack subaccount
    let subaccountDetails = null;
    try {
      const { updateSubAccount, createSubaccount } = await import(
        "../services/payment.service"
      );

      if ((company as any).paystackSubaccountCode) {
        // Update existing subaccount
        subaccountDetails = await updateSubAccount(
          (company as any).paystackSubaccountCode,
          {
            business_name: company.name,
            settlement_bank,
            account_number,
            description,
            percentage_charge,
          }
        );
      } else {
        // Create new subaccount
        subaccountDetails = await createSubaccount({
          business_name: company.name,
          settlement_bank,
          account_number,
          description,
          percentage_charge,
        });

        // Update company with subaccount code
        (company as any).paystackSubaccountCode =
          subaccountDetails.subaccount_code;
      }

      // Update company fee percentage
      if (percentage_charge !== undefined) {
        (company as any).feePercent = parseFloat(percentage_charge);
      }

      await company.save();

      sendSuccess(res, "Company subaccount updated successfully", {
        company: {
          name: company.name,
          paystackSubaccountCode: (company as any).paystackSubaccountCode,
          feePercent: (company as any).feePercent,
        },
        subaccountDetails: subaccountDetails.data || subaccountDetails,
      });
    } catch (error) {
      console.error("Failed to update Paystack subaccount:", error);
      sendError(res, "Failed to update Paystack subaccount", error);
    }
  } catch (e: any) {
    sendError(res, "Failed to update company subaccount", e.message);
  }
}

// Company onboarding - create company and subaccount
export async function onboardCompany(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      sendError(res, "User not authenticated", null, 401);
      return;
    }

    const {
      name,
      description,
      location,
      contactEmail,
      contactPhone,
      currency,
      settlement_bank,
      account_number,
      business_name,
      percentage_charge,
      invoiceFormat,
      registrationDocs,
    } = req.body;

    // Handle file uploads
    const logoFile = (req as any).file;
    let logoData = null;

    if (logoFile) {
      // Structure logo data according to company model
      logoData = {
        path: logoFile.path,
        originalName: logoFile.originalname,
        mimetype: logoFile.mimetype,
        size: logoFile.size,
      };
    }

    // Parse registration docs if provided
    let parsedRegistrationDocs = [];
    if (registrationDocs) {
      try {
        parsedRegistrationDocs = JSON.parse(registrationDocs);
      } catch (parseError) {
        console.warn("Failed to parse registration docs:", parseError);
      }
    }

    // Validate required fields
    if (
      !name ||
      !settlement_bank ||
      !account_number ||
      !business_name ||
      !percentage_charge
    ) {
      sendError(
        res,
        "Missing required fields: name, settlement_bank, account_number, business_name, percentage_charge",
        null,
        400
      );
      return;
    }

    // Check if user already has a company
    const existingCompany = await CompanyModel.findOne({ owner: userId });
    if (existingCompany) {
      sendError(res, "User already has a company", null, 400);
      return;
    }

    // Create Paystack subaccount
    const subaccountData = {
      business_name,
      settlement_bank,
      account_number,
      percentage_charge: parseFloat(percentage_charge),
      description: description || `Subaccount for ${business_name}`,
    };

    let subaccountCode: string;
    try {
      const subaccount = await createSubaccount(subaccountData);
      subaccountCode = subaccount.subaccount_code;
    } catch (subaccountError: any) {
      console.error("Failed to create Paystack subaccount:", subaccountError);
      sendError(
        res,
        `Failed to create Paystack subaccount: ${subaccountError.message}`,
        null,
        500
      );
      return;
    }

    // Parse invoice format if provided
    let parsedInvoiceFormat = {
      type: "prefix",
      prefix: name.substring(0, 3).toUpperCase(),
      nextNumber: 1,
      padding: 4,
    };

    if (invoiceFormat) {
      try {
        parsedInvoiceFormat = JSON.parse(invoiceFormat);
      } catch (parseError) {
        console.warn("Failed to parse invoice format:", parseError);
      }
    }

    // Create company with subaccount code and file paths
    const companyData = {
      name,
      description,
      location,
      contactEmail: contactEmail || (req.user as any)?.email,
      contactPhone,
      currency: currency || "GHS",
      owner: userId,
      isActive: true,
      paystackSubaccountCode: subaccountCode,
      feePercent: parseFloat(percentage_charge),
      logo: logoData,
      registrationDocs: parsedRegistrationDocs,
      invoiceFormat: parsedInvoiceFormat,
      subscription: {
        plan: "free_trial",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        status: "active",
        hasUsedTrial: false,
        isTrial: true,
      },
    };

    const company = new CompanyModel(companyData);
    await company.save();

    // Update user's company field

    // Create admin company role for the user
    const CompanyRoleModel = (await import("../models/companyRole.model"))
      .CompanyRoleModel;
    const adminRole = new CompanyRoleModel({
      company: company._id,
      name: "Admin",
      permissions: {
        viewInvoices: true,
        accessFinancials: true,
        viewBookings: true,
        viewInventory: true,
        createRecords: true,
        editRecords: true,
        manageUsers: true,
        manageFacilities: true,
        manageInventory: true,
        manageTransactions: true,
        manageEmails: true,
        manageSettings: true,
      },
    });
    await adminRole.save();

    const UserModel = (await import("../models/user.model")).UserModel;
    await UserModel.findByIdAndUpdate(userId, {
      company: company._id,
      companyRole: adminRole._id,
      role: "admin",
    });

    sendSuccess(res, "Company onboarded successfully", {
      company: {
        id: company._id,
        name: company.name,
        paystackSubaccountCode: company.paystackSubaccountCode,
        feePercent: company.feePercent,
        logo: company.logo,
        registrationDocs: company.registrationDocs,
      },
      subaccount: {
        code: subaccountCode,
        business_name,
        settlement_bank,
        account_number,
        percentage_charge,
      },
      userRole: {
        role: "admin",
        permissions: {
          viewInvoices: true,
          accessFinancials: true,
          viewBookings: true,
          viewInventory: true,
          createRecords: true,
          editRecords: true,
          manageUsers: true,
          manageFacilities: true,
          manageInventory: true,
          manageTransactions: true,
          manageEmails: true,
          manageSettings: true,
        },
        isActive: true,
      },
    });
  } catch (error: any) {
    console.error("Company onboarding error:", error);
    console.error("Error stack:", error.stack);
    console.error("Request body:", req.body);
    console.error("Request file:", (req as any).file);
    sendError(res, "Failed to onboard company", error.message);
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
  getPendingJoinRequests,
  handleJoinRequestResponse,
  getUserJoinRequests,
  getCompanySubaccount,
  updateCompanySubaccount,
  onboardCompany,
};
