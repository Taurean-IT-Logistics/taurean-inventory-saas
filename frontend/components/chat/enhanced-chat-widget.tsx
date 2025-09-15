"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Paperclip,
  FileText,
  User,
  Loader2,
  HelpCircle,
  Plus,
  MessageSquare,
} from "lucide-react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { SupportAPI, CompaniesAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../AuthProvider";
import { Textarea } from "../ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: "chat" | "support";
}

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

export function EnhancedChatWidget() {
  const { user, tokens } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeMode, setActiveMode] = useState<"chat" | "support">("chat");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your facility booking assistant. I can help with bookings, pricing, and support tickets. How can I assist you today?",
      isBot: true,
      timestamp: new Date(),
      type: "chat",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support ticket form state
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
    companyId: "",
    isGeneralTicket: false, // New field to indicate general support tickets
  });

  // Initialize companyId when user changes
  useEffect(() => {
    if (user?.company) {
      const companyId = getCompanyId(user.company);
      setNewTicketForm((prev) => ({
        ...prev,
        companyId: companyId || "",
      }));
    }
  }, [user?.company]);

  // Queries
  const {
    data: tickets,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ["support-tickets", user?._id],
    queryFn: () => {
      if (user?.isSuperAdmin) {
        return SupportAPI.getSuperAdminTickets();
      } else if (["admin", "staff"].includes(user?.role || "")) {
        return SupportAPI.getStaffTickets();
      } else {
        return SupportAPI.getUserTickets();
      }
    },
    enabled: !!user && isOpen && activeMode === "support",
  });

  // Fetch companies for ticket creation (only for super admins or when user has no company)
  const {
    data: companies,
    isLoading: isCompaniesLoading,
    isError: isCompaniesError,
    refetch: refetchCompanies,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: () => CompaniesAPI.list(),
    enabled: !!user && (user.isSuperAdmin || !user.company),
  });

  const { data: ticketDetails, refetch: refetchTicketDetails } = useQuery({
    queryKey: ["ticket-details", selectedTicket?._id],
    queryFn: () => SupportAPI.getTicketDetails(selectedTicket!._id),
    enabled: !!selectedTicket?._id && activeMode === "support",
  });

  // Helper function to get company ID
  const getCompanyId = (userCompany: any): string => {
    if (!userCompany) return "";
    return typeof userCompany === "object" ? userCompany._id : userCompany;
  };

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: (formData: FormData) => SupportAPI.createTicket(formData),
    onSuccess: (data) => {
      console.log("Ticket created successfully:", data);

      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      refetchTickets();

      // Reset form and close
      setShowTicketForm(false);
      setNewTicketForm({
        title: "",
        description: "",
        category: "general",
        priority: "medium",
        companyId: user?.company ? getCompanyId(user.company) : "",
        isGeneralTicket: false,
      });

      // Show success toast
      toast({
        title: "Success",
        description:
          "Support ticket created successfully! A staff member will respond shortly.",
        variant: "default",
      });

      // Add success message to chat
      const successMessage: Message = {
        id: Date.now().toString(),
        text: "Support ticket created successfully! A staff member will respond shortly.",
        isBot: true,
        timestamp: new Date(),
        type: "support",
      };
      setMessages((prev) => [...prev, successMessage]);

      // Switch to support mode to show the new ticket
      setActiveMode("support");
    },
    onError: (error: any) => {
      console.error("Failed to create ticket:", error);

      // Show detailed error information
      let errorMessage = "Failed to create support ticket. Please try again.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (formData: FormData) =>
      SupportAPI.sendMessage(selectedTicket!._id, formData),
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);

      // Invalidate and refetch queries
      refetchTicketDetails();
      refetchTickets();
      setInputValue("");

      // Show success toast
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
        variant: "default",
      });

      if (socket) {
        socket.emit("new-message", {
          ticketId: selectedTicket!._id,
          message: inputValue,
        });
      }
    },
    onError: (error: any) => {
      console.error("Failed to send message:", error);

      // Show detailed error information
      let errorMessage = "Failed to send message. Please try again.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Socket connection for support
  useEffect(() => {
    if (isOpen && user && activeMode === "support") {
      console.log("Attempting to connect to socket...");

      const newSocket = io(
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",
        {
          auth: {
            token: tokens?.accessToken,
          },
          transports: ["websocket", "polling"],
          timeout: 10000,
        }
      );

      newSocket.on("connect", () => {
        console.log("Support socket connected successfully");
      });

      newSocket.on("message-received", (data) => {
        if (data.ticketId === selectedTicket?._id) {
          refetchTicketDetails();
          refetchTickets();
        }
      });

      newSocket.on("ticket-created", (data) => {
        refetchTickets();
      });

      newSocket.on("ticket-updated", (data) => {
        refetchTicketDetails();
        refetchTickets();
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("typing", (data) => {
        if (data.userId !== user?._id) {
          if (data.isTyping) {
            setTypingUsers((prev) => new Set(prev).add(data.userId));
          } else {
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }
        }
      });

      // Join ticket room when a ticket is selected
      if (selectedTicket?._id) {
        newSocket.emit("join-ticket", selectedTicket._id);
      }

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket connection");
        if (selectedTicket?._id) {
          newSocket.emit("leave-ticket", selectedTicket._id);
        }
        newSocket.close();
      };
    }
  }, [
    isOpen,
    user,
    activeMode,
    selectedTicket?._id,
    refetchTicketDetails,
    refetchTickets,
    tokens?.accessToken,
  ]);

  // Join ticket room when ticket selection changes
  useEffect(() => {
    if (socket && selectedTicket?._id) {
      socket.emit("join-ticket", selectedTicket._id);

      return () => {
        socket.emit("leave-ticket", selectedTicket._id);
      };
    }
  }, [socket, selectedTicket?._id]);

  // Auto-scroll to bottom of messages
  const ticketDetailsMessages = (ticketDetails as any)?.messages;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ticketDetailsMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (activeMode === "chat") {
      // Handle facility assistant chat
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isBot: false,
        timestamp: new Date(),
        type: "chat",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      // Simulate AI response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(inputValue),
          isBot: true,
          timestamp: new Date(),
          type: "chat",
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
    } else if (activeMode === "support" && selectedTicket) {
      // Handle support message
      const formData = new FormData();
      formData.append("message", inputValue);
      formData.append("messageType", "text");

      sendMessageMutation.mutate(formData);
    } else if (activeMode === "support" && !selectedTicket) {
      toast({
        title: "Error",
        description: "Please select a support ticket to send a message.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTicket = () => {
    // Validate form
    if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and description fields.",
        variant: "destructive",
      });
      return;
    }

    // Determine company ID based on user choice
    let companyId = newTicketForm.companyId;

    // If user chose general support, don't require company
    if (newTicketForm.isGeneralTicket) {
      companyId = ""; // General ticket - no company assigned
    } else if (!companyId && user?.company) {
      // Use user's company as default if available
      companyId = getCompanyId(user.company);
    }

    const formData = new FormData();
    formData.append("title", newTicketForm.title.trim());
    formData.append("description", newTicketForm.description.trim());
    formData.append("category", newTicketForm.category);
    formData.append("priority", newTicketForm.priority);
    if (companyId) {
      formData.append("companyId", companyId);
    }

    // Test toast before mutation
    toast({
      title: "Creating Ticket",
      description: "Please wait while we create your support ticket...",
      variant: "default",
    });

    createTicketMutation.mutate(formData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedTicket || activeMode !== "support") {
      toast({
        title: "Error",
        description:
          "Please select a ticket and ensure you're in support mode to upload files.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Check file size and type
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/*", ".pdf", ".doc", ".docx", ".txt"];

    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast({
          title: "Error",
          description: `File ${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Uploading",
      description: `Uploading ${files.length} file${
        files.length > 1 ? "s" : ""
      }...`,
      variant: "default",
    });

    const formData = new FormData();
    formData.append("message", "File uploaded");
    formData.append("messageType", "file");

    Array.from(files).forEach((file) => {
      formData.append("attachments", file);
    });

    sendMessageMutation.mutate(formData);
  };

  const handleBackToTickets = () => {
    setSelectedTicket(null);
    setShowTicketForm(false);
    refetchTickets();
  };

  const handleModeSwitch = (mode: "chat" | "support") => {
    setActiveMode(mode);
    setSelectedTicket(null);
    setShowTicketForm(false);

    if (mode === "chat") {
      setMessages([
        {
          id: "1",
          text: "Hi! I'm your facility booking assistant. I can help with bookings, pricing, and support tickets. How can I assist you today?",
          isBot: true,
          timestamp: new Date(),
          type: "chat",
        },
      ]);
    }
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("price") || lowerInput.includes("cost")) {
      return "Our facility prices vary by location and amenities. Most facilities range from GH₵50-500 per day. Would you like me to show you available facilities in a specific area?";
    }
    if (lowerInput.includes("book") || lowerInput.includes("reserve")) {
      return "I can help you book a facility! Please tell me your preferred location, dates, and any specific requirements you have.";
    }
    if (lowerInput.includes("available") || lowerInput.includes("free")) {
      return "I can check availability for you. Which area are you interested in and what dates do you need?";
    }
    if (
      lowerInput.includes("support") ||
      lowerInput.includes("help") ||
      lowerInput.includes("issue")
    ) {
      return "I can help you create a support ticket for any issues you're experiencing. Would you like me to switch to support mode?";
    }
    return "I understand you're looking for facility information. I can help with bookings, pricing, availability, and support. What specific information do you need?";
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
        return "text-gray-600 bg-green-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case "in_progress":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case "resolved":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "closed":
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => {
                setIsOpen(true);
              }}
              className="w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              height: isMinimized ? 60 : 500,
            }}
            exit={{ scale: 0, opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border z-50 overflow-hidden"
          >
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-medium">
                  {activeMode === "chat"
                    ? "Facility Assistant"
                    : "Support Center"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsMinimized(!isMinimized);
                  }}
                  className="text-white hover:bg-slate-800 p-1"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="text-white hover:bg-slate-800 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mode switcher */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleModeSwitch("chat")}
                className={`w-1/2 py-2 px-4 text-sm font-medium transition-colors ${
                  activeMode === "chat"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => handleModeSwitch("support")}
                className={`w-1/2 py-2 px-4 text-sm font-medium transition-colors ${
                  activeMode === "support"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Support
              </button>
            </div>

            {/* Chat content - only show when not minimized */}
            {!isMinimized && (
              <>
                {activeMode === "chat" ? (
                  <>
                    {/* Messages */}
                    <ScrollArea className="h-64 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.isBot ? "justify-start" : "justify-end"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                message.isBot
                                  ? "bg-gray-100 text-gray-900"
                                  : "bg-slate-900 text-white"
                              }`}
                            >
                              {message.text}
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div ref={messagesEndRef} />
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask about facilities or get support..."
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Support Mode Content */}
                    <div className="h-64 overflow-y-auto p-4">
                      {!selectedTicket && !showTicketForm ? (
                        <div className="space-y-4">
                          {/* Header with create button */}
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">
                              Support Tickets
                            </h3>
                            <button
                              onClick={() => {
                                setShowTicketForm(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                            >
                              <Plus size={12} />
                              <span>New Ticket</span>
                            </button>
                          </div>

                          {/* Existing tickets */}
                          {ticketsLoading ? (
                            <div className="flex items-center justify-center h-20">
                              <Loader2
                                size={20}
                                className="animate-spin text-blue-600"
                              />
                            </div>
                          ) : (tickets as any)?.data?.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                              <MessageSquare
                                size={32}
                                className="mx-auto mb-2 text-gray-300"
                              />
                              <p className="text-sm">No tickets found</p>
                              <button
                                onClick={() => setShowTicketForm(true)}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                Create your first ticket
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {(tickets as any)?.data?.map(
                                (ticket: SupportTicket) => (
                                  <div
                                    key={ticket._id}
                                    onClick={() => {
                                      setSelectedTicket(ticket);
                                    }}
                                    className="p-3 border rounded-lg cursor-pointer transition-colors hover:border-blue-300 hover:bg-blue-50"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-medium text-sm truncate flex-1 mr-2">
                                        {ticket.title}
                                      </h4>
                                      <div className="flex items-center space-x-2">
                                        {getStatusIcon(ticket.status)}
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            ticket.status
                                          )}`}
                                        >
                                          {ticket.status.replace("_", " ")}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`px-2 py-1 rounded-full ${getPriorityColor(
                                            ticket.priority
                                          )}`}
                                        >
                                          {ticket.priority}
                                        </span>
                                        <span>#{ticket.ticketNumber}</span>
                                      </div>
                                      <span>
                                        {new Date(
                                          ticket.updatedAt
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {ticket.description && (
                                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                        {ticket.description}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ) : showTicketForm ? (
                        <div className="space-y-4">
                          {/* Create new ticket */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-sm">
                              Create Support Ticket
                            </h3>
                            <Button
                              onClick={() => {
                                setShowTicketForm(false);
                              }}
                              className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              ← Back
                            </Button>
                          </div>
                          <div className="p-4 rounded-lg">
                            <div className="space-y-3">
                              <Input
                                type="text"
                                value={newTicketForm.title}
                                onChange={(e) =>
                                  setNewTicketForm({
                                    ...newTicketForm,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border  rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brief description of your issue"
                              />
                              <Textarea
                                value={newTicketForm.description}
                                onChange={(e) =>
                                  setNewTicketForm({
                                    ...newTicketForm,
                                    description: e.target.value,
                                  })
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Detailed description"
                              />
                              {/* Support Type Selection */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name="supportType"
                                      checked={newTicketForm.isGeneralTicket}
                                      onChange={() => {
                                        setNewTicketForm((prev) => ({
                                          ...prev,
                                          isGeneralTicket: true,
                                          companyId: "",
                                        }));
                                      }}
                                      className="text-blue-600"
                                    />
                                    <span className="text-sm font-medium">
                                      General Support
                                    </span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name="supportType"
                                      checked={!newTicketForm.isGeneralTicket}
                                      onChange={() => {
                                        setNewTicketForm((prev) => ({
                                          ...prev,
                                          isGeneralTicket: false,
                                        }));
                                      }}
                                      className="text-blue-600"
                                    />
                                    <span className="text-sm font-medium">
                                      Company-Specific
                                    </span>
                                  </label>
                                </div>

                                {/* Company Selection - only show if not general support */}
                                {!newTicketForm.isGeneralTicket && (
                                  <Select
                                    value={newTicketForm.companyId}
                                    onValueChange={(value) => {
                                      setNewTicketForm((prev) => ({
                                        ...prev,
                                        companyId: value,
                                      }));
                                    }}
                                  >
                                    <SelectTrigger
                                      className={
                                        isCompaniesError ? "border-red-500" : ""
                                      }
                                    >
                                      <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {isCompaniesLoading ? (
                                        <SelectItem value="loading" disabled>
                                          Loading companies...
                                        </SelectItem>
                                      ) : isCompaniesError ? (
                                        <SelectItem
                                          value="loading_failed"
                                          disabled
                                        >
                                          Failed to load companies.
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              refetchCompanies();
                                            }}
                                          >
                                            Retry
                                          </Button>
                                        </SelectItem>
                                      ) : (companies as any)?.companies &&
                                        (companies as any).companies.length >
                                          0 ? (
                                        (companies as any).companies.map(
                                          (company: {
                                            _id: string;
                                            name: string;
                                          }) => (
                                            <SelectItem
                                              key={company._id}
                                              value={company._id}
                                            >
                                              {company.name}
                                            </SelectItem>
                                          )
                                        )
                                      ) : (
                                        <SelectItem value="not_found" disabled>
                                          No companies found
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                  <Select
                                    value={newTicketForm.category}
                                    onValueChange={(value) =>
                                      setNewTicketForm({
                                        ...newTicketForm,
                                        category: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="general">
                                        General
                                      </SelectItem>
                                      <SelectItem value="technical">
                                        Technical
                                      </SelectItem>
                                      <SelectItem value="billing">
                                        Billing
                                      </SelectItem>
                                      <SelectItem value="feature_request">
                                        Feature Request
                                      </SelectItem>
                                      <SelectItem value="bug_report">
                                        Bug Report
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={newTicketForm.priority}
                                    onValueChange={(value) =>
                                      setNewTicketForm({
                                        ...newTicketForm,
                                        priority: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">
                                        Medium
                                      </SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="urgent">
                                        Urgent
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Button
                                onClick={handleCreateTicket}
                                disabled={
                                  !newTicketForm.title ||
                                  !newTicketForm.description ||
                                  createTicketMutation.isPending
                                }
                                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                              >
                                {createTicketMutation.isPending ? (
                                  <div className="flex items-center justify-center space-x-2">
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                    <span>Creating...</span>
                                  </div>
                                ) : (
                                  "Create Ticket"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Ticket Info */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-sm">
                              Ticket Details
                            </h3>
                            <Button
                              onClick={handleBackToTickets}
                              className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              ← Back
                            </Button>
                          </div>
                          <div className="p-3 border-b border-gray-200 rounded-lg mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-sm">
                                {selectedTicket?.title}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  selectedTicket?.status || "open"
                                )}`}
                              >
                                {(selectedTicket?.status || "open").replace(
                                  "_",
                                  " "
                                )}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                              <span
                                className={`px-2 py-1 rounded-full ${getPriorityColor(
                                  selectedTicket?.priority || "medium"
                                )}`}
                              >
                                {selectedTicket?.priority || "medium"}
                              </span>
                              <span>#{selectedTicket?.ticketNumber}</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {selectedTicket?.description}
                            </p>
                          </div>

                          {/* Messages */}
                          <div className="space-y-3 mb-3">
                            {(ticketDetails as any)?.messages?.map(
                              (msg: SupportMessage) => (
                                <div
                                  key={msg._id}
                                  className={`flex ${
                                    msg.sender._id === user?._id
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                      msg.sender._id === user?._id
                                        ? "bg-blue-600 text-white"
                                        : msg.senderType === "system"
                                        ? "bg-gray-200 text-gray-700"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {msg.senderType !== "system" && (
                                      <div className="text-xs opacity-75 mb-1">
                                        {msg.sender.firstName}{" "}
                                        {msg.sender.lastName}
                                      </div>
                                    )}
                                    <div>{msg.message}</div>
                                    {msg.attachments &&
                                      msg.attachments.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          {msg.attachments.map(
                                            (attachment, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center space-x-2 text-xs"
                                              >
                                                <Paperclip size={10} />
                                                <span className="underline cursor-pointer">
                                                  {attachment.split("/").pop()}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )
                            )}

                            {/* Typing indicator */}
                            {typingUsers.size > 0 && (
                              <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
                                  Someone is typing...
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Message Input */}
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={inputValue}
                              onChange={(e) => {
                                setInputValue(e.target.value);
                                if (
                                  socket &&
                                  selectedTicket?._id &&
                                  user?._id
                                ) {
                                  socket.emit("typing", {
                                    ticketId: selectedTicket._id,
                                    userId: user._id,
                                    isTyping: true,
                                  });
                                }
                              }}
                              onBlur={() => {
                                if (
                                  socket &&
                                  selectedTicket?._id &&
                                  user?._id
                                ) {
                                  socket.emit("typing", {
                                    ticketId: selectedTicket._id,
                                    userId: user._id,
                                    isTyping: false,
                                  });
                                }
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleSendMessage();
                                  if (
                                    socket &&
                                    selectedTicket?._id &&
                                    user?._id
                                  ) {
                                    socket.emit("typing", {
                                      ticketId: selectedTicket._id,
                                      userId: user._id,
                                      isTyping: false,
                                    });
                                  }
                                }
                              }}
                              placeholder="Type your message..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <Paperclip size={16} />
                            </button>
                            <button
                              onClick={handleSendMessage}
                              disabled={
                                !inputValue.trim() ||
                                sendMessageMutation.isPending
                              }
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              {sendMessageMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
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
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
