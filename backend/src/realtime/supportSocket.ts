import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { SupportTicketModel } from "../models/supportTicket.model";
import { SupportMessageModel } from "../models/supportMessage.model";
import { UserModel } from "../models/user.model";
import { verifyToken } from "../helpers";

interface SupportSocket extends Socket {
  userId?: string;
  companyId?: string;
  isSuperAdmin?: boolean;
  userRole?: string;
}

export class SupportSocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, SupportSocket> = new Map();
  private ticketRooms: Map<string, Set<string>> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket: SupportSocket, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
          return next(new Error("Authentication required"));
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
          return next(new Error("Invalid token"));
        }

        socket.userId = decoded.id;
        socket.companyId = decoded.companyId;
        socket.isSuperAdmin = decoded.isSuperAdmin;
        socket.userRole = decoded.role;

        // Store socket reference
        this.userSockets.set(decoded.id, socket);

        next();
      } catch (error) {
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: SupportSocket) => {
      console.log(`Support socket connected: ${socket.userId}`);

      // Join user's company room
      if (socket.companyId) {
        socket.join(`company:${socket.companyId}`);
      }

      // Join super admin room if applicable
      if (socket.isSuperAdmin) {
        socket.join("super-admin");
      }

      // Handle joining specific ticket room
      socket.on("join-ticket", async (ticketId: string) => {
        try {
          const ticket = await SupportTicketModel.findById(ticketId);
          if (!ticket) {
            socket.emit("error", "Ticket not found");
            return;
          }

          // Check access permissions
          const canAccess =
            socket.isSuperAdmin ||
            ticket.company.toString() === socket.companyId ||
            ticket.user.toString() === socket.userId ||
            ticket.assignedTo?.toString() === socket.userId;

          if (!canAccess) {
            socket.emit("error", "Access denied");
            return;
          }

          socket.join(`ticket:${ticketId}`);

          // Track ticket room membership
          if (!this.ticketRooms.has(ticketId)) {
            this.ticketRooms.set(ticketId, new Set());
          }
          this.ticketRooms.get(ticketId)!.add(socket.userId!);

          socket.emit("joined-ticket", { ticketId, success: true });
        } catch (error) {
          socket.emit("error", "Failed to join ticket");
        }
      });

      // Handle leaving ticket room
      socket.on("leave-ticket", (ticketId: string) => {
        socket.leave(`ticket:${ticketId}`);

        if (this.ticketRooms.has(ticketId)) {
          this.ticketRooms.get(ticketId)!.delete(socket.userId!);
          if (this.ticketRooms.get(ticketId)!.size === 0) {
            this.ticketRooms.delete(ticketId);
          }
        }

        socket.emit("left-ticket", { ticketId, success: true });
      });

      // Handle typing indicators
      socket.on("typing", (data: { ticketId: string; isTyping: boolean }) => {
        socket.to(`ticket:${data.ticketId}`).emit("user-typing", {
          userId: socket.userId,
          isTyping: data.isTyping,
        });
      });

      // Handle new message (for real-time updates)
      socket.on(
        "new-message",
        async (data: { ticketId: string; message: string }) => {
          try {
            // Validate ticket access
            const ticket = await SupportTicketModel.findById(data.ticketId);
            if (!ticket) {
              socket.emit("error", "Ticket not found");
              return;
            }

            // Check access permissions
            const canAccess =
              socket.isSuperAdmin ||
              ticket.company.toString() === socket.companyId ||
              ticket.user.toString() === socket.userId ||
              ticket.assignedTo?.toString() === socket.userId;

            if (!canAccess) {
              socket.emit("error", "Access denied");
              return;
            }

            // Emit to all users in the ticket room
            this.io.to(`ticket:${data.ticketId}`).emit("message-received", {
              ticketId: data.ticketId,
              message: data.message,
              userId: socket.userId,
              timestamp: new Date(),
            });
          } catch (error) {
            socket.emit("error", "Failed to send message");
          }
        }
      );

      // Handle ticket status updates
      socket.on(
        "ticket-updated",
        (data: { ticketId: string; status: string }) => {
          socket.to(`ticket:${data.ticketId}`).emit("ticket-status-changed", {
            ticketId: data.ticketId,
            status: data.status,
            updatedBy: socket.userId,
            timestamp: new Date(),
          });
        }
      );

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Support socket disconnected: ${socket.userId}`);

        // Remove from user sockets
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }

        // Remove from ticket rooms
        this.ticketRooms.forEach((users, ticketId) => {
          if (users.has(socket.userId!)) {
            users.delete(socket.userId!);
            if (users.size === 0) {
              this.ticketRooms.delete(ticketId);
            }
          }
        });
      });
    });
  }

  // Method to emit to specific ticket room
  public emitToTicket(ticketId: string, event: string, data: any) {
    this.io.to(`ticket:${ticketId}`).emit(event, data);
  }

  // Method to emit to company room
  public emitToCompany(companyId: string, event: string, data: any) {
    this.io.to(`company:${companyId}`).emit(event, data);
  }

  // Method to emit to super admin room
  public emitToSuperAdmin(event: string, data: any) {
    this.io.to("super-admin").emit(event, data);
  }

  // Method to emit to specific user
  public emitToUser(userId: string, event: string, data: any) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit(event, data);
    }
  }

  // Method to get online users for a ticket
  public getOnlineUsersForTicket(ticketId: string): string[] {
    return Array.from(this.ticketRooms.get(ticketId) || []);
  }

  // Method to get all online users
  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
}

export let supportSocketService: SupportSocketService;

export const initSupportSocket = (server: HTTPServer) => {
  supportSocketService = new SupportSocketService(server);
  return supportSocketService;
};
