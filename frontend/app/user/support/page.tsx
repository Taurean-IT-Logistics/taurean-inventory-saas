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
  Info,
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
import { ClientSupportChat } from "@/components/client/ClientSupportChat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function UserSupportPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
    ticketType: "company", // "general" or "company"
    companyId: user?.company
      ? typeof user.company === "object"
        ? (user.company as { _id: string })._id
        : user.company
      : "",
  });

  // Queries
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["support-tickets", user?._id],
    queryFn: async () => {
      const response = await SupportAPI.getUserTickets();
      return response || [];
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["support-stats", user?._id],
    queryFn: async () => {
      const response = await SupportAPI.getTicketStats();
      return (
        (response as any) || {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        }
      );
    },
    enabled: !!user,
  });

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
        ticketType: "company",
        companyId: user?.company
          ? typeof user.company === "object"
            ? (user.company as { _id: string })._id
            : user.company
          : "",
      });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-stats"] });
    },
    onError: (error: any) => {
      console.error("Failed to create ticket:", error);
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: (ticketId: string) => SupportAPI.closeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-stats"] });
    },
    onError: (error: any) => {
      console.error("Failed to close ticket:", error);
    },
  });

  const reopenTicketMutation = useMutation({
    mutationFn: (ticketId: string) => SupportAPI.reopenTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-stats"] });
    },
    onError: (error: any) => {
      console.error("Failed to reopen ticket:", error);
    },
  });

  const handleCreateTicket = () => {
    if (!newTicketForm.title || !newTicketForm.description) return;

    const formData = new FormData();
    formData.append("title", newTicketForm.title);
    formData.append("description", newTicketForm.description);
    formData.append("category", newTicketForm.category);
    formData.append("priority", newTicketForm.priority);
    formData.append("ticketType", newTicketForm.ticketType);
    if (newTicketForm.companyId && newTicketForm.ticketType === "company") {
      formData.append("companyId", newTicketForm.companyId);
    }

    createTicketMutation.mutate(formData);
  };

  const filteredTickets = (tickets as SupportTicket[]).filter(
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
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-20 mt-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600">
            Get help with your account, billing, or technical issues
          </p>
        </div>
        <Button
          onClick={() => setShowTicketForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Ticket</span>
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tickets
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.open}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>My Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
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

          {/* Tickets List */}
          {ticketsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredTickets && filteredTickets.length > 0 ? (
            <div className="space-y-3">
              {filteredTickets.map((ticket: SupportTicket) => (
                <div
                  key={ticket._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">
                        {ticket.title}
                      </h3>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      {ticket.ticketType && (
                        <Badge
                          className={
                            ticket.ticketType === "general"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {ticket.ticketType === "general"
                            ? "General"
                            : "Company"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {ticket.ticketNumber} • {ticket.category} •{" "}
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {ticket.status === "closed" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reopenTicketMutation.mutate(ticket._id)}
                        disabled={reopenTicketMutation.isPending}
                      >
                        {reopenTicketMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Clock className="h-4 w-4 mr-2" />
                        )}
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeTicketMutation.mutate(ticket._id)}
                        disabled={closeTicketMutation.isPending}
                      >
                        {closeTicketMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Close
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No support tickets found</p>
              <p className="text-sm">Create a new ticket to get help</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create Support Ticket</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTicketForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  value={newTicketForm.title}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={newTicketForm.description}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detailed description of your issue"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Type
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        ticketType: value as "general" | "company",
                      })
                    }
                    value={newTicketForm.ticketType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Support</SelectItem>
                      <SelectItem value="company">Company Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        category: value,
                      })
                    }
                    value={newTicketForm.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Payment</SelectItem>
                      <SelectItem value="feature_request">
                        Feature Request
                      </SelectItem>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        priority: value,
                      })
                    }
                    value={newTicketForm.priority}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTicketForm(false)}
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
                >
                  {createTicketMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {selectedTicket && (
        <ClientSupportChat
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
