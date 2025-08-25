import { Router } from "express";
import { CompanyJoinRequestController } from "../controllers/companyJoinRequest.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RequireActiveCompany } from "../middlewares/auth.middleware";
import { RequireCompanyContext } from "../middlewares/auth.middleware";

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
router.delete(
  "/:requestId/cancel",
  AuthMiddleware,
  CompanyJoinRequestController.cancelJoinRequest
);
router.patch(
  "/:requestId/accept",
  AuthMiddleware,
  CompanyJoinRequestController.acceptInvitation
);
router.patch(
  "/:requestId/decline",
  AuthMiddleware,
  CompanyJoinRequestController.declineInvitation
);

// Company admin routes
router.post(
  "/invite",
  AuthMiddleware,
  RequireCompanyContext(),
  CompanyJoinRequestController.inviteUserToCompany
);

// Get company pending requests - flexible for both company admins and super admins
router.get(
  "/company/pending",
  AuthMiddleware,
  CompanyJoinRequestController.getCompanyPendingRequests
);

router.patch(
  "/:requestId/approve",
  AuthMiddleware,
  RequireCompanyContext(),
  CompanyJoinRequestController.approveRequest
);
router.patch(
  "/:requestId/reject",
  AuthMiddleware,
  RequireCompanyContext(),
  CompanyJoinRequestController.rejectRequest
);
router.delete(
  "/user/:userId",
  AuthMiddleware,
  RequireCompanyContext(),
  CompanyJoinRequestController.removeUserFromCompany
);

// Super admin routes
router.get(
  "/all/pending",
  AuthMiddleware,
  CompanyJoinRequestController.getAllPendingRequests
);

export default router;
