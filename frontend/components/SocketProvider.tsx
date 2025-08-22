"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {
  initSocket,
  disconnectSocket,
  SocketEvents,
  SocketEventName,
} from "@/lib/socket";
import { useAuth } from "./AuthProvider";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribeToEvent: (
    event: SocketEventName,
    callback: (data: any) => void
  ) => void;
  unsubscribeFromEvent: (
    event: SocketEventName,
    callback: (data: any) => void
  ) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, tokens } = useAuth();

  useEffect(() => {
    if (tokens?.accessToken) {
      const newSocket = initSocket(tokens.accessToken);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected");
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [tokens?.accessToken]);

  const subscribeToEvent = (
    event: SocketEventName,
    callback: (data: any) => void
  ) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const unsubscribeFromEvent = (
    event: SocketEventName,
    callback: (data: any) => void
  ) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    subscribeToEvent,
    unsubscribeFromEvent,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

// Re-export events for consumers who currently import from this provider
export { SocketEvents } from "@/lib/socket";
