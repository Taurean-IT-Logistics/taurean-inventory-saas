import { Request, Response } from "express";
import { SupportTicketModel } from "../models/supportTicket.model";
import { SupportMessageModel } from "../models/supportMessage.model";
import { UserModel } from "../models/user.model";
import { CompanyModel } from "../models/company.model";
import { sendError, sendSuccess } from "../utils";
import { emailService } from "../services/email.service";
import { emitToTicket } from "../realtime/socket";
import { isValidObjectId } from "mongoose";

export class SupportController {
  // Create a new support ticket
  static async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        category,
        priority,
        ticketType,
        companyId: requestedCompanyId,
      } = req.body;
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

      // If ticketType is "general", no company should be assigned
      if (ticketType === "general") {
        targetCompanyId = null;
      } else if (ticketType === "company") {
        // If user is admin/staff, they can create tickets for their company
        if (["admin", "staff"].includes(userRole) && userCompanyId) {
          targetCompanyId = userCompanyId;
        }

        // For regular users:
        // - If they specify a company, use that company
        // - If they don't specify a company, use their company as default
        if (!targetCompanyId && userCompanyId) {
          targetCompanyId = userCompanyId;
        }

        // Super admins can create tickets for any company
        if (isSuperAdmin && !targetCompanyId) {
          sendError(
            res,
            "Company ID is required for company-specific support tickets",
            null,
            400
          );
          return;
        }
      }

      // If a company is specified, verify it exists
      if (targetCompanyId) {
        const company = await CompanyModel.findById(targetCompanyId);
        if (!company) {
          sendError(res, "Company not found", null, 404);
          return;
        }
      }

      const ticketData = {
        title,
        description,
        category: category || "general",
        priority: priority || "medium",
        company: targetCompanyId, // Can be null for general tickets
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
        messageType: "text",
        isRead: false,
        readBy: [],
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
          isRead: false,
          readBy: [],
        });
        await attachmentMessage.save();
      }

      // Populate user and company details
      await ticket.populate([
        { path: "user", select: "username email firstName lastName" },
        { path: "company", select: "name" },
      ]);

      // Send email notifications
      try {
        if (targetCompanyId) {
          // Send notification to company admins/staff
          const companyStaff = await UserModel.find({
            company: targetCompanyId,
            role: { $in: ["admin", "staff"] },
            isDeleted: false,
          }).select("email firstName lastName");

          for (const staff of companyStaff) {
            await emailService.sendSupportTicketCreatedEmail(
              ticket._id.toString(),
              ticket.title,
              ticket.category,
              ticket.priority,
              staff._id.toString()
            );
          }
        } else {
          // Send notification to super admins for general tickets
          const superAdmins = await UserModel.find({
            isSuperAdmin: true,
            isDeleted: false,
          }).select("email firstName lastName");

          for (const admin of superAdmins) {
            await emailService.sendSupportTicketCreatedEmail(
              ticket._id.toString(),
              ticket.title,
              ticket.category,
              ticket.priority,
              admin._id.toString()
            );
          }
        }
      } catch (emailError) {
        console.warn(
          "Failed to send support ticket email notifications:",
          emailError
        );
      }

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

  // Get ticket details by ID
  static async getTicketDetails(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const userId = (req.user as any)?.id;
      const userCompanyId = (req.user as any)?.companyId;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      const ticket = await SupportTicketModel.findById(ticketId)
        .populate("user", "username firstName lastName email")
        .populate("company", "name")
        .populate("assignedTo", "username firstName lastName");

      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check access permissions
      let hasAccess = false;

      // Ticket creator always has access
      if (ticket.user._id.toString() === userId) {
        hasAccess = true;
      }

      // Company staff have access to company tickets
      if (
        userCompanyId &&
        ticket.company &&
        ticket.company._id.toString() === userCompanyId
      ) {
        if (["admin", "staff"].includes(userRole)) {
          hasAccess = true;
        }
      }

      // Super admins have access to all tickets
      if (isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Get messages for this ticket
      const messages = await SupportMessageModel.find({
        ticket: ticketId,
        isDeleted: false,
      })
        .populate("sender", "username firstName lastName")
        .sort({ createdAt: 1 });

      const ticketWithMessages = {
        ...ticket.toObject(),
        messages,
      };

      sendSuccess(
        res,
        "Ticket details retrieved successfully",
        ticketWithMessages
      );
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      sendError(res, "Failed to fetch ticket details", error);
    }
  }

  // Send a message to a support ticket
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const { message } = req.body;
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;
      const files = (req as any).files;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      if (!message && (!files || files.length === 0)) {
        sendError(res, "Message or attachment is required", null, 400);
        return;
      }

      // Get ticket details
      const ticket = await SupportTicketModel.findById(ticketId);
      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check access permissions
      let hasAccess = false;

      // Ticket creator always has access
      if (ticket.user.toString() === userId) {
        hasAccess = true;
      }

      // Company staff have access to company tickets
      if (ticket.company) {
        const user = await UserModel.findById(userId);
        if (
          user &&
          user.company &&
          user.company.toString() === ticket.company.toString()
        ) {
          if (["admin", "staff"].includes(userRole)) {
            hasAccess = true;
          }
        }
      }

      // Super admins have access to all tickets
      if (isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Determine sender type
      let senderType: "user" | "staff" | "system" = "user";
      if (["admin", "staff"].includes(userRole) || isSuperAdmin) {
        senderType = "staff";
      }

      const messageData: any = {
        ticket: ticketId,
        sender: userId,
        senderType,
        message: message || "Message with attachment",
        messageType: files && files.length > 0 ? "file" : "text",
        isRead: false,
        readBy: [],
      };

      // Add attachments if files were uploaded
      if (files && files.length > 0) {
        messageData.attachments = files.map((file: any) => file.path);
      }

      const newMessage = new SupportMessageModel(messageData);
      await newMessage.save();

      // Update ticket status to in_progress if it was open
      if (ticket.status === "open") {
        ticket.status = "in_progress";
        await ticket.save();
      }

      // Populate sender details
      await newMessage.populate("sender", "username firstName lastName");

      // Emit real-time event to all users in the ticket room
      emitToTicket(ticketId, "new-message", {
        message: newMessage,
        ticketId,
        sender: newMessage.sender,
        timestamp: new Date(),
      });

      // Emit typing stop event
      emitToTicket(ticketId, "typing-stopped", {
        userId,
        ticketId,
      });

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
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      // Check if user has permission to update status
      if (!["admin", "staff"].includes(userRole) && !isSuperAdmin) {
        sendError(res, "Insufficient permissions", null, 403);
        return;
      }

      const ticket = await SupportTicketModel.findById(ticketId);
      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check if user has access to this ticket
      let hasAccess = false;

      // Company staff have access to company tickets
      if (ticket.company) {
        const user = await UserModel.findById(userId);
        if (
          user &&
          user.company &&
          user.company.toString() === ticket.company.toString()
        ) {
          hasAccess = true;
        }
      }

      // Super admins have access to all tickets
      if (isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Update ticket
      const updateData: any = { status };
      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }

      // Set resolved/closed timestamps
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

      sendSuccess(res, "Ticket status updated successfully", updatedTicket);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      sendError(res, "Failed to update ticket status", error);
    }
  }

  // Update typing status for a ticket
  static async updateTypingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const { isTyping } = req.body;
      const userId = (req.user as any)?.id;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      // Get ticket details
      const ticket = await SupportTicketModel.findById(ticketId);
      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check access permissions
      let hasAccess = false;

      // Ticket creator always has access
      if (ticket.user.toString() === userId) {
        hasAccess = true;
      }

      // Company staff have access to company tickets
      if (ticket.company) {
        const user = await UserModel.findById(userId);
        if (
          user &&
          user.company &&
          user.company.toString() === ticket.company.toString()
        ) {
          hasAccess = true;
        }
      }

      // Super admins have access to all tickets
      if ((req.user as any)?.isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Emit typing event to all users in the ticket room
      emitToTicket(ticketId, "user-typing", {
        userId,
        isTyping,
        ticketId,
      });

      sendSuccess(res, "Typing status updated", { isTyping });
    } catch (error) {
      console.error("Error updating typing status:", error);
      sendError(res, "Failed to update typing status", error);
    }
  }

  // Get available staff for assignment
  static async getAvailableStaff(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      const userCompanyId = (req.user as any)?.companyId;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      // Check if user has permission
      if (!["admin", "staff"].includes(userRole) && !isSuperAdmin) {
        sendError(res, "Insufficient permissions", null, 403);
        return;
      }

      let query: any = {
        role: { $in: ["admin", "staff"] },
        isDeleted: false,
      };

      // If not super admin, only show staff from user's company
      if (!isSuperAdmin && userCompanyId) {
        query.company = userCompanyId;
      }

      const staff = await UserModel.find(query)
        .select("username firstName lastName email role")
        .sort({ firstName: 1, lastName: 1 });

      sendSuccess(res, "Available staff retrieved successfully", staff);
    } catch (error) {
      console.error("Error fetching available staff:", error);
      sendError(res, "Failed to fetch available staff", error);
    }
  }

  // Get support statistics
  static async getSupportStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      const userCompanyId =
        typeof (req.user as any)?.companyId == "object"
          ? (req.user as any)?.companyId?._id
          : (req.user as any)?.companyId;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      let query: any = { isDeleted: false };

      // If not super admin, only show stats for user's company
      if (!isSuperAdmin && userCompanyId) {
        query.company = userCompanyId;
      }

      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
      ] = await Promise.all([
        SupportTicketModel.countDocuments(query),
        SupportTicketModel.countDocuments({ ...query, status: "open" }),
        SupportTicketModel.countDocuments({ ...query, status: "in_progress" }),
        SupportTicketModel.countDocuments({ ...query, status: "resolved" }),
        SupportTicketModel.countDocuments({ ...query, status: "closed" }),
      ]);

      const stats = {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
      };

      sendSuccess(res, "Support statistics retrieved successfully", stats);
    } catch (error) {
      console.error("Error fetching support statistics:", error);
      sendError(res, "Failed to fetch support statistics", error);
    }
  }

  // Get support categories
  static async getSupportCategories(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const categories = [
        { value: "technical", label: "Technical Issue" },
        { value: "billing", label: "Billing & Payment" },
        { value: "feature_request", label: "Feature Request" },
        { value: "bug_report", label: "Bug Report" },
        { value: "general", label: "General Inquiry" },
      ];

      sendSuccess(res, "Support categories retrieved successfully", categories);
    } catch (error) {
      console.error("Error fetching support categories:", error);
      sendError(res, "Failed to fetch support categories", error);
    }
  }

  // Get support priorities
  static async getSupportPriorities(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const priorities = [
        { value: "low", label: "Low", color: "green" },
        { value: "medium", label: "Medium", color: "yellow" },
        { value: "high", label: "High", color: "orange" },
        { value: "urgent", label: "Urgent", color: "red" },
      ];

      sendSuccess(res, "Support priorities retrieved successfully", priorities);
    } catch (error) {
      console.error("Error fetching support priorities:", error);
      sendError(res, "Failed to fetch support priorities", error);
    }
  }

  // Close ticket
  static async closeTicket(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      const ticket = await SupportTicketModel.findById(ticketId);
      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check if user has access to this ticket
      let hasAccess = false;

      // Users can close their own tickets
      if (ticket.user && ticket.user.toString() === userId) {
        hasAccess = true;
      }

      // Company staff have access to company tickets
      if (ticket.company) {
        const user = await UserModel.findById(userId);
        if (
          user &&
          user.company &&
          user.company.toString() === ticket.company.toString()
        ) {
          hasAccess = true;
        }
      }

      // Super admins have access to all tickets
      if (isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Update ticket status to closed
      ticket.status = "closed";
      ticket.closedAt = new Date();
      await ticket.save();

      // Create system message for ticket closure
      const systemMessage = new SupportMessageModel({
        ticket: ticketId,
        sender: userId,
        senderType: "system",
        message:
          ticket.user.toString() === userId
            ? "Ticket has been closed by the user."
            : "Ticket has been closed by staff.",
        messageType: "text",
        isRead: false,
        readBy: [],
      });
      await systemMessage.save();

      sendSuccess(res, "Ticket closed successfully");
    } catch (error) {
      console.error("Error closing ticket:", error);
      sendError(res, "Failed to close ticket", error);
    }
  }

  // Reopen ticket
  static async reopenTicket(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      const ticket = await SupportTicketModel.findById(ticketId);
      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check if user has access to this ticket
      let hasAccess = false;

      // Users can reopen their own tickets
      if (ticket.user && ticket.user.toString() === userId) {
        hasAccess = true;
      }

      // Company staff have access to company tickets
      if (ticket.company) {
        const user = await UserModel.findById(userId);
        if (
          user &&
          user.company &&
          user.company.toString() === ticket.company.toString()
        ) {
          hasAccess = true;
        }
      }

      // Super admins have access to all tickets
      if (isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Update ticket status to open
      ticket.status = "open";
      ticket.closedAt = undefined;
      await ticket.save();

      // Create system message for ticket reopening
      const systemMessage = new SupportMessageModel({
        ticket: ticketId,
        sender: userId,
        senderType: "system",
        message:
          ticket.user.toString() === userId
            ? "Ticket has been reopened by the user."
            : "Ticket has been reopened by staff.",
        messageType: "text",
        isRead: false,
        readBy: [],
      });
      await systemMessage.save();

      sendSuccess(res, "Ticket reopened successfully");
    } catch (error) {
      console.error("Error reopening ticket:", error);
      sendError(res, "Failed to reopen ticket", error);
    }
  }

  // Assign ticket to staff member
  static async assignTicket(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const { staffId } = req.body;
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      // Check if user has permission to assign tickets
      if (!["admin", "staff"].includes(userRole) && !isSuperAdmin) {
        sendError(res, "Insufficient permissions", null, 403);
        return;
      }

      const ticket = await SupportTicketModel.findById(ticketId);
      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check if user has access to this ticket
      let hasAccess = false;

      // Company staff have access to company tickets
      if (ticket.company) {
        const user = await UserModel.findById(userId);
        if (
          user &&
          user.company &&
          user.company.toString() === ticket.company.toString()
        ) {
          hasAccess = true;
        }
      }

      // Super admins have access to all tickets
      if (isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Check if the target staff member exists and has appropriate permissions
      const targetStaff = await UserModel.findById(staffId);
      if (!targetStaff || !["admin", "staff"].includes(targetStaff.role)) {
        sendError(res, "Invalid staff member", null, 400);
        return;
      }

      // Check if target staff is from the same company (for company tickets)
      if (ticket.company && targetStaff.company) {
        if (ticket.company.toString() !== targetStaff.company.toString()) {
          sendError(
            res,
            "Staff member must be from the same company",
            null,
            400
          );
          return;
        }
      }

      // Update ticket assignment
      ticket.assignedTo = staffId;
      ticket.status = "in_progress";
      await ticket.save();

      // Create system message for assignment
      const systemMessage = new SupportMessageModel({
        ticket: ticketId,
        sender: userId,
        senderType: "system",
        message: `Ticket has been assigned to ${targetStaff.name}.`,
        messageType: "text",
        isRead: false,
        readBy: [],
      });
      await systemMessage.save();

      sendSuccess(res, "Ticket assigned successfully");
    } catch (error) {
      console.error("Error assigning ticket:", error);
      sendError(res, "Failed to assign ticket", error);
    }
  }

  // Reassign ticket to another staff member
  static async reassignTicket(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const { newStaffId, reason } = req.body;
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      // Check if user has permission to reassign tickets
      if (!["admin", "staff"].includes(userRole) && !isSuperAdmin) {
        sendError(res, "Insufficient permissions", null, 403);
        return;
      }

      const ticket = await SupportTicketModel.findById(ticketId);
      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check if user has access to this ticket
      let hasAccess = false;

      // Company staff have access to company tickets
      if (ticket.company) {
        const user = await UserModel.findById(userId);
        if (
          user &&
          user.company &&
          user.company.toString() === ticket.company.toString()
        ) {
          hasAccess = true;
        }
      }

      // Super admins have access to all tickets
      if (isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Check if the new staff member exists and has appropriate permissions
      const newStaff = await UserModel.findById(newStaffId);
      if (!newStaff || !["admin", "staff"].includes(newStaff.role)) {
        sendError(res, "Invalid staff member", null, 400);
        return;
      }

      // Check if new staff is from the same company (for company tickets)
      if (ticket.company && newStaff.company) {
        if (ticket.company.toString() !== newStaff.company.toString()) {
          sendError(
            res,
            "Staff member must be from the same company",
            null,
            400
          );
          return;
        }
      }

      // Get the previous assignee name
      const previousAssignee = ticket.assignedTo
        ? await UserModel.findById(ticket.assignedTo)
        : null;
      const previousAssigneeName = previousAssignee
        ? `${(previousAssignee as any).firstName} ${
            (previousAssignee as any).lastName
          }`
        : "Unassigned";

      // Update ticket assignment
      ticket.assignedTo = newStaffId;
      await ticket.save();

      // Create system message for reassignment
      const reassignmentMessage = reason
        ? `Ticket reassigned from ${previousAssigneeName} to ${
            (newStaff as any).firstName
          } ${(newStaff as any).lastName}. Reason: ${reason}`
        : `Ticket reassigned from ${previousAssigneeName} to ${
            (newStaff as any).firstName
          } ${(newStaff as any).lastName}.`;

      const systemMessage = new SupportMessageModel({
        ticket: ticketId,
        sender: userId,
        senderType: "system",
        message: reassignmentMessage,
        messageType: "text",
        isRead: false,
        readBy: [],
      });
      await systemMessage.save();

      sendSuccess(res, "Ticket reassigned successfully");
    } catch (error) {
      console.error("Error reassigning ticket:", error);
      sendError(res, "Failed to reassign ticket", error);
    }
  }

  // Get ticket messages
  static async getTicketMessages(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;
      const userId = (req.user as any)?.id;
      const userCompanyId = (req.user as any)?.companyId;
      const userRole = (req.user as any)?.role;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;

      if (!userId) {
        sendError(res, "User not authenticated", null, 401);
        return;
      }

      // Get ticket details to check access
      const ticket = await SupportTicketModel.findById(ticketId);
      if (!ticket || ticket.isDeleted) {
        sendError(res, "Ticket not found", null, 404);
        return;
      }

      // Check access permissions
      let hasAccess = false;

      // Ticket creator always has access
      if (ticket.user.toString() === userId) {
        hasAccess = true;
      }

      // Company staff have access to company tickets
      if (
        userCompanyId &&
        ticket.company &&
        ticket.company.toString() === userCompanyId
      ) {
        if (["admin", "staff"].includes(userRole)) {
          hasAccess = true;
        }
      }

      // Super admins have access to all tickets
      if (isSuperAdmin) {
        hasAccess = true;
      }

      if (!hasAccess) {
        sendError(res, "Access denied", null, 403);
        return;
      }

      // Get all messages for the ticket
      const messages = await SupportMessageModel.find({
        ticket: ticketId,
        isDeleted: false,
      })
        .populate("sender", "username firstName lastName")
        .sort({ createdAt: 1 });

      sendSuccess(res, "Messages retrieved successfully", messages);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      sendError(res, "Failed to fetch messages", error);
    }
  }
}
