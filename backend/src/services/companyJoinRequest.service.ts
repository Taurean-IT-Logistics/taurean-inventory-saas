import {
  CompanyJoinRequestModel,
  ICompanyJoinRequest,
} from "../models/companyJoinRequest.model";
import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { sendError, sendSuccess } from "../utils/response.util";
import { Types } from "mongoose";

export class CompanyJoinRequestService {
  // Create a join request
  static async createRequest(
    userId: string,
    companyId: string,
    message?: string
  ) {
    try {
      // Check if user is already in a company
      const existingUser = await UserModel.findById(userId);
      if (existingUser?.company) {
        throw new Error("User is already assigned to a company");
      }

      // Check if request already exists
      const existingRequest = await CompanyJoinRequestModel.findOne({
        user: userId,
        company: companyId,
        status: { $in: ["pending", "approved"] },
      });

      if (existingRequest) {
        throw new Error(
          "Join request already exists for this user and company"
        );
      }

      const request = await CompanyJoinRequestModel.create({
        user: userId,
        company: companyId,
        message: message || "User requests to join company",
        status: "pending",
      });

      return request;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Admin invites user to company
  static async inviteUserToCompany(
    userId: string,
    companyId: string,
    invitedBy: string
  ) {
    try {
      // Check if user is already in a company
      const existingUser = await UserModel.findById(userId);
      if (existingUser?.company) {
        throw new Error("User is already assigned to a company");
      }

      // Check if request already exists
      const existingRequest = await CompanyJoinRequestModel.findOne({
        user: userId,
        company: companyId,
        status: { $in: ["pending", "approved"] },
      });

      if (existingRequest) {
        throw new Error(
          "Join request already exists for this user and company"
        );
      }

      const request = await CompanyJoinRequestModel.create({
        user: userId,
        company: companyId,
        message: `Invited by ${invitedBy}`,
        status: "pending",
      });

      return request;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Approve join request
  static async approveRequest(
    requestId: string,
    approvedBy: string,
    notes?: string
  ) {
    try {
      const request = await CompanyJoinRequestModel.findById(requestId);
      if (!request) {
        throw new Error("Join request not found");
      }

      if (request.status !== "pending") {
        throw new Error("Request is not pending");
      }

      // Update request status
      request.status = "approved";
      request.approvedBy = approvedBy as any;
      request.approvedAt = new Date();
      await request.save();

      // Assign user to company
      await UserModel.findByIdAndUpdate(request.user, {
        company: request.company,
        role: "user", // Default role when joining
      });

      return request;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Reject join request
  static async rejectRequest(
    requestId: string,
    rejectedBy: string,
    notes?: string
  ) {
    try {
      const request = await CompanyJoinRequestModel.findById(requestId);
      if (!request) {
        throw new Error("Join request not found");
      }

      if (request.status !== "pending") {
        throw new Error("Request is not pending");
      }

      request.status = "rejected";
      request.rejectedBy = rejectedBy as any;
      request.rejectedAt = new Date();
      if (notes) request.rejectionReason = notes;
      await request.save();

      return request;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get pending requests for a company
  static async getCompanyPendingRequests(companyId: string) {
    try {
      const requests = await CompanyJoinRequestModel.find({
        company: companyId,
        status: "pending",
      })
        .populate("user", "name email username")
        .sort({ createdAt: -1 });

      return requests;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get user's join requests
  static async getUserJoinRequests(userId: string) {
    try {
      const requests = await CompanyJoinRequestModel.find({
        user: userId,
      })
        .populate("company", "name description")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 });

      return requests;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get all pending requests (for super admin)
  static async getAllPendingRequests() {
    try {
      const requests = await CompanyJoinRequestModel.find({
        status: "pending",
      })
        .populate("user", "name email username")
        .populate("company", "name description")
        .sort({ createdAt: -1 });

      return requests;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Remove user from company
  static async removeUserFromCompany(userId: string, removedBy: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.company) {
        throw new Error("User is not assigned to any company");
      }

      // Remove user from company
      user.company = undefined;
      user.companyRole = undefined;
      user.role = "user"; // Reset to default role
      await user.save();

      // Update any pending requests to rejected
      await CompanyJoinRequestModel.updateMany(
        {
          user: userId,
          company: user.company,
          status: "pending",
        },
        {
          status: "rejected",
          approvedBy: removedBy,
          approvedAt: new Date(),
          notes: "User removed from company",
        }
      );

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
