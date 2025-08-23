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
      const {
        title,
        description,
        category,
        priority,
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

      // If user is admin/staff, they can create tickets for their company
      if (["admin", "staff"].includes(userRole) && userCompanyId) {
        targetCompanyId = userCompanyId;
      }

      // For regular users:
      // - If they specify a company, use that company
      // - If they don't specify a company, create a general ticket (no company assigned)
      // - If they have a company, use their company as default
      if (!targetCompanyId && userCompanyId) {
        targetCompanyId = userCompanyId;
      }

      // Super admins can create tickets for any company
      if (isSuperAdmin && !targetCompanyId) {
        sendError(res, "Company ID is required for support tickets", null, 400);
        return;
      }

      // For regular users, if no company is specified, allow general tickets
      // These will be handled by Taurean IT support
      if (!targetCompanyId && !["admin", "staff"].includes(userRole)) {
        // This is a general support ticket - no company assigned
        targetCompanyId = null;
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

      // Emit socket event for real-time updates
      try {
        const { emitToCompany, emitToSuperAdmin } = await import(
          "../realtime/socket"
        );
        if (targetCompanyId) {
          // Emit to specific company
          emitToCompany(targetCompanyId, "ticket-created", {
            ticket: ticket.toObject(),
            message: "New support ticket created",
          });
        } else {
          // Emit to super admin for general tickets
          emitToSuperAdmin("ticket-created", {
            ticket: ticket.toObject(),
            message: "New general support ticket created",
          });
        }
      } catch (socketError) {
        console.log("Socket not available for real-time updates");
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
        isRead: false,
        readBy: [],
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

      // Emit socket event for real-time updates
      try {
        const { emitToTicket } = await import("../realtime/socket");
        emitToTicket(ticketId, "message-received", {
          ticketId,
          message: newMessage.toObject(),
          sender: newMessage.sender,
        });
      } catch (socketError) {
        console.log("Socket not available for real-time updates");
      }

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

  // Get support statistics
  static async getSupportStats(req: Request, res: Response): Promise<void> {
    try {
      const companyId = (req.user as any)?.companyId;
      const isSuperAdmin = (req.user as any)?.isSuperAdmin;
      const requestedCompanyId = req.query.companyId as string;

      let targetCompanyId = companyId;
      if (isSuperAdmin && requestedCompanyId) {
        targetCompanyId = requestedCompanyId;
      }

      if (!targetCompanyId && !isSuperAdmin) {
        sendError(res, "Company context required", null, 400);
        return;
      }

      let query: any = { isDeleted: false };
      if (targetCompanyId) {
        query.company = targetCompanyId;
      }

      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        urgentTickets,
        highPriorityTickets,
        avgResolutionTime,
      ] = await Promise.all([
        SupportTicketModel.countDocuments(query),
        SupportTicketModel.countDocuments({ ...query, status: "open" }),
        SupportTicketModel.countDocuments({ ...query, status: "in_progress" }),
        SupportTicketModel.countDocuments({ ...query, status: "resolved" }),
        SupportTicketModel.countDocuments({ ...query, status: "closed" }),
        SupportTicketModel.countDocuments({ ...query, priority: "urgent" }),
        SupportTicketModel.countDocuments({ ...query, priority: "high" }),
        SupportTicketModel.aggregate([
          {
            $match: {
              ...query,
              status: "resolved",
              resolvedAt: { $exists: true },
            },
          },
          {
            $group: {
              _id: null,
              avgTime: {
                $avg: {
                  $subtract: ["$resolvedAt", "$createdAt"],
                },
              },
            },
          },
        ]),
      ]);

      const avgResolutionHours = avgResolutionTime[0]?.avgTime
        ? Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60))
        : 0;

      const stats = {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        urgentTickets,
        highPriorityTickets,
        avgResolutionHours,
        resolutionRate:
          totalTickets > 0
            ? (
                ((resolvedTickets + closedTickets) / totalTickets) *
                100
              ).toFixed(1)
            : "0",
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
        {
          value: "technical",
          label: "Technical Issue",
          description: "Software, hardware, or system problems",
        },
        {
          value: "billing",
          label: "Billing & Payment",
          description: "Invoice, payment, or subscription issues",
        },
        {
          value: "feature_request",
          label: "Feature Request",
          description: "New functionality or improvements",
        },
        {
          value: "bug_report",
          label: "Bug Report",
          description: "System errors or unexpected behavior",
        },
        {
          value: "general",
          label: "General Inquiry",
          description: "Other questions or support needs",
        },
      ];

      sendSuccess(res, "Support categories retrieved successfully", {
        categories,
      });
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
        {
          value: "low",
          label: "Low",
          description: "Minor issues, non-urgent",
          color: "text-green-600",
        },
        {
          value: "medium",
          label: "Medium",
          description: "Standard priority issues",
          color: "text-yellow-600",
        },
        {
          value: "high",
          label: "High",
          description: "Important issues affecting work",
          color: "text-orange-600",
        },
        {
          value: "urgent",
          label: "Urgent",
          description: "Critical issues requiring immediate attention",
          color: "text-red-600",
        },
      ];

      sendSuccess(res, "Support priorities retrieved successfully", {
        priorities,
      });
    } catch (error) {
      console.error("Error fetching support priorities:", error);
      sendError(res, "Failed to fetch support priorities", error);
    }
  }
}
