import {
  CompanyJoinRequestModel,
  ICompanyJoinRequest,
} from "../models/companyJoinRequest.model";
import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { CompanyRoleService } from "./companyRole.service";
import { sendError, sendSuccess } from "../utils/response.util";
import { Types } from "mongoose";

export class CompanyJoinRequestService {
  // Check if user can join a company and clean up existing requests
  static async canUserJoinCompany(userId: string, companyId: string) {
    try {
      // Check if user is already in a company
      const existingUser = await UserModel.findById(userId);
      if (existingUser?.company) {
        return {
          canJoin: false,
          reason: "User is already assigned to a company",
        };
      }

      // Clean up any existing join requests by this user
      await CompanyJoinRequestModel.deleteMany({
        user: userId,
      });

      return {
        canJoin: true,
        reason: "User can join company",
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Create a join request
  static async createRequest(
    userId: string,
    companyId: string,
    message?: string
  ) {
    try {
      // Check if user can join and clean up existing requests
      const canJoin = await this.canUserJoinCompany(userId, companyId);
      if (!canJoin.canJoin) {
        throw new Error(canJoin.reason);
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
      // Check if user can join and clean up existing requests
      const canJoin = await this.canUserJoinCompany(userId, companyId);
      if (!canJoin.canJoin) {
        throw new Error(canJoin.reason);
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

      // Get or create default staff role for the company
      const staffRole = await CompanyRoleService.getOrCreateDefaultStaffRole(
        request.company.toString()
      );

      // Assign user to company with staff role
      await UserModel.findByIdAndUpdate(request.user, {
        company: request.company,
        role: "staff", // Default role when joining - staff has basic company access
        companyRole: staffRole._id, // Assign the default staff role
      });

      // Delete all other join requests by this user since they can only be in one company
      await CompanyJoinRequestModel.deleteMany({
        user: request.user,
        _id: { $ne: request._id }, // Exclude the current approved request
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

      // Clean up any other pending join requests by this user for this company
      // This allows them to try joining other companies
      await CompanyJoinRequestModel.deleteMany({
        user: request.user,
        company: request.company,
        _id: { $ne: request._id }, // Exclude the current rejected request
      });

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

  // User cancels their own join request
  static async cancelJoinRequest(requestId: string, userId: string) {
    try {
      const request = await CompanyJoinRequestModel.findById(requestId);
      if (!request) {
        throw new Error("Join request not found");
      }

      if (request.user.toString() !== userId) {
        throw new Error("User can only cancel their own join request");
      }

      if (request.status !== "pending") {
        throw new Error("Can only cancel pending requests");
      }

      // Delete the request
      await CompanyJoinRequestModel.findByIdAndDelete(requestId);

      return { message: "Join request cancelled successfully" };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get all join requests for a user across all companies
  static async getUserAllJoinRequests(userId: string) {
    try {
      const requests = await CompanyJoinRequestModel.find({
        user: userId,
      })
        .populate("company", "name description")
        .populate("approvedBy", "name email")
        .populate("rejectedBy", "name email")
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

  // User voluntarily leaves company
  static async userLeavesCompany(userId: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.company) {
        throw new Error("User is not assigned to any company");
      }

      const companyId = user.company;

      // Remove user from company
      user.company = undefined;
      user.companyRole = undefined;
      user.role = "user"; // Reset to default role
      await user.save();

      // Clean up any existing join requests for this user so they can potentially rejoin
      await CompanyJoinRequestModel.deleteMany({
        user: userId,
        company: companyId,
      });

      return user;
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

      // Store company ID before clearing it
      const companyId = user.company;

      // Remove user from company
      user.company = undefined;
      user.companyRole = undefined;
      user.role = "user"; // Reset to default role
      await user.save();

      // Clean up any existing join requests for this user so they can potentially rejoin
      await CompanyJoinRequestModel.deleteMany({
        user: userId,
        company: companyId,
      });

      // Update any pending requests to rejected
      await CompanyJoinRequestModel.updateMany(
        {
          user: userId,
          company: companyId,
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

  // User accepts invitation to join company
  static async acceptInvitation(requestId: string, acceptedBy: string) {
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
      request.approvedBy = acceptedBy as any;
      request.approvedAt = new Date();
      await request.save();

      // Get or create default staff role for the company
      const staffRole = await CompanyRoleService.getOrCreateDefaultStaffRole(
        request.company.toString()
      );

      // Assign user to company with staff role
      await UserModel.findByIdAndUpdate(request.user, {
        company: request.company,
        role: "staff", // Default role when joining - staff has basic company access
        companyRole: staffRole._id, // Assign the default staff role
      });

      // Delete all other join requests by this user since they can only be in one company
      await CompanyJoinRequestModel.deleteMany({
        user: request.user,
        _id: { $ne: request._id },
      });

      return request;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // User declines invitation to join company
  static async declineInvitation(requestId: string, declinedBy: string) {
    try {
      const request = await CompanyJoinRequestModel.findById(requestId);
      if (!request) {
        throw new Error("Join request not found");
      }

      if (request.status !== "pending") {
        throw new Error("Request is not pending");
      }

      // Update request status to rejected
      request.status = "rejected";
      request.rejectedBy = declinedBy as any;
      request.rejectedAt = new Date();
      await request.save();

      return request;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
