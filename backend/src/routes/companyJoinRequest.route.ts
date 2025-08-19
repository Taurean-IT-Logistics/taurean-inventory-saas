import { Router } from "express";
import { CompanyJoinRequestController } from "../controllers/companyJoinRequest.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RequireActiveCompany } from "../middlewares/auth.middleware";

const router = Router();

// User routes
router.post(
  "/request",
  AuthMiddleware,
  CompanyJoinRequestController.requestToJoinCompany
);
router.get(
  "/user",
  AuthMiddleware,
  CompanyJoinRequestController.getUserJoinRequests
);

// Company admin routes
router.post(
  "/invite",
  AuthMiddleware,
  RequireActiveCompany(),
  CompanyJoinRequestController.inviteUserToCompany
);
router.get(
  "/company/pending",
  AuthMiddleware,
  RequireActiveCompany(),
  CompanyJoinRequestController.getCompanyPendingRequests
);
router.patch(
  "/:requestId/approve",
  AuthMiddleware,
  RequireActiveCompany(),
  CompanyJoinRequestController.approveRequest
);
router.patch(
  "/:requestId/reject",
  AuthMiddleware,
  RequireActiveCompany(),
  CompanyJoinRequestController.rejectRequest
);
router.delete(
  "/user/:userId",
  AuthMiddleware,
  RequireActiveCompany(),
  CompanyJoinRequestController.removeUserFromCompany
);

// Super admin routes
router.get(
  "/all/pending",
  AuthMiddleware,
  CompanyJoinRequestController.getAllPendingRequests
);

export default router;
