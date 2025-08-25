"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  FileText,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  Building,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../AuthProvider";
import { toast } from "@/hooks/use-toast";

interface SupportTicket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  company: any;
  user: any;
  assignedTo?: any;
  createdAt: string;
  updatedAt: string;
}

interface SupportMessage {
  _id: string;
  ticket: string;
  sender: any;
  senderType: "user" | "staff" | "system";
  message: string;
  messageType: "text" | "file" | "image";
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

interface AdminSupportChatProps {
  ticket: SupportTicket;
  onClose: () => void;
}

export function AdminSupportChat({ ticket, onClose }: AdminSupportChatProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch ticket messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["support-messages", ticket._id],
    queryFn: () => SupportAPI.getTicketMessages(ticket._id),
    enabled: !!ticket._id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (formData: FormData) =>
      SupportAPI.sendMessage(ticket._id, formData),
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update typing status mutation
  const updateTypingMutation = useMutation({
    mutationFn: (isTyping: boolean) =>
      SupportAPI.updateTypingStatus(ticket._id, isTyping),
  });

  // Initialize socket connection
  useEffect(() => {
    if (!(user as any)?.tokens?.accessToken) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        auth: {
          token: (user as any)?.tokens.accessToken,
        },
      }
    );

    newSocket.on("connect", () => {
      console.log("Connected to support chat");
      newSocket.emit("join-ticket", ticket._id);
    });

    newSocket.on("joined-ticket", (ticketId: string) => {
      console.log(`Joined ticket room: ${ticketId}`);
    });

    newSocket.on("new-message", (data: any) => {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    });

    newSocket.on("typing", (data: any) => {
      if (data.userId !== user?._id) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
    });

    newSocket.on("typing-stopped", (data: any) => {
      if (data.userId !== user?._id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave-ticket", ticket._id);
      newSocket.disconnect();
    };
  }, [ticket._id, (user as any)?.tokens?.accessToken]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      socket.emit("user-typing", {
        ticketId: ticket._id,
        userId: user?._id,
        isTyping: true,
      });
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit("user-typing", {
          ticketId: ticket._id,
          userId: user?._id,
          isTyping: false,
        });
      }, 1000);
    } else {
      socket.emit("user-typing", {
        ticketId: ticket._id,
        userId: user?._id,
        isTyping: false,
      });
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, socket, ticket._id, user?._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const formData = new FormData();
    formData.append("message", newMessage.trim());
    sendMessageMutation.mutate(formData);
    setIsTyping(false);
    if (socket) {
      socket.emit("user-typing", {
        ticketId: ticket._id,
        userId: user?._id,
        isTyping: false,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping) setIsTyping(true);
  };

  const handleInputBlur = () => {
    setIsTyping(false);
    if (socket) {
      socket.emit("user-typing", {
        ticketId: ticket._id,
        userId: user?._id,
        isTyping: false,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Support Ticket: {ticket.ticketNumber}
              </h2>
              <p className="text-sm text-gray-600">{ticket.title}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Ticket Info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">User:</span>
              <span>
                {ticket.user?.firstName} {ticket.user?.lastName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Company:</span>
              <span>{ticket.company?.name || "General"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Created:</span>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-4">
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority} Priority
            </Badge>
            <Badge variant="outline">{ticket.category}</Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {(messages as any).map((message: SupportMessage) => {
                const isCurrentUser = message.sender?._id === user?._id;
                const isSystem = message.senderType === "system";
                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                        isCurrentUser
                          ? "bg-blue-600 text-white self-end ml-8 rounded-br-md"
                          : isSystem
                          ? "bg-gray-200 text-gray-800 self-center"
                          : "bg-gray-100 text-gray-900 self-start mr-8 rounded-bl-md"
                      }`}
                      style={{
                        borderBottomRightRadius: isCurrentUser ? 8 : 16,
                        borderBottomLeftRadius:
                          !isCurrentUser && !isSystem ? 8 : 16,
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">
                          {isSystem
                            ? "System"
                            : message.sender?.firstName || "User"}
                        </span>
                        <span className="text-xs opacity-75">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm break-words whitespace-pre-line">
                        {message.message}
                      </p>
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-xs opacity-75"
                              >
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment.split("/").pop()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicators */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm">Someone is typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <Textarea
              value={newMessage}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="px-6"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
