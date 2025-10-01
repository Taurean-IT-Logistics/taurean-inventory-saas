"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuperAdminAPI, TaxesAPI, TaxSchedulesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Building2,
  Users,
  Activity,
  Search,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  FileText,
  Receipt,
  Percent,
  File,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { Textarea } from "@/components/ui/textarea";

export default function SuperAdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: "",
    duration: 30,
  });
  const [selectedCompanyDetails, setSelectedCompanyDetails] =
    useState<any>(null);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: SuperAdminAPI.getSystemStatistics,
  });

  const {
    data: companiesData,
    isLoading: companiesLoading,
    isError: companiesError,
    refetch: refetchCompanies,
  } = useQuery({
    queryKey: ["super-admin-companies"],
    queryFn: SuperAdminAPI.getAllCompanies,
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["super-admin-users"],
    queryFn: SuperAdminAPI.getAllUsers,
  });

  const {
    data: activityData,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: ["super-admin-activity"],
    queryFn: () => SuperAdminAPI.getRecentActivity(10),
  });

  // Company details query
  const {
    data: companyDetailsData,
    isLoading: companyDetailsLoading,
    refetch: refetchCompanyDetails,
  } = useQuery({
    queryKey: ["super-admin-company-details", selectedCompanyDetails?._id],
    queryFn: () => SuperAdminAPI.getCompanyDetails(selectedCompanyDetails._id),
    enabled: !!selectedCompanyDetails?._id,
  });

  // Company taxes query
  const {
    data: companyTaxesData,
    isLoading: companyTaxesLoading,
    refetch: refetchCompanyTaxes,
  } = useQuery({
    queryKey: ["super-admin-company-taxes", selectedCompanyDetails?._id],
    queryFn: () => TaxesAPI.getCompanyTaxes(selectedCompanyDetails._id),
    enabled: !!selectedCompanyDetails?._id,
  });

  // Company tax schedules query
  const {
    data: companyTaxSchedulesData,
    isLoading: companyTaxSchedulesLoading,
    refetch: refetchCompanyTaxSchedules,
  } = useQuery({
    queryKey: [
      "super-admin-company-tax-schedules",
      selectedCompanyDetails?._id,
    ],
    queryFn: () =>
      TaxSchedulesAPI.getCompanyTaxSchedules(selectedCompanyDetails._id),
    enabled: !!selectedCompanyDetails?._id,
  });

  // Mutations
  const updateCompanyStatusMutation = useMutation({
    mutationFn: ({
      companyId,
      status,
    }: {
      companyId: string;
      status: string;
    }) => SuperAdminAPI.updateCompanyStatus(companyId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
      toast({
        title: "Success",
        description: "Company status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company status",
        variant: "destructive",
      });
    },
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: ({
      companyId,
      plan,
      duration,
    }: {
      companyId: string;
      plan: string;
      duration: number;
    }) => SuperAdminAPI.activateCompanySubscription(companyId, plan, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-companies"] });
      setIsSubscriptionModalOpen(false);
      toast({
        title: "Success",
        description: "Subscription activated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate subscription",
        variant: "destructive",
      });
    },
  });

  const deactivateSubscriptionMutation = useMutation({
    mutationFn: (companyId: string) =>
      SuperAdminAPI.deactivateCompanySubscription(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-companies"] });
      toast({
        title: "Success",
        description: "Subscription deactivated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate subscription",
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      SuperAdminAPI.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
      setIsUserModalOpen(false);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const assignUserToCompanyMutation = useMutation({
    mutationFn: ({
      userId,
      companyId,
    }: {
      userId: string;
      companyId: string;
    }) => SuperAdminAPI.assignUserToCompany(userId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
      setIsUserModalOpen(false);
      toast({
        title: "Success",
        description: "User assigned to company successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign user to company",
        variant: "destructive",
      });
    },
  });

  const removeUserFromCompanyMutation = useMutation({
    mutationFn: (userId: string) => SuperAdminAPI.removeUserFromCompany(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
      setIsUserModalOpen(false);
      toast({
        title: "Success",
        description: "User removed from company successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from company",
        variant: "destructive",
      });
    },
  });

  const stats = (statsData as any)?.stats || {};
  const companies = (companiesData as any)?.companies || [];
  const users = (usersData as any)?.users || [];
  const activity = (activityData as any)?.activity || {};

  const filteredCompanies = companies.filter(
    (company: any) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user: any) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "staff":
        return "bg-orange-100 text-orange-800";
      case "user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefetch = () => {
    refetchStats();
    refetchCompanies();
    refetchUsers();
    refetchActivity();
  };

  const handleActivateSubscription = () => {
    if (!selectedCompany || !subscriptionData.plan) {
      toast({
        title: "Error",
        description: "Please select a plan",
        variant: "destructive",
      });
      return;
    }

    activateSubscriptionMutation.mutate({
      companyId: selectedCompany._id,
      plan: subscriptionData.plan,
      duration: subscriptionData.duration,
    });
  };

  const handleUpdateUserRole = (role: string) => {
    if (!selectedUser) return;
    updateUserRoleMutation.mutate({
      userId: selectedUser._id,
      role,
    });
  };

  const handleAssignUserToCompany = (companyId: string) => {
    if (!selectedUser) return;
    assignUserToCompanyMutation.mutate({
      userId: selectedUser._id,
      companyId,
    });
  };

  const handleRemoveUserFromCompany = () => {
    if (!selectedUser) return;
    removeUserFromCompanyMutation.mutate(selectedUser._id);
  };

  const handleViewCompanyDetails = (company: any) => {
    setSelectedCompanyDetails(company);
    setShowCompanyDetails(true);
  };

  // Handle plan changes and update duration accordingly
  useEffect(() => {
    if (subscriptionData.plan) {
      // Set default duration based on plan
      let defaultDuration = 30;
      switch (subscriptionData.plan) {
        case "basic":
          defaultDuration = 30;
          break;
        case "premium":
          defaultDuration = 90;
          break;
        case "enterprise":
          defaultDuration = 365;
          break;
        default:
          defaultDuration = 30;
      }

      // Only update if duration hasn't been manually set to a different value
      if (
        subscriptionData.duration === 30 ||
        subscriptionData.duration === 90 ||
        subscriptionData.duration === 365
      ) {
        setSubscriptionData((prev) => ({ ...prev, duration: defaultDuration }));
      }
    }
  }, [subscriptionData.plan]);

  if (statsLoading || companiesLoading || usersLoading) {
    return <Loader text="Loading super admin dashboard..." />;
  }

  if (statsError || companiesError || usersError || activityError) {
    return (
      <ErrorComponent
        message="Error loading super admin dashboard"
        onRetry={handleRefetch}
        title="Error"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage all companies, users, and system-wide operations
          </p>
        </div>

        {/* Enhanced SuperAdmin Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View comprehensive system analytics and company performance
                metrics
              </p>
              <Button
                onClick={() => {
                  // Navigate to enhanced analytics
                  toast({
                    title: "Analytics",
                    description: "Opening enhanced analytics dashboard",
                  });
                }}
                className="w-full"
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tax Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage global tax settings and company-specific tax
                configurations
              </p>
              <Button
                onClick={() => {
                  // Navigate to tax management
                  toast({
                    title: "Tax Management",
                    description: "Opening global tax management",
                  });
                }}
                className="w-full"
                variant="outline"
              >
                Manage Taxes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Adjust company fees and manage subscription pricing
              </p>
              <Button
                onClick={() => {
                  // Navigate to fee management
                  toast({
                    title: "Fee Management",
                    description: "Opening fee management interface",
                  });
                }}
                className="w-full"
                variant="outline"
              >
                Manage Fees
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Companies
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.companies?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.companies?.active || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.users?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.users?.unassigned || 0} unassigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Facilities
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.facilities || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingJoinRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">Join requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => (window.location.href = "/super-admin/companies")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                View and manage all registered companies
              </p>
              <Button size="sm" className="w-full">
                View Companies
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => (window.location.href = "/super-admin/users")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                View and manage all system users
              </p>
              <Button size="sm" className="w-full">
                View Users
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => (window.location.href = "/super-admin/stats")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                System Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                View detailed system statistics
              </p>
              <Button size="sm" className="w-full">
                View Stats
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Super Admin License
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">License Type:</span>
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800"
                  >
                    Super Admin
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="text-xs text-gray-600">Never</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Permissions:</span>
                  <span className="text-xs text-gray-600">Full Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => (window.location.href = "/super-admin/activity")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Activity Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Monitor system activities and events
              </p>
              <Button size="sm" className="w-full">
                View Logs
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Monitor security and access controls
              </p>
              <Button size="sm" className="w-full" variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="space-y-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`px-4 py-2 font-medium ${
                selectedTab === "overview"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab("companies")}
              className={`px-4 py-2 font-medium ${
                selectedTab === "companies"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setSelectedTab("users")}
              className={`px-4 py-2 font-medium ${
                selectedTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setSelectedTab("activity")}
              className={`px-4 py-2 font-medium ${
                selectedTab === "activity"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => (window.location.href = "/super-admin/activity")}
              className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700"
            >
              Activity Logs
            </button>
          </div>

          {/* Overview Tab */}
          {selectedTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activity.recentBookings
                        ?.slice(0, 5)
                        .map((booking: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {(booking.user as any)?.name || "Unknown User"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Booked{" "}
                                {(booking.facility as any)?.name ||
                                  "Unknown Facility"}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {format(new Date(booking.createdAt), "MMM dd")}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Companies Active</span>
                        <Badge className="bg-green-100 text-green-800">
                          {stats.companies?.active || 0}/
                          {stats.companies?.total || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Users Assigned</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {stats.users?.assigned || 0}/{stats.users?.total || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending Requests</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {stats.pendingJoinRequests || 0}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Companies Tab */}
          {selectedTab === "companies" && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company: any) => (
                  <Card
                    key={company._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {company.name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewCompanyDetails(company)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCompany(company);
                                setIsCompanyModalOpen(true);
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Quick View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCompany(company);
                                setIsSubscriptionModalOpen(true);
                              }}
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Manage Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                updateCompanyStatusMutation.mutate({
                                  companyId: company._id,
                                  status:
                                    company.subscription?.status === "active"
                                      ? "inactive"
                                      : "active",
                                });
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {company.subscription?.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-gray-600">
                        {company.description}
                      </p>
                      <Badge
                        className={getSubscriptionStatusColor(
                          company.subscription?.status || "inactive"
                        )}
                      >
                        {company.subscription?.status || "inactive"}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Owner:</span>
                          <span className="font-medium">
                            {(company.owner as any)?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Users:</span>
                          <span className="font-medium">
                            {company.stats?.userCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Facilities:</span>
                          <span className="font-medium">
                            {company.stats?.facilityCount || 0}
                          </span>
                        </div>
                        {company.subscription?.expiresAt && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Expires:</span>
                            <span className="font-medium">
                              {format(
                                new Date(company.subscription.expiresAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {selectedTab === "users" && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredUsers.map((user: any) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge variant="outline">
                            {(user.company as any)?.name || "No Company"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsUserModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Manage User
                              </DropdownMenuItem>
                              {user.company && (
                                <DropdownMenuItem
                                  onClick={() => handleRemoveUserFromCompany()}
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove from Company
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity Tab */}
          {selectedTab === "activity" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activity.recentBookings?.map(
                      (booking: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {(booking.user as any)?.name || "Unknown User"}{" "}
                              booked a facility
                            </p>
                            <p className="text-xs text-gray-500">
                              Company:{" "}
                              {(booking.company as any)?.name || "Unknown"}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {format(
                              new Date(booking.createdAt),
                              "MMM dd, h:mm a"
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Company Details Modal */}
      <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompany.name}
                      </p>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompany.description}
                      </p>
                    </div>
                    <div>
                      <Label>Owner</Label>
                      <p className="text-sm text-gray-600">
                        {(selectedCompany.owner as any)?.name} (
                        {(selectedCompany.owner as any)?.email})
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Subscription</h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Status</Label>
                      <Badge
                        className={getSubscriptionStatusColor(
                          selectedCompany.subscription?.status || "inactive"
                        )}
                      >
                        {selectedCompany.subscription?.status || "inactive"}
                      </Badge>
                    </div>
                    <div>
                      <Label>Plan</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompany.subscription?.plan || "No plan"}
                      </p>
                    </div>
                    {selectedCompany.subscription?.expiresAt && (
                      <div>
                        <Label>Expires</Label>
                        <p className="text-sm text-gray-600">
                          {format(
                            new Date(selectedCompany.subscription.expiresAt),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCompany.stats?.userCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Users</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCompany.stats?.facilityCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Facilities</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedCompany.stats?.bookingCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Bookings</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedCompany.stats?.transactionCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Transactions</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Management Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm text-gray-600">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Current Role</Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label>Current Company</Label>
                  <p className="text-sm text-gray-600">
                    {(selectedUser.company as any)?.name || "No Company"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Update Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={handleUpdateUserRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Assign to Company</Label>
                  <Select
                    value={(selectedUser.company as any)?._id || ""}
                    onValueChange={handleAssignUserToCompany}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Company</SelectItem>
                      {companies.map((company: any) => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Management Modal */}
      <Dialog
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div>
                <Label>Company</Label>
                <p className="text-sm text-gray-600">{selectedCompany.name}</p>
              </div>
              <div>
                <Label>Current Status</Label>
                <Badge
                  className={getSubscriptionStatusColor(
                    selectedCompany.subscription?.status || "inactive"
                  )}
                >
                  {selectedCompany.subscription?.status || "inactive"}
                </Badge>
              </div>
              <div>
                <Label>Plan</Label>
                <Select
                  value={subscriptionData.plan}
                  onValueChange={(value) =>
                    setSubscriptionData((prev) => ({ ...prev, plan: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (days)</Label>
                <Select
                  value={subscriptionData.duration.toString()}
                  onValueChange={(value) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      duration: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsSubscriptionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleActivateSubscription}
                  disabled={activateSubscriptionMutation.isPending}
                >
                  {activateSubscriptionMutation.isPending
                    ? "Activating..."
                    : "Activate Subscription"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comprehensive Company Details Modal */}
      <Dialog open={showCompanyDetails} onOpenChange={setShowCompanyDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Details - {selectedCompanyDetails?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCompanyDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">
                        Company Name
                      </Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.description}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Owner</Label>
                      <p className="text-sm text-gray-600">
                        {(selectedCompanyDetails.owner as any)?.name} (
                        {(selectedCompanyDetails.owner as any)?.email})
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Contact Email
                      </Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.contactEmail}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Contact Phone
                      </Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.contactPhone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.location}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Subscription & Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge
                        className={getSubscriptionStatusColor(
                          selectedCompanyDetails.subscription?.status ||
                            "inactive"
                        )}
                      >
                        {selectedCompanyDetails.subscription?.status ||
                          "inactive"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Plan</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.subscription?.plan || "No plan"}
                      </p>
                    </div>
                    {selectedCompanyDetails.subscription?.expiresAt && (
                      <div>
                        <Label className="text-sm font-medium">Expires</Label>
                        <p className="text-sm text-gray-600">
                          {format(
                            new Date(
                              selectedCompanyDetails.subscription.expiresAt
                            ),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">
                        Fee Percentage
                      </Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.feePercent || 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Registration Documents */}
              {selectedCompanyDetails.registrationDocs &&
                selectedCompanyDetails.registrationDocs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Registration Documents (
                        {selectedCompanyDetails.registrationDocs.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCompanyDetails.registrationDocs.map(
                          (doc: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <File className="w-5 h-5 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {doc.originalName ||
                                      doc.path?.split("/").pop() ||
                                      `Document ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.size
                                      ? `${(doc.size / 1024 / 1024).toFixed(
                                          2
                                        )} MB`
                                      : "Unknown size"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const url = `/api/v1/files/${doc.path}`;
                                  window.open(url, "_blank");
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Company Taxes */}
              {companyTaxesData && (companyTaxesData as any).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Company Taxes ({(companyTaxesData as any).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(companyTaxesData as any).map((tax: any) => (
                        <div
                          key={tax._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Receipt className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {tax.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {tax.rate}% - {tax.type} - {tax.taxType}
                              </p>
                            </div>
                          </div>
                          <Badge variant={tax.active ? "default" : "secondary"}>
                            {tax.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tax Schedules */}
              {companyTaxSchedulesData &&
                (companyTaxSchedulesData as any).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Tax Schedules ({(companyTaxSchedulesData as any).length}
                        )
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(companyTaxSchedulesData as any).map(
                          (schedule: any) => (
                            <div
                              key={schedule._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {schedule.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {schedule.components?.length || 0}{" "}
                                    components -
                                    {schedule.effectiveFrom &&
                                      format(
                                        new Date(schedule.effectiveFrom),
                                        "MMM dd, yyyy"
                                      )}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  schedule.isActive ? "default" : "secondary"
                                }
                              >
                                {schedule.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCompanyDetails.stats?.userCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Users</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCompanyDetails.stats?.facilityCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Facilities</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedCompanyDetails.stats?.bookingCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Bookings</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedCompanyDetails.stats?.transactionCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
