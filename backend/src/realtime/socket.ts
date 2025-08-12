import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../helpers/token.helper";

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
      const token = (socket.handshake.auth as any)?.token || (socket.handshake.query as any)?.token;
      if (token) {
        try {
          const payload = verifyToken(token as string);
          (socket as any).user = payload;
          if (payload?.id) {
            socket.join(`user:${payload.id}`);
          }
        } catch (err) {
          // allow anonymous connections as well; could reject with next(new Error("unauthorized"))
        }
      }
      next();
    } catch (e) {
      next();
    }
  });

  io.on("connection", (socket: Socket) => {
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
  });

  return io;
}

export function getIo(): Server {
  if (!io) {
    throw new Error("Socket.IO server not initialized. Call initSocket() first.");
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