import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";

interface UseSupportWebSocketProps {
  ticketId?: string;
  companyId?: string;
  userType: "staff" | "user";
  onMessageReceived?: (data: any) => void;
  onTicketUpdated?: (data: any) => void;
}

export function useSupportWebSocket({
  ticketId,
  companyId,
  userType,
  onMessageReceived,
  onTicketUpdated,
}: UseSupportWebSocketProps) {
  const { user, tokens } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!tokens?.accessToken) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        auth: {
          token: tokens.accessToken,
        },
        transports: ["websocket", "polling"],
      }
    );

    newSocket.on("connect", () => {
      // Connected to support WebSocket
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    newSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    newSocket.on("new-message", (data: any) => {
      // Invalidate queries to refresh data in real-time
      if (data.ticketId) {
        queryClient.invalidateQueries({
          queryKey: ["ticket-messages", data.ticketId],
        });
        queryClient.invalidateQueries({
          queryKey: ["support-messages", data.ticketId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });

      // Call the callback if provided
      onMessageReceived?.(data);
    });

    newSocket.on("ticket-updated", (data: any) => {
      // Invalidate queries to refresh data in real-time
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });

      // Call the callback if provided
      onTicketUpdated?.(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [tokens?.accessToken, user, queryClient]); // Removed onMessageReceived and onTicketUpdated from dependencies

  // Join ticket room when ticketId changes
  useEffect(() => {
    if (socket && ticketId) {
      socket.emit("join-ticket", ticketId);

      return () => {
        socket.emit("leave-ticket", ticketId);
      };
    }
  }, [socket, ticketId]);

  // Join company room for company-wide support updates
  useEffect(() => {
    if (socket && companyId) {
      socket.emit("join-company", companyId);

      return () => {
        socket.emit("leave-company", companyId);
      };
    }
  }, [socket, companyId]);

  // Listen for typing events in rooms
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: any) => {
      if (data.userId !== user?.id) {
        if (data.isTyping) {
          setTypingUsers((prev) => new Set(prev).add(data.userId));
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }, 3000);
        } else {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      }
    };

    // Listen for typing events from the ticket room
    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
    };
  }, [socket, user?.id]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !ticketId) {
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      const typingData = {
        ticketId,
        companyId,
        isTyping: true,
        userId: user?.id,
        userType,
      };
      socket.emit("typing", typingData);

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        const stopTypingData = {
          ticketId,
          companyId,
          isTyping: false,
          userId: user?.id,
          userType,
        };
        socket.emit("typing", stopTypingData);
      }, 1000);
    } else {
      const stopTypingData = {
        ticketId,
        companyId,
        isTyping: false,
        userId: user?.id,
        userType,
      };
      socket.emit("typing", stopTypingData);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, socket, ticketId, companyId, user?.id, userType]);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const stopTyping = () => {
    setIsTyping(false);
  };

  return {
    socket,
    isTyping,
    typingUsers,
    startTyping,
    stopTyping,
  };
}
