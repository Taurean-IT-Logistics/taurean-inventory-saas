import { Router, Request, Response } from "express";
import { CompanyModel, CompanyRoleModel } from "../models";
import { sendSuccess, sendError } from "../utils";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares/auth.middleware";
import * as CompanyController from "../controllers/company.controller";

const router = Router();

// Public onboarding
router.post("/onboard", async (req: Request, res: Response) => {
  try {
    const { name, logoUrl, registrationDocs, location, contactEmail, contactPhone, invoiceFormat, currency } = req.body;
    if (!name) return sendError(res, "Company name is required", null, 400);
    const company = await CompanyModel.create({
      name,
      logoUrl,
      registrationDocs,
      location,
      contactEmail,
      contactPhone,
      invoiceFormat,
      currency,
      isActive: true,
    } as any);
    // Default roles
    await CompanyRoleModel.create([
      { company: company._id, name: "Admin", permissions: { viewInvoices: true, accessFinancials: true, viewBookings: true, viewInventory: true, createRecords: true, editRecords: true, manageUsers: true, manageFacilities: true, manageInventory: true, manageTransactions: true } },
      { company: company._id, name: "Staff", permissions: { viewInvoices: false, accessFinancials: false, viewBookings: true, viewInventory: true, createRecords: true, editRecords: true } },
      { company: company._id, name: "User", permissions: { viewBookings: true, viewInventory: true } },
    ] as any);

    return sendSuccess(res, "Company onboarded", { company }, 201);
  } catch (e: any) {
    return sendError(res, "Onboarding failed", e.message);
  }
});

// Public pricing
router.get("/pricing", CompanyController.pricing);

// Super admin: activate and renew subscriptions
router.post("/subscription/activate", AuthMiddleware, CompanyController.activateSubscription);
router.post("/subscription/renew", AuthMiddleware, CompanyController.renewSubscription);

// Super admin: update payout config (paystack subaccount, feePercent)
router.post("/payout-config", AuthMiddleware, CompanyController.updatePayoutConfig);

export default router;