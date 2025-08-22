import { Request, Response } from "express";
import { SupportTicketModel } from "../models/supportTicket.model";
import { SupportMessageModel } from "../models/supportMessage.model";
import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { sendError, sendSuccess } from "../utils";

export class SupportController {
  // Create a new support ticket
  static async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, category, priority, companyId: requestedCompanyId } = req.body;
      const userId = (req.user as any)?.id;
      const userCompanyId = (req.user as any)?.companyId;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;
      const files = (req as any).files;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      // Determine which company the ticket belongs to
      let targetCompanyId = requestedCompanyId;
      
      // If user is admin/staff/super admin, they can create tickets for their company
      if (["admin", "staff"].includes(userRole) || isSuperAdmin) {
        targetCompanyId = userCompanyId;
      } else if (!requestedCompanyId) {
        // Normal users must specify which company they're creating a ticket for
        sendError(res, "Company ID is required for support tickets", null, 400);
        return;
      }

      const ticketData = {
        title,
        description,
        category: category || "general",
        priority: priority || "medium",
        company: targetCompanyId,
        user: userId,
      };

      const ticket = new SupportTicketModel(ticketData);
      await ticket.save();

      // Create initial system message
      const systemMessage = new SupportMessageModel({
        ticket: ticket._id,
        sender: userId,
        senderType: "system",
        message: `Support ticket ${ticket.ticketNumber} has been created. A staff member will respond shortly.`,
      });
      await systemMessage.save();

      // If files were uploaded, create a message with attachments
      if (files && files.length > 0) {
        const attachmentPaths = files.map((file: any) => file.path);
        const attachmentMessage = new SupportMessageModel({
          ticket: ticket._id,
          sender: userId,
          senderType: "user",
          message: "Initial ticket with attachments",
          messageType: "file",
          attachments: attachmentPaths,
        });
        await attachmentMessage.save();
      }

      // Populate user and company details
      await ticket.populate([
        { path: "user", select: "username email firstName lastName" },
        { path: "company", select: "name" },
      ]);

      sendSuccess(res, "Support ticket created successfully", ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      sendError(res, "Failed to create support ticket", error);
    }
  }

  // Get all tickets for a user
  static async getUserTickets(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      const userCompanyId = (req.user as any)?.companyId;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      let query: any = { user: userId, isDeleted: false };

      // If user is admin/staff/super admin, show tickets from their company
      if (["admin", "staff"].includes(userRole) || isSuperAdmin) {
        if (userCompanyId) {
          query.company = userCompanyId;
        }
      } else {
        // Normal users can see tickets they created for any company
        // No company filter needed
      }

      const tickets = await SupportTicketModel.find(query)
        .populate("company", "name")
        .populate("assignedTo", "username firstName lastName")
        .sort({ updatedAt: -1 });

      sendSuccess(res, "Tickets retrieved successfully", tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      sendError(res, "Failed to fetch tickets", error);
    }
  }

  // Get all tickets for staff (admin/staff roles)
  static async getStaffTickets(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      const userCompanyId = (req.user as any)?.companyId;
      const userRole = (req.user as any)?.role;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      // Check if user has staff role
      if (!["admin", "staff"].includes(userRole)) {
        sendError(res, "Insufficient permissions", null, 403);
        return;
      }

      let query: any = { isDeleted: false };

      // If staff has a company, show tickets from their company
      if (userCompanyId) {
        query.company = userCompanyId;
      }

      const tickets = await SupportTicketModel.find(query)
        .populate("user", "username firstName lastName email")
        .populate("company", "name")
        .populate("assignedTo", "username firstName lastName")
        .sort({ updatedAt: -1 });

      sendSuccess(res, "Tickets retrieved successfully", tickets);
    } catch (error) {
      console.error("Error fetching staff tickets:", error);
      sendError(res, "Failed to fetch tickets", error);
    }
  }

  // Get all tickets for super admin (Taurean IT)
  static async getSuperAdminTickets(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!isSuperAdmin) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      const tickets = await SupportTicketModel.find({
        isDeleted: false,
      })
        .populate("user", "username firstName lastName email")
        .populate("company", "name")
        .populate("assignedTo", "username firstName lastName")
        .sort({ updatedAt: -1 });

      sendSuccess(res, "Tickets retrieved successfully", tickets);
    } catch (error) {
      console.error("Error fetching super admin tickets:", error);
      sendError(res, "Failed to fetch tickets", error);
    }
  }

  // Get ticket details with messages
  static async getTicketDetails(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const userId = (req.user as any)?.id;
      const companyId = (req.user as any)?.companyId;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      const ticket = await SupportTicketModel.findOne({
        _id: ticketId,
        isDeleted: false,
      }).populate([
        { path: "user", select: "username firstName lastName email" },
        { path: "company", select: "name" },
        { path: "assignedTo", select: "username firstName lastName" },
      ]);

      if (!ticket) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check access permissions
      const canAccess =
        isSuperAdmin ||
        ticket.company._id.toString() === companyId ||
        ticket.user._id.toString() === userId ||
        ticket.assignedTo?._id.toString() === userId;

      if (!canAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Get messages
      const messages = await SupportMessageModel.find({
        ticket: ticketId,
        isDeleted: false,
      })
        .populate("sender", "username firstName lastName")
        .sort({ createdAt: 1 });

      // Mark messages as read for the current user
      const unreadMessages = messages.filter(
        (msg) => !msg.readBy.includes(userId as any)
      );

      if (unreadMessages.length > 0) {
        await SupportMessageModel.updateMany(
          { _id: { $in: unreadMessages.map((msg) => msg._id) } },
          { $addToSet: { readBy: userId } }
        );
      }

      sendSuccess(res, "Ticket details retrieved successfully", {
        ticket,
        messages,
      });
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      sendError(res, "Failed to fetch ticket details", error);
    }
  }

  // Send a message to a ticket
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const { message, messageType = "text" } = req.body;
      const userId = (req.user as any)?.id;
      const companyId = (req.user as any)?.companyId;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;
      const files = (req as any).files;

      if (!userId || !message) {
        sendError(res, "Missing required fields", null, 400);
        return;
      }

      // Verify ticket exists and user has access
      const ticket = await SupportTicketModel.findOne({
        _id: ticketId,
        isDeleted: false,
      });

      if (!ticket) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check access permissions
      const canAccess =
        isSuperAdmin ||
        ticket.company.toString() === companyId ||
        ticket.user.toString() === userId ||
        ticket.assignedTo?.toString() === userId;

      if (!canAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Determine sender type
      const user = await UserModel.findById(userId);
      const senderType =
        user?.isSuperAdmin || ["admin", "staff"].includes(user?.role || "")
          ? "staff"
          : "user";

      // Determine message type based on content and files
      let finalMessageType = messageType;
      let attachments: string[] | undefined;

      if (files && files.length > 0) {
        finalMessageType = "file";
        attachments = files.map((file: any) => file.path);
      }

      const messageData = {
        ticket: ticketId,
        sender: userId,
        senderType,
        message,
        messageType: finalMessageType,
        attachments,
      };

      const newMessage = new SupportMessageModel(messageData);
      await newMessage.save();

      // Update ticket status if it was closed and a new message is sent
      if (ticket.status === "closed") {
        ticket.status = "open";
        await ticket.save();
      }

      // Update ticket updatedAt
      ticket.updatedAt = new Date();
      await ticket.save();

      // Populate sender details
      await newMessage.populate("sender", "username firstName lastName");

      sendSuccess(res, "Message sent successfully", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      sendError(res, "Failed to send message", error);
    }
  }

  // Update ticket status
  static async updateTicketStatus(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const { status, assignedTo } = req.body;
      const userId = (req.user as any)?.id;
      const companyId = (req.user as any)?.companyId;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      const ticket = await SupportTicketModel.findOne({
        _id: ticketId,
        isDeleted: false,
      });

      if (!ticket) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check permissions
      const canUpdate = isSuperAdmin || ticket.company.toString() === companyId;

      if (!canUpdate) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Update ticket
      const updateData: any = { status };

      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }

      if (status === "resolved") {
        updateData.resolvedAt = new Date();
      } else if (status === "closed") {
        updateData.closedAt = new Date();
      }

      const updatedTicket = await SupportTicketModel.findByIdAndUpdate(
        ticketId,
        updateData,
        { new: true }
      ).populate([
        { path: "user", select: "username firstName lastName email" },
        { path: "company", select: "name" },
        { path: "assignedTo", select: "username firstName lastName" },
      ]);

      // Create system message for status change
      const systemMessage = new SupportMessageModel({
        ticket: ticketId,
        sender: userId,
        senderType: "system",
        message: `Ticket status updated to ${status}${
          assignedTo ? ` and assigned to staff` : ""
        }.`,
      });
      await systemMessage.save();

      sendSuccess(res, "Ticket updated successfully", updatedTicket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      sendError(res, "Failed to update ticket", error);
    }
  }

  // Get available staff for assignment
  static async getAvailableStaff(req: Request, res: Response): Promise<void> {
    try {
      const companyId = (req.user as any)?.companyId;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!companyId && !isSuperAdmin) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      let query: any = { isDeleted: false };

      if (!isSuperAdmin) {
        query.company = companyId;
      }

      const staff = await UserModel.find({
        ...query,
        role: { $in: ["admin", "staff"] },
      }).select("username firstName lastName email role");

      sendSuccess(res, "Staff retrieved successfully", staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      sendError(res, "Failed to fetch staff", error);
    }
  }
}
