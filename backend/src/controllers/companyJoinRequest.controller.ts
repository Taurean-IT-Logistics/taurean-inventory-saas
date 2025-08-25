import { Request, Response } from "express";
import { CompanyJoinRequestService } from "../services/companyJoinRequest.service";
import { sendError, sendSuccess } from "../utils/response.util";
import { UserService } from "../services";

export class CompanyJoinRequestController {
  // User requests to join a company
  static async requestToJoinCompany(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const companyId = req.body?.companyId;
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
      const email = req.body?.email;
      const companyId = req.body?.companyId;
      const adminId = (req.user as any)?.id;

      if (!email || !companyId) {
        sendError(res, "Email and Company ID are required", null, 400);
        return;
      }

      const user = await UserService.getUserByIdentifier(email);

      if (!user) {
        sendError(res, "User not found", null, 404);
        return;
      }

      const userId = user._id.toString();

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
      const notes = req.body?.notes || "";
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
      const notes = req.body?.notes || "";
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
      const user = req.user as any;
      let requests;

      // If user has company context, get company-specific requests
      if (user.companyId) {
        requests = await CompanyJoinRequestService.getCompanyPendingRequests(
          user.companyId
        );
        sendSuccess(res, "Company pending requests retrieved successfully", {
          requests,
        });
      }
      // If user is super admin, get all pending requests
      else if (user.isSuperAdmin) {
        requests = await CompanyJoinRequestService.getAllPendingRequests();
        sendSuccess(res, "All pending requests retrieved successfully", {
          requests,
        });
      }
      // Otherwise, user needs company association
      else {
        sendError(res, "User not associated with any company", null, 403);
        return;
      }
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

  // User cancels their own join request
  static async cancelJoinRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const userId = (req.user as any)?.id;

      const result = await CompanyJoinRequestService.cancelJoinRequest(
        requestId,
        userId
      );

      sendSuccess(res, "Join request cancelled successfully", { result });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // User accepts invitation to join company
  static async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const userId = (req.user as any)?.id;

      const result = await CompanyJoinRequestService.acceptInvitation(
        requestId,
        userId
      );

      sendSuccess(res, "Invitation accepted successfully", { result });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }

  // User declines invitation to join company
  static async declineInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const userId = (req.user as any)?.id;

      const result = await CompanyJoinRequestService.declineInvitation(
        requestId,
        userId
      );

      sendSuccess(res, "Invitation declined successfully", { result });
    } catch (error: any) {
      sendError(res, error.message, null, 400);
    }
  }
}
