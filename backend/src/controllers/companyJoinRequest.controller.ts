import { Request, Response } from "express";
import { CompanyJoinRequestService } from "../services/companyJoinRequest.service";
import { sendError, sendSuccess } from "../utils/response.util";

export class CompanyJoinRequestController {
  // User requests to join a company
  static async requestToJoinCompany(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { companyId } = req.body;
      const userId = (req.user as any)?.id;

      if (!companyId) {
        sendError(res, "Company ID is required", null, 400);
        return;
      }

      const request = await CompanyJoinRequestService.createRequest(
        userId,
        companyId,
        userId
      );

      sendSuccess(res, "Join request created successfully", { request });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Admin invites user to company
  static async inviteUserToCompany(req: Request, res: Response): Promise<void> {
    try {
      const { userId, companyId } = req.body;
      const adminId = (req.user as any)?.id;

      if (!userId || !companyId) {
        sendError(res, "User ID and Company ID are required", null, 400);
        return;
      }

      const request = await CompanyJoinRequestService.inviteUserToCompany(
        userId,
        companyId,
        adminId
      );

      sendSuccess(res, "User invited to company successfully", { request });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Approve join request
  static async approveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;
      const adminId = (req.user as any)?.id;

      const request = await CompanyJoinRequestService.approveRequest(
        requestId,
        adminId,
        notes
      );

      sendSuccess(res, "Join request approved successfully", { request });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Reject join request
  static async rejectRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;
      const adminId = (req.user as any)?.id;

      const request = await CompanyJoinRequestService.rejectRequest(
        requestId,
        adminId,
        notes
      );

      sendSuccess(res, "Join request rejected successfully", { request });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get company pending requests
  static async getCompanyPendingRequests(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const companyId = (req.user as any)?.company;
      if (!companyId) {
        sendError(res, "User not associated with any company", null, 403);
        return;
      }

      const requests =
        await CompanyJoinRequestService.getCompanyPendingRequests(companyId);

      sendSuccess(res, "Pending requests retrieved successfully", { requests });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get user's join requests
  static async getUserJoinRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;

      const requests = await CompanyJoinRequestService.getUserJoinRequests(
        userId
      );

      sendSuccess(res, "User join requests retrieved successfully", {
        requests,
      });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Get all pending requests (super admin)
  static async getAllPendingRequests(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requests = await CompanyJoinRequestService.getAllPendingRequests();

      sendSuccess(res, "All pending requests retrieved successfully", {
        requests,
      });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // Remove user from company
  static async removeUserFromCompany(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const adminId = (req.user as any)?.id;

      const user = await CompanyJoinRequestService.removeUserFromCompany(
        userId,
        adminId
      );

      sendSuccess(res, "User removed from company successfully", { user });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }
}
