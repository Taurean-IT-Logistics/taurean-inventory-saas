import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../helpers/token.helper";
import { SupportTicketModel } from "../models/supportTicket.model";
import { SupportMessageModel } from "../models/supportMessage.model";
import { UserModel } from "../models/user.model";

let io: Server | null = null;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket: Socket, next) => {
    try {
      const token =
        (socket.handshake.auth as any)?.token ||
        (socket.handshake.query as any)?.token;
      if (token) {
        try {
          const payload = verifyToken(token as string);
          (socket as any).user = payload;
          if (payload?.id) {
            socket.join(`user:${payload.id}`);
          }
          if ((payload as any)?.companyId) {
            socket.join(`company:${(payload as any).companyId}`);
          }
        } catch (err) {
          // allow anonymous connections as well
        }
      }
      next();
    } catch (e) {
      next();
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${(socket as any).user?.id || "anonymous"}`);

    // Join user's company room
    if ((socket as any).user?.companyId) {
      socket.join(`company:${(socket as any).user.companyId}`);
    }

    // Join super admin room if applicable
    if ((socket as any).user?.isSuperAdmin) {
      socket.join("super-admin");
    }

    socket.on("join", (room: string) => {
      if (typeof room === "string" && room.length > 0) {
        socket.join(room);
      }
    });

    socket.on("leave", (room: string) => {
      if (typeof room === "string" && room.length > 0) {
        socket.leave(room);
      }
    });

    socket.on("ping", (cb?: (msg: string) => void) => {
      if (cb) cb("pong");
    });

    // Support ticket events
    socket.on("join-ticket", async (ticketId: string) => {
      try {
        const ticket = await SupportTicketModel.findById(ticketId);
        if (!ticket) {
          socket.emit("error", "Ticket not found");
          return;
        }

        // Check access permissions
        const canAccess =
          (socket as any).user?.isSuperAdmin ||
          ticket.company.toString() === (socket as any).user?.companyId ||
          ticket.user.toString() === (socket as any).user?.id ||
          ticket.assignedTo?.toString() === (socket as any).user?.id;

        if (!canAccess) {
          socket.emit("error", "Access denied");
          return;
        }

        socket.join(`ticket:${ticketId}`);
        socket.emit("joined-ticket", ticketId);
      } catch (error) {
        socket.emit("error", "Failed to join ticket");
      }
    });

    socket.on("leave-ticket", (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
      socket.emit("left-ticket", ticketId);
    });

    socket.on("typing", (data: { ticketId: string; isTyping: boolean }) => {
      socket.to(`ticket:${data.ticketId}`).emit("user-typing", {
        userId: (socket as any).user?.id,
        isTyping: data.isTyping,
      });
    });

    socket.on(
      "new-message",
      async (data: { ticketId: string; message: any }) => {
        try {
          // Broadcast to all users in the ticket room
          socket.to(`ticket:${data.ticketId}`).emit("new-message", {
            ...data.message,
            sender: (socket as any).user?.id,
          });

          // Update message read status
          await SupportMessageModel.findByIdAndUpdate(data.message._id, {
            isRead: false,
          });
        } catch (error) {
          socket.emit("error", "Failed to send message");
        }
      }
    );

    socket.on("ticket-updated", (data: { ticketId: string; updates: any }) => {
      socket.to(`ticket:${data.ticketId}`).emit("ticket-updated", data.updates);
    });

    socket.on("disconnect", () => {
      console.log(
        `Socket disconnected: ${(socket as any).user?.id || "anonymous"}`
      );
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) {
    throw new Error(
      "Socket.IO server not initialized. Call initSocket() first."
    );
  }
  return io;
}

export function emitEvent(event: string, payload: any, room?: string) {
  const ioInstance = getIo();
  if (room) {
    ioInstance.to(room).emit(event, payload);
  } else {
    ioInstance.emit(event, payload);
  }
}

// Support-specific helper functions
export function emitToTicket(ticketId: string, event: string, payload: any) {
  const ioInstance = getIo();
  ioInstance.to(`ticket:${ticketId}`).emit(event, payload);
}

export function emitToCompany(companyId: string, event: string, payload: any) {
  const ioInstance = getIo();
  ioInstance.to(`company:${companyId}`).emit(event, payload);
}

export function emitToSuperAdmin(event: string, payload: any) {
  const ioInstance = getIo();
  ioInstance.to("super-admin").emit(event, payload);
}

export function emitToUser(userId: string, event: string, payload: any) {
  const ioInstance = getIo();
  ioInstance.to(`user:${userId}`).emit(event, payload);
}
