import { Router, Request, Response } from "express";
import { CompanyModel, CompanyRoleModel, UserModel } from "../models";
import { sendSuccess, sendError } from "../utils";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares/auth.middleware";
import { storage, fileFilter } from "../middlewares";
import * as CompanyController from "../controllers/company.controller";
import { PaymentService } from "../services";
import multer from "multer";

const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
};

const router = Router();

// Public companies endpoint - accessible to everyone
router.get("/public", CompanyController.getPublicCompanies);

// Public pricing
router.get("/pricing", CompanyController.pricing);

// Join request route - users can request to join a company
router.post(
  "/:companyId/join-request",
  AuthMiddleware,
  CompanyController.handleJoinRequest
);

// All routes below require authentication
router.use(AuthMiddleware);

// Public onboarding
router.post(
  "/onboard",
  multer(uploadConfig).single("file"),
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        registrationDocs,
        location,
        contactEmail,
        contactPhone,
        invoiceFormat,
        currency,
        settlement_bank,
        account_number,
        description,
        percentage_charge,
      } = req.body;

      const logo = req.file;

      let imageData;

      if (logo) {
        imageData = {
          path: logo.path,
          originalName: logo.originalname,
          mimetype: logo.mimetype,
          size: logo.size,
        };
      }

      if (!name) {
        sendError(res, "Company name is required", null, 400);
        return;
      }

      const company = await CompanyModel.create({
        name,
        logo: imageData,
        registrationDocs,
        location,
        contactEmail,
        contactPhone,
        invoiceFormat,
        currency,
        owner: req.user?.id,
        isActive: false,
      } as any);

      const companyRoleDoc = await CompanyRoleModel.create(
        [
          {
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
            },
          },
          {
            company: company._id,
            name: "Staff",
            permissions: {
              viewInvoices: false,
              accessFinancials: false,
              viewBookings: true,
              viewInventory: true,
              createRecords: true,
              editRecords: true,
            },
          },
          {
            company: company._id,
            name: "User",
            permissions: { viewBookings: true, viewInventory: true },
          },
        ] as any,
        { new: true }
      );

      const companyRole = companyRoleDoc.find(
        (role: any) => role.name === "Admin"
      );
      if (!companyRole) {
        sendError(res, "Admin role not found for company", null, 500);
        return;
      }

      await UserModel.updateOne(
        { _id: req.user?.id },
        {
          $set: {
            company: company._id,
            companyRole: companyRole._id,
            role: "admin",
          },
        }
      );

      const subaccount = await PaymentService.createSubaccount({
        business_name: company.name,
        settlement_bank: settlement_bank,
        account_number: account_number,
        description: description,
        percentage_charge: percentage_charge,
      });

      sendSuccess(res, "Company onboarded", { company, subaccount }, 201);
    } catch (e: any) {
      sendError(res, "Onboarding failed", e.message);
    }
  }
);

// Get all companies (for admin/selector use)
router.get("/", AuthMiddleware, CompanyController.getAllCompanies);

// Super admin: activate and renew subscriptions
router.post(
  "/subscription/activate",
  AuthMiddleware,
  CompanyController.activateSubscription
);
router.post(
  "/subscription/renew",
  AuthMiddleware,
  CompanyController.renewSubscription
);

// Super admin: update payout config (paystack subaccount, feePercent)
router.post(
  "/payout-config",
  AuthMiddleware,
  CompanyController.updatePayoutConfig
);

// Company update route with file upload support
router.put(
  "/:companyId",
  AuthMiddleware,
  multer(uploadConfig).single("file"), // Allow only 1 image
  CompanyController.updateCompany
);

export default router;
