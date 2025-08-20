import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

let socket: Socket | null = null;

export const initSocket = (token?: string): Socket => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });

  socket.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event types for type safety
export const SocketEvents = {
  BookingCreated: "booking:created",
  BookingUpdated: "booking:updated",
  InventoryCreated: "inventory:created",
  InventoryUpdated: "inventory:updated",
  InventoryDeleted: "inventory:deleted",
  TransactionCreated: "transaction:created",
  TransactionUpdated: "transaction:updated",
  InvoiceCreated: "invoice:created",
  InvoicePaid: "invoice:paid",
  NotificationUser: "notification:user",
  NotificationCompany: "notification:company",
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
