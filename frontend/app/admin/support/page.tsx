"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SupportAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  User,
  X,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Paperclip,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function SupportPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  // Queries
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
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
    enabled: !!user,
  });

  const { data: ticketDetails, refetch: refetchTicketDetails } = useQuery({
    queryKey: ["ticket-details", selectedTicket?._id],
    queryFn: () => {
      if (!selectedTicket?._id) return null;
      return SupportAPI.getTicketDetails(selectedTicket._id);
    },
    enabled: !!selectedTicket?._id && selectedTicket._id !== "super-admin",
  });

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: (formData: FormData) => SupportAPI.createTicket(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setShowTicketForm(false);
      setNewTicketForm({
        title: "",
        description: "",
        category: "general",
        priority: "medium",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (formData: FormData) =>
      SupportAPI.sendMessage(selectedTicket!._id, formData),
    onSuccess: () => {
      refetchTicketDetails();
      setNewMessage("");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: string; assignedTo?: string }) =>
      SupportAPI.updateTicketStatus(selectedTicket!._id, data),
    onSuccess: () => {
      refetchTicketDetails();
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });

  const handleCreateTicket = () => {
    const formData = new FormData();
    formData.append("title", newTicketForm.title);
    formData.append("description", newTicketForm.description);
    formData.append("category", newTicketForm.category);
    formData.append("priority", newTicketForm.priority);

    createTicketMutation.mutate(formData);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const formData = new FormData();
    formData.append("message", newMessage);
    formData.append("messageType", "text");

    sendMessageMutation.mutate(formData);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Filter tickets
  const filteredTickets =
    (tickets as any)?.data?.filter((ticket: SupportTicket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    }) || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600">
            Manage support tickets and customer inquiries
          </p>
        </div>
        <Button
          onClick={() => setShowTicketForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Ticket List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-4">Tickets</h2>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4">
              {ticketsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (filteredTickets as any).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(filteredTickets as any).map((ticket: SupportTicket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicket?._id === ticket._id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm truncate flex-1 mr-2">
                          {ticket.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(ticket.status)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                        <span>#{ticket.ticketNumber}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          {ticket.company && (
                            <span className="flex items-center space-x-1">
                              <Building className="w-3 h-3" />
                              <span>{ticket.company.name}</span>
                            </span>
                          )}
                          {ticket.assignedTo && (
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>
                                {ticket.assignedTo.firstName || "Unknown"}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow border">
              {/* Ticket Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">
                    {selectedTicket.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                        selectedTicket.priority
                      )}`}
                    >
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>#{selectedTicket.ticketNumber}</span>
                  <span>•</span>
                  <span>
                    {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>
                      {selectedTicket.user.firstName}{" "}
                      {selectedTicket.user.lastName}
                    </span>
                  </span>
                  {selectedTicket.company && (
                    <>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{selectedTicket.company.name}</span>
                      </span>
                    </>
                  )}
                </div>

                <p className="text-gray-700 mt-2">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Messages */}
              <div className="p-4 h-96 overflow-y-auto">
                {(ticketDetails as any)?.messages?.map(
                  (msg: SupportMessage) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender._id === user?._id
                          ? "justify-end"
                          : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender._id === user?._id
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
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-xs"
                              >
                                <Paperclip className="w-3 h-3" />
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
                  )
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !newMessage.trim() || sendMessageMutation.isPending
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow border p-8 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a ticket
              </h3>
              <p className="text-gray-600">
                Choose a ticket from the list to view details and respond
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Support Ticket</h3>
              <button
                onClick={() => setShowTicketForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Show company info for admin/staff users */}
              {user?.company &&
                typeof user.company === "object" &&
                (user.company as any).name && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Creating ticket for: {(user.company as any).name}
                      </span>
                    </div>
                  </div>
                )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTicketForm.title}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTicketForm.description}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  placeholder="Detailed description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
                    onChange={(e) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowTicketForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTicket}
                  disabled={
                    !newTicketForm.title ||
                    !newTicketForm.description ||
                    createTicketMutation.isPending
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {createTicketMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Ticket"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
