"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SupportAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupportWebSocket } from "@/hooks/useSupportWebSocket";
import { WebSocketStatus } from "@/components/ui/WebSocketStatus";
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
  Info,
  RefreshCw,
  Users,
  AlertTriangle,
  Circle,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  ticketType?: "general" | "company";
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
  const { user, tokens } = useAuth();
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
    companyId: user?.company
      ? typeof user.company === "object"
        ? (user.company as { _id: string })._id
        : user.company
      : "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for staff assignment
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignData, setReassignData] = useState({
    ticketId: "",
    newStaffId: "",
    reason: "",
  });

  // Check if user has permission to access the selected ticket
  const hasTicketPermission = useMemo(() => {
    if (!selectedTicket || !user) return false;

    // Super admin can access all tickets
    if (user.isSuperAdmin) return true;

    // Staff and admin can only access tickets from their company
    const userCompanyId =
      typeof user.company === "object"
        ? (user.company as any)._id
        : user.company;
    const ticketCompanyId = selectedTicket.company?._id;

    // Check if user is from the same company
    if (userCompanyId !== ticketCompanyId) return false;

    // Check if ticket is already being answered by another staff member
    if (
      selectedTicket.assignedTo &&
      selectedTicket.assignedTo._id !== user?.id
    ) {
      return false; // Ticket is assigned to someone else
    }

    return true;
  }, [selectedTicket, user]);

  // WebSocket integration - Allow typing events even without full permission
  const { socket, isTyping, typingUsers, startTyping, stopTyping } =
    useSupportWebSocket({
      ticketId: selectedTicket?._id, // Always join ticket room for typing events
      companyId:
        selectedTicket?.company?._id ||
        (typeof user?.company === "object"
          ? (user?.company as any)?._id
          : user?.company),
      userType: "staff",
      onMessageReceived: (data) => {
        // Messages are automatically refreshed by the WebSocket hook
        // No need to manually invalidate queries here
      },
      onTicketUpdated: (data) => {
        // Tickets are automatically refreshed by the WebSocket hook
        // No need to manually invalidate queries here
      },
    });

  // Queries
  const {
    data: tickets = [],
    isLoading: ticketsLoading,
    error: ticketsError,
  } = useQuery({
    queryKey: ["support-tickets", user?.id, user?.role, user?.company],
    queryFn: async () => {
      let response;
      if (user?.isSuperAdmin) {
        response = await SupportAPI.getSuperAdminTickets();
      } else if (["admin", "staff"].includes(user?.role || "")) {
        response = await SupportAPI.getStaffTickets();
      }

      return response || [];
    },
    enabled: !!user,
    staleTime: 30000, // Keep data fresh for 30 seconds
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Get available staff for assignment
  const { data: availableStaff = [] } = useQuery({
    queryKey: ["available-staff", user?.company],
    queryFn: async () => {
      if (!user?.company) return [];
      const response = await SupportAPI.getAvailableStaff();
      return (response as any)?.data || [];
    },
    enabled: !!user?.company && ["admin", "staff"].includes(user?.role || ""),
  });

  const { data: ticketDetails, refetch: refetchTicketDetails } = useQuery({
    queryKey: ["ticket-details", selectedTicket?._id],
    queryFn: async () => {
      if (!selectedTicket?._id) return null;
      try {
        const response = await SupportAPI.getTicketDetails(selectedTicket._id);
        return (response as any)?.data || null;
      } catch (error: any) {
        console.error("Failed to fetch ticket details:", error);
        if (error?.response?.status === 403) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this ticket.",
            variant: "destructive",
          });
          setSelectedTicket(null);
        }
        return null;
      }
    },
    enabled: !!selectedTicket?._id && hasTicketPermission,
  });

  // Fetch messages separately for the selected ticket
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["ticket-messages", selectedTicket?._id],
    queryFn: async () => {
      if (!selectedTicket?._id) return [];
      try {
        const response = await SupportAPI.getTicketMessages(selectedTicket._id);
        return (response as any) || [];
      } catch (error: any) {
        console.error("Failed to fetch ticket messages:", error);
        if (error?.response?.status === 403) {
          toast({
            title: "Access Denied",
            description:
              "You don't have permission to view messages for this ticket.",
            variant: "destructive",
          });
          setSelectedTicket(null);
        }
        return [];
      }
    },
    enabled: !!selectedTicket?._id && hasTicketPermission,
  });

  // Auto-scroll to bottom when new messages arrive or typing indicators change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: (formData: FormData) => SupportAPI.createTicket(formData),
    onSuccess: () => {
      setShowTicketForm(false);
      setNewTicketForm({
        title: "",
        description: "",
        category: "general",
        priority: "medium",
        companyId: user?.company
          ? typeof user.company === "object"
            ? (user.company as { _id: string })._id
            : user.company
          : "",
      });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: (error: any) => {
      console.error("Failed to create ticket:", error);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (formData: FormData) =>
      SupportAPI.sendMessage(selectedTicket!._id, formData),
    onSuccess: (response: any) => {
      setNewMessage("");
      stopTyping();

      // Emit WebSocket event for real-time updates
      if (socket && selectedTicket) {
        socket.emit("new-message", {
          ticketId: selectedTicket._id,
          message: response?.data || response,
        });
      }
    },
    onError: (error: any) => {
      console.error("Failed to send message", error);
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: (ticketId: string) => SupportAPI.closeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      if (selectedTicket) {
        setSelectedTicket(null);
      }
    },
    onError: (error: any) => {
      console.error("Failed to close ticket:", error);
    },
  });

  const reopenTicketMutation = useMutation({
    mutationFn: (ticketId: string) => SupportAPI.reopenTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: (error: any) => {
      console.error("Failed to reopen ticket:", error);
    },
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      SupportAPI.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: (error: any) => {
      console.error("Failed to update ticket status:", error);
    },
  });

  const reassignTicketMutation = useMutation({
    mutationFn: ({
      ticketId,
      newStaffId,
      reason,
    }: {
      ticketId: string;
      newStaffId: string;
      reason?: string;
    }) => SupportAPI.reassignTicket(ticketId, newStaffId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-details"] });
      toast({
        title: "Success",
        description: "Ticket reassigned successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to reassign ticket:", error);
      toast({
        title: "Error",
        description: "Failed to reassign ticket",
        variant: "destructive",
      });
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: ({
      ticketId,
      staffId,
    }: {
      ticketId: string;
      staffId: string;
    }) => SupportAPI.assignTicket(ticketId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-details"] });
      toast({
        title: "Success",
        description: "Ticket assigned successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to assign ticket:", error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    },
  });

  const handleCreateTicket = () => {
    if (!newTicketForm.title || !newTicketForm.description) return;

    const formData = new FormData();
    formData.append("title", newTicketForm.title);
    formData.append("description", newTicketForm.description);
    formData.append("category", newTicketForm.category);
    formData.append("priority", newTicketForm.priority);
    if (newTicketForm.companyId) {
      formData.append("companyId", newTicketForm.companyId);
    }

    createTicketMutation.mutate(formData);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const formData = new FormData();
    formData.append("message", newMessage.trim());

    sendMessageMutation.mutate(formData);
  };

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      startTyping();
    }
  };

  const handleMessageInputBlur = () => {
    stopTyping();
  };

  const filteredTickets = (tickets as SupportTicket[])?.filter(
    (ticket: SupportTicket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    }
  );

  // Handle staff reassignment
  const handleReassignTicket = (ticketId: string) => {
    setReassignData({ ticketId, newStaffId: "", reason: "" });
    setShowReassignModal(true);
  };

  const handleConfirmReassign = () => {
    if (!reassignData.newStaffId) {
      toast({
        title: "Error",
        description: "Please select a staff member",
        variant: "destructive",
      });
      return;
    }

    reassignTicketMutation.mutate({
      ticketId: reassignData.ticketId,
      newStaffId: reassignData.newStaffId,
      reason: reassignData.reason,
    });

    setShowReassignModal(false);
    setReassignData({ ticketId: "", newStaffId: "", reason: "" });
  };

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Circle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "waiting":
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "secondary";
      case "medium":
        return "default";
      case "high":
        return "destructive";
      case "urgent":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "default";
      case "waiting":
        return "secondary";
      case "resolved":
        return "default";
      case "closed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Support Management
              </h1>
              <p className="text-gray-600">
                Manage support tickets and provide customer assistance
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <WebSocketStatus socket={socket} />
            </div>
          </div>
        </div>

        {/* Chat Widget Info */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              Integrated Support System
            </CardTitle>
            <CardDescription className="text-blue-700">
              The chat widget in the bottom-right corner provides quick access
              to support features. This page offers a full-screen interface for
              comprehensive ticket management.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <MessageSquare className="h-4 w-4" />
              <span>
                Use the chat widget for quick support or this interface for
                detailed management
              </span>
            </div>
          </CardContent>
        </Card>

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
                    <Select
                      onValueChange={(value) => setStatusFilter(value)}
                      value={statusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      onValueChange={(value) => setPriorityFilter(value)}
                      value={priorityFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
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
                    {(filteredTickets as any)?.map((ticket: SupportTicket) => (
                      <div
                        key={ticket._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTicket?._id === ticket._id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        } ${
                          ticket.assignedTo &&
                          ticket.assignedTo._id !== user?.id
                            ? "border-orange-300 bg-orange-50"
                            : ""
                        } ${
                          !user?.isSuperAdmin &&
                          (typeof user?.company === "object"
                            ? (user?.company as any)._id
                            : user?.company) !== ticket.company?._id
                            ? "border-red-300 bg-red-50 opacity-60"
                            : ""
                        }`}
                        onClick={() => {
                          // Check if user has permission to access this ticket
                          const userCompanyId =
                            typeof user?.company === "object"
                              ? (user?.company as any)._id
                              : user?.company;
                          const ticketCompanyId = ticket.company?._id;

                          // Super admin can access all tickets
                          if (user?.isSuperAdmin) {
                            setSelectedTicket(ticket);
                            return;
                          }

                          // Staff can only access tickets from their company
                          if (userCompanyId !== ticketCompanyId) {
                            toast({
                              title: "Access Denied",
                              description:
                                "You don't have permission to access tickets from other companies.",
                              variant: "destructive",
                            });
                            return;
                          }

                          // Check if ticket is already assigned to another staff member
                          if (
                            ticket.assignedTo &&
                            ticket.assignedTo._id !== user?.id
                          ) {
                            toast({
                              title: "Ticket Already Assigned",
                              description: `This ticket is currently being handled by ${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}. You cannot access it while they are working on it.`,
                              variant: "destructive",
                            });
                            return;
                          }

                          // User has permission to access this ticket
                          setSelectedTicket(ticket);
                        }}
                        title={
                          ticket.assignedTo &&
                          ticket.assignedTo._id !== user?.id
                            ? `Assigned to ${ticket.assignedTo.name}`
                            : undefined
                        }
                      >
                        <div className="flex  flex-col justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ticket.title}</span>
                            <Badge variant={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <Badge variant={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                            {ticket.ticketType && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  ticket.ticketType === "general"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {ticket.ticketType === "general"
                                  ? "General"
                                  : "Company"}
                              </span>
                            )}
                            {/* Assignment indicator */}
                            {ticket.assignedTo && (
                              <Badge
                                variant={
                                  ticket.assignedTo._id === user?.id
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {ticket.assignedTo._id === user?.id
                                  ? "Assigned to you"
                                  : `Assigned to ${ticket.assignedTo.name}`}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-2 text-left">
                            {formatDistanceToNow(new Date(ticket.createdAt))}
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
                      <Badge variant={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={getPriorityColor(selectedTicket.priority)}
                      >
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>#{selectedTicket.ticketNumber}</span>
                      <span>•</span>
                      <span>
                        {new Date(
                          selectedTicket.createdAt
                        ).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{selectedTicket.user.name}</span>
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

                    {/* Ticket Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {selectedTicket.status === "closed" ? (
                        <Button
                          onClick={() =>
                            reopenTicketMutation.mutate(selectedTicket._id)
                          }
                          disabled={reopenTicketMutation.isPending}
                          variant="outline"
                        >
                          {reopenTicketMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Reopen
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            closeTicketMutation.mutate(selectedTicket._id)
                          }
                          disabled={closeTicketMutation.isPending}
                          variant="outline"
                        >
                          {reopenTicketMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Close
                        </Button>
                      )}

                      {/* Staff Assignment */}
                      {["admin", "staff"].includes(user?.role || "") && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedTicket.assignedTo || ""}
                            onValueChange={(value) => {
                              if (
                                value &&
                                value !== selectedTicket.assignedTo
                              ) {
                                // Assign ticket to staff
                                assignTicketMutation.mutate({
                                  ticketId: selectedTicket._id,
                                  staffId: value,
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assign to staff" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">
                                Unassigned
                              </SelectItem>
                              {availableStaff.map((staff: any) => (
                                <SelectItem key={staff._id} value={staff._id}>
                                  {staff.firstName} {staff.lastName} (
                                  {staff.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Reassign Button */}
                          {selectedTicket.assignedTo && (
                            <Button
                              onClick={() =>
                                handleReassignTicket(selectedTicket._id)
                              }
                              variant="outline"
                              size="sm"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Reassign
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Status Update */}
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(status) => {
                          updateTicketStatusMutation.mutate({
                            ticketId: selectedTicket._id,
                            status,
                          });
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Assignment Warning */}
                {selectedTicket.assignedTo &&
                  selectedTicket.assignedTo._id !== user?.id && (
                    <div className="p-4 bg-orange-50 border-b border-orange-200">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800">
                          <strong>Ticket in Use:</strong> This ticket is
                          currently being handled by{" "}
                          <span className="font-medium">
                            {selectedTicket.assignedTo.firstName}{" "}
                            {selectedTicket.assignedTo.lastName}
                          </span>
                          . You can reassign it to yourself or another staff
                          member if needed.
                        </span>
                      </div>
                    </div>
                  )}

                {/* Ticket Description */}
                <div className="p-4">
                  <p className="text-gray-700 mt-2">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Messages */}
                <div className="h-96 bg-gray-50">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-3">
                      {messages && messages.length > 0 ? (
                        (messages as SupportMessage[]).map(
                          (msg: SupportMessage) => {
                            const isCurrentUser = msg.sender?._id === user?.id;
                            const isSystem = msg.senderType === "system";
                            const isStaff = msg.senderType === "staff";

                            return (
                              <div
                                key={msg._id}
                                className={`flex mb-3 ${
                                  isCurrentUser
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                {!isCurrentUser && !isSystem && (
                                  <div className="flex items-end mr-2 mb-1">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                      {msg.sender?.username
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
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
                                    borderBottomRightRadius: isCurrentUser
                                      ? 8
                                      : 16,
                                    borderBottomLeftRadius: !isCurrentUser
                                      ? 8
                                      : 16,
                                  }}
                                >
                                  {/* Sender name for non-system messages */}
                                  {!isSystem && !isCurrentUser && (
                                    <div className="text-xs font-medium text-gray-600 mb-1">
                                      {msg.sender?.username || "Unknown User"}
                                      {isStaff && (
                                        <span className="ml-2 text-blue-600 text-xs">
                                          Staff
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Message content */}
                                  <div className="text-sm break-words whitespace-pre-line leading-relaxed">
                                    {msg.message}
                                  </div>

                                  {/* Attachments */}
                                  {msg.attachments &&
                                    msg.attachments.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {msg.attachments.map(
                                          (attachment, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center space-x-2 text-xs"
                                            >
                                              <Paperclip className="w-3 h-3" />
                                              <span className="underline cursor-pointer hover:text-blue-600">
                                                {attachment.split("/").pop()}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}

                                  {/* Timestamp */}
                                  <div
                                    className={`text-xs mt-2 ${
                                      isCurrentUser
                                        ? "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
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
                                      {user?.username
                                        ?.charAt(0)
                                        ?.toUpperCase() || "A"}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No messages yet</p>
                          <p className="text-sm">
                            Start the conversation by sending a message
                          </p>
                        </div>
                      )}

                      {/* Typing indicators */}
                      {typingUsers.size > 0 && (
                        <div className="flex justify-start">
                          <div className="flex items-end mr-2 mb-1">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              U
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
                                  ? "User is typing..."
                                  : `${
                                      Array.from(typingUsers).length
                                    } users are typing...`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Permission Warning */}
                {!hasTicketPermission && (
                  <div className="p-4 bg-red-50 border-b border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        <strong>Access Restricted:</strong> You don&apos;t have
                        permission to send messages to this ticket.
                        {selectedTicket.assignedTo &&
                          selectedTicket.assignedTo._id !== user?.id && (
                            <>
                              {" "}
                              It&apos;s currently being handled by{" "}
                              <span className="font-medium">
                                {selectedTicket.assignedTo.firstName}{" "}
                                {selectedTicket.assignedTo.lastName}
                              </span>
                              .
                            </>
                          )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
                    <Input
                      value={newMessage}
                      onChange={handleMessageInputChange}
                      onBlur={handleMessageInputBlur}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        hasTicketPermission &&
                        handleSendMessage()
                      }
                      placeholder={
                        hasTicketPermission
                          ? "Type your message..."
                          : "No permission to send messages"
                      }
                      disabled={!hasTicketPermission}
                      className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none px-0 py-0 text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        !newMessage.trim() ||
                        sendMessageMutation.isPending ||
                        !hasTicketPermission
                      }
                      className="bg-blue-600 hover:bg-blue-700 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
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

      {/* Reassignment Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Reassign Ticket</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select New Staff Member
                </label>
                <Select
                  value={reassignData.newStaffId}
                  onValueChange={(value) =>
                    setReassignData({ ...reassignData, newStaffId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff
                      .filter(
                        (staff: any) => staff._id !== selectedTicket?.assignedTo
                      )
                      .map((staff: any) => (
                        <SelectItem key={staff._id} value={staff._id}>
                          {staff.firstName} {staff.lastName} ({staff.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for Reassignment (Optional)
                </label>
                <Textarea
                  placeholder="e.g., Need someone with booking permissions, Staff unavailable..."
                  value={reassignData.reason}
                  onChange={(e) =>
                    setReassignData({ ...reassignData, reason: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowReassignModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReassign}
                disabled={reassignTicketMutation.isPending}
              >
                {reassignTicketMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                Reassign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
