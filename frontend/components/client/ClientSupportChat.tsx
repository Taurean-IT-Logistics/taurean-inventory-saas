"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  User,
  Loader2,
  AlertCircle,
  Building,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupportWebSocket } from "@/hooks/useSupportWebSocket";
import { WebSocketStatus } from "@/components/ui/WebSocketStatus";
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

interface ClientSupportChatProps {
  ticket: SupportTicket;
  onClose: () => void;
}

export function ClientSupportChat({ ticket, onClose }: ClientSupportChatProps) {
  const { user, tokens } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket integration
  const { socket, isTyping, typingUsers, startTyping, stopTyping } =
    useSupportWebSocket({
      ticketId: ticket._id,
      companyId: ticket.company?._id,
      userType: "user",
      onMessageReceived: (data) => {
        // Messages are automatically refreshed by the WebSocket hook
        // No need to manually invalidate queries here
      },
      onTicketUpdated: (data) => {
        // Tickets are automatically refreshed by the WebSocket hook
        // No need to manually invalidate queries here
      },
    });

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
    onSuccess: (response: any) => {
      setNewMessage("");

      // Emit WebSocket event for real-time updates
      if (socket) {
        socket.emit("new-message", {
          ticketId: ticket._id,
          message: response?.data || response,
        });
      }
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

  // Auto-scroll to bottom when new messages arrive or typing indicators change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const formData = new FormData();
    formData.append("message", newMessage.trim());

    sendMessageMutation.mutate(formData);
    stopTyping();
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
      className="fixed inset-0 z-50 flex items-center justify-center min-h-screen	 bg-black/50"
    >
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Support Ticket: {ticket.ticketNumber}
              </h2>
              <p className="text-sm text-gray-600">{ticket.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <WebSocketStatus socket={socket} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="p-4 border-b bg-blue-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.replace("_", " ")}
              </Badge>
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
              <span className="font-medium">Priority:</span>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
            </div>
          </div>
          <div className="mt-3">
            <Badge variant="outline">{ticket.category}</Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              {(messages as any).map((message: SupportMessage) => {
                const isCurrentUser = message.sender?._id === user?.id;
                const isSystem = message.senderType === "system";
                const isStaff = message.senderType === "staff";

                return (
                  <div
                    key={message._id}
                    className={`flex mb-3 ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isCurrentUser && !isSystem && (
                      <div className="flex items-end mr-2 mb-1">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {message.sender?.username?.charAt(0)?.toUpperCase() ||
                            "S"}
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm relative ${
                        isCurrentUser
                          ? "bg-blue-600 text-white rounded-br-md"
                          : isSystem
                          ? "bg-gray-200 text-gray-700 rounded-lg mx-auto"
                          : isStaff
                          ? "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                      style={{
                        borderBottomRightRadius: isCurrentUser ? 8 : 16,
                        borderBottomLeftRadius: !isCurrentUser ? 8 : 16,
                      }}
                    >
                      {/* Sender name for non-system messages */}
                      {!isSystem && !isCurrentUser && (
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          {message.sender?.username || "Support Staff"}
                          {isStaff && (
                            <span className="ml-2 text-blue-600 text-xs">
                              Staff
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message content */}
                      <div className="text-sm break-words whitespace-pre-line leading-relaxed">
                        {message.message}
                      </div>

                      {/* Attachments */}
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-xs"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span className="underline cursor-pointer hover:text-blue-600">
                                  {attachment.split("/").pop()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Timestamp */}
                      <div
                        className={`text-xs mt-2 ${
                          isCurrentUser ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* Message status indicator for current user */}
                      {isCurrentUser && (
                        <div className="absolute -bottom-1 -right-1">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {isCurrentUser && (
                      <div className="flex items-end ml-2 mb-1">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicators */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="flex items-end mr-2 mb-1">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      S
                    </div>
                  </div>
                  <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl border border-gray-200 rounded-bl-md">
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
                      <span className="text-sm">
                        {Array.from(typingUsers).length === 1
                          ? "Support staff is typing..."
                          : `${
                              Array.from(typingUsers).length
                            } staff members are typing...`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (!isTyping) startTyping();
              }}
              onBlur={() => {
                stopTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none px-0 py-0 text-gray-900 placeholder-gray-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 rounded-full w-8 h-8 p-0 flex items-center justify-center"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
