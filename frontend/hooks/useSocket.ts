import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/components/AuthProvider";

export function useSocket() {
  const { tokens } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!tokens?.accessToken) return;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        auth: {
          token: tokens.accessToken,
        },
        transports: ["websocket", "polling"],
      }
    );

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tokens?.accessToken]);

  const socket = socketRef.current;

  return {
    socket,
    isConnected: socket?.connected || false,
  };
}