import express from "express";
import { CompanyController } from "../controllers/company.controller";
import {
  AuthMiddleware,
  RequireActiveCompany,
} from "../middlewares/auth.middleware";
import { AuthorizeRoles } from "../middlewares/auth.middleware";
import { fileFilter, storage } from "../middlewares";
import multer from "multer";

const router = express.Router();

// Ensure uploads directory exists
const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
};

// Public routes (no authentication required)
router.get("/public", CompanyController.getPublicCompanies);
router.get("/pricing", CompanyController.pricing);

// Protected routes
router.use(AuthMiddleware);

// Company onboarding route
router.post(
  "/onboard",
  multer(uploadConfig).single("file"),
  CompanyController.onboardCompany
);

// Company management routes
router.put(
  "/:companyId",
  multer(uploadConfig).single("file"),
  RequireActiveCompany(),
  CompanyController.updateCompany
);
router.post("/:companyId/join-request", CompanyController.handleJoinRequest);
router.get("/join-requests/pending", CompanyController.getPendingJoinRequests);
router.post(
  "/join-requests/:requestId/respond",
  CompanyController.handleJoinRequestResponse
);
router.get("/join-requests/user", CompanyController.getUserJoinRequests);

// Super admin only routes
router.get(
  "/all",
  AuthorizeRoles("super_admin"),
  CompanyController.getAllCompanies
);
router.post(
  "/activate-subscription",
  AuthorizeRoles("super_admin"),
  CompanyController.activateSubscription
);
router.post(
  "/renew-subscription",
  AuthorizeRoles("super_admin"),
  CompanyController.renewSubscription
);
router.put(
  "/payout-config",
  AuthorizeRoles("super_admin"),
  CompanyController.updatePayoutConfig
);

export default router;
