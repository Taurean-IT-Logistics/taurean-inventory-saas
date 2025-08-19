"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SupportAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  FileText,
  Clock,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

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

interface SupportWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportWidget: React.FC<SupportWidgetProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"chat" | "tickets" | "new-ticket">("chat");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New ticket form state
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  // Queries
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["support-tickets", user?.id],
    queryFn: () => {
      if (user?.isSuperAdmin) {
        return SupportAPI.getSuperAdminTickets();
      } else if (["admin", "staff"].includes(user?.role || "")) {
        return SupportAPI.getStaffTickets();
      } else {
        return SupportAPI.getUserTickets();
      }
    },
    enabled: !!user && isOpen,
  });

  const { data: ticketDetails, refetch: refetchTicketDetails } = useQuery({
    queryKey: ["ticket-details", selectedTicket?._id],
    queryFn: () => SupportAPI.getTicketDetails(selectedTicket!._id),
    enabled: !!selectedTicket?._id,
  });

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: (formData: FormData) => SupportAPI.createTicket(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setActiveTab("chat");
      setNewTicketForm({ title: "", description: "", category: "general", priority: "medium" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (formData: FormData) => SupportAPI.sendMessage(selectedTicket!._id, formData),
    onSuccess: () => {
      refetchTicketDetails();
      setMessage("");
      if (socket) {
        socket.emit("new-message", {
          ticketId: selectedTicket!._id,
          message: message,
        });
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: string; assignedTo?: string }) =>
      SupportAPI.updateTicketStatus(selectedTicket!._id, data),
    onSuccess: () => {
      refetchTicketDetails();
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      if (socket) {
        socket.emit("ticket-updated", {
          ticketId: selectedTicket!._id,
          status: selectedTicket?.status,
        });
      }
    },
  });

  // Socket connection
  useEffect(() => {
    if (isOpen && user) {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000", {
        auth: {
          token: localStorage.getItem("accessToken"),
        },
      });

      newSocket.on("connect", () => {
        console.log("Support socket connected");
      });

      newSocket.on("message-received", (data) => {
        if (data.ticketId === selectedTicket?._id) {
          refetchTicketDetails();
        }
      });

      newSocket.on("user-typing", (data) => {
        if (data.userId !== user.id) {
          if (data.isTyping) {
            setTypingUsers(prev => new Set(prev).add(data.userId));
          } else {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }
        }
      });

      newSocket.on("ticket-status-changed", (data) => {
        if (data.ticketId === selectedTicket?._id) {
          refetchTicketDetails();
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isOpen, user, selectedTicket?._id]);

  // Join ticket room when selected
  useEffect(() => {
    if (socket && selectedTicket) {
      socket.emit("join-ticket", selectedTicket._id);
    }
  }, [socket, selectedTicket]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketDetails?.messages]);

  // Typing indicator
  useEffect(() => {
    if (socket && selectedTicket) {
      const timeout = setTimeout(() => {
        socket.emit("typing", { ticketId: selectedTicket._id, isTyping: false });
        setIsTyping(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [message, socket, selectedTicket]);

  const handleTyping = () => {
    if (socket && selectedTicket && !isTyping) {
      setIsTyping(true);
      socket.emit("typing", { ticketId: selectedTicket._id, isTyping: true });
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedTicket) return;

    const formData = new FormData();
    formData.append("message", message);
    formData.append("messageType", "text");

    sendMessageMutation.mutate(formData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedTicket) return;

    const formData = new FormData();
    formData.append("message", "File uploaded");
    formData.append("messageType", "file");

    Array.from(files).forEach((file) => {
      formData.append("attachments", file);
    });

    sendMessageMutation.mutate(formData);
  };

  const handleCreateTicket = () => {
    const formData = new FormData();
    formData.append("title", newTicketForm.title);
    formData.append("description", newTicketForm.description);
    formData.append("category", newTicketForm.category);
    formData.append("priority", newTicketForm.priority);

    createTicketMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-blue-600 bg-blue-100";
      case "in_progress":
        return "text-yellow-600 bg-yellow-100";
      case "resolved":
        return "text-green-600 bg-green-100";
      case "closed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <span className="font-semibold">Support Center</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "tickets"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Tickets
        </button>
        <button
          onClick={() => setActiveTab("new-ticket")}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "new-ticket"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          New Ticket
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && (
          <div className="h-full flex flex-col">
            {!selectedTicket ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Select a ticket to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Ticket Info */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{selectedTicket.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span className={`px-2 py-1 rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span>#{selectedTicket.ticketNumber}</span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {ticketDetails?.messages?.map((msg: SupportMessage) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender._id === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.sender._id === user?.id
                            ? "bg-blue-600 text-white"
                            : msg.senderType === "system"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.senderType !== "system" && (
                          <div className="text-xs opacity-75 mb-1">
                            {msg.sender.firstName} {msg.sender.lastName}
                          </div>
                        )}
                        <div className="text-sm">{msg.message}</div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs">
                                <Paperclip size={12} />
                                <span className="underline cursor-pointer">
                                  {attachment.split("/").pop()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-xs opacity-75 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
                        Someone is typing...
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Paperclip size={20} />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="h-full overflow-y-auto p-4">
            {ticketsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={24} className="animate-spin text-blue-600" />
              </div>
            ) : tickets?.data?.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets?.data?.map((ticket: SupportTicket) => (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?._id === ticket._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm truncate">{ticket.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                      <span className={`px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span>#{ticket.ticketNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.assignedTo && (
                        <span className="flex items-center space-x-1">
                          <User size={12} />
                          <span>{ticket.assignedTo.firstName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "new-ticket" && (
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed description of your issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="bug_report">Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateTicket}
                disabled={!newTicketForm.title || !newTicketForm.description || createTicketMutation.isPending}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createTicketMutation.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Ticket"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportWidget;
