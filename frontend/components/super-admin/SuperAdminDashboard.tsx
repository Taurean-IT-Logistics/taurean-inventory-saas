"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuperAdminAPI } from "@/lib/api";
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

  // Mutations
  const updateCompanyStatusMutation = useMutation({
    mutationFn: ({ companyId, status }: { companyId: string; status: string }) =>
      SuperAdminAPI.updateCompanyStatus(companyId, status),
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
    mutationFn: ({ companyId, plan, duration }: { companyId: string; plan: string; duration: number }) =>
      SuperAdminAPI.activateCompanySubscription(companyId, plan, duration),
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
    mutationFn: ({ userId, companyId }: { userId: string; companyId: string }) =>
      SuperAdminAPI.assignUserToCompany(userId, companyId),
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
    mutationFn: (userId: string) =>
      SuperAdminAPI.removeUserFromCompany(userId),
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
      case "superAdmin":
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
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCompany(company);
                                setIsCompanyModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
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
                                  status: company.subscription?.status === "active" ? "inactive" : "active",
                                });
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {company.subscription?.status === "active" ? "Deactivate" : "Activate"}
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
                            <p className="text-sm text-gray-500">{user.email}</p>
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
                      <p className="text-sm text-gray-600">{selectedCompany.name}</p>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-gray-600">{selectedCompany.description}</p>
                    </div>
                    <div>
                      <Label>Owner</Label>
                      <p className="text-sm text-gray-600">
                        {(selectedCompany.owner as any)?.name} ({(selectedCompany.owner as any)?.email})
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Subscription</h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Status</Label>
                      <Badge className={getSubscriptionStatusColor(selectedCompany.subscription?.status || "inactive")}>
                        {selectedCompany.subscription?.status || "inactive"}
                      </Badge>
                    </div>
                    <div>
                      <Label>Plan</Label>
                      <p className="text-sm text-gray-600">{selectedCompany.subscription?.plan || "No plan"}</p>
                    </div>
                    {selectedCompany.subscription?.expiresAt && (
                      <div>
                        <Label>Expires</Label>
                        <p className="text-sm text-gray-600">
                          {format(new Date(selectedCompany.subscription.expiresAt), "MMM dd, yyyy")}
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
                      <SelectItem value="superAdmin">Super Admin</SelectItem>
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
      <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
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
                <Badge className={getSubscriptionStatusColor(selectedCompany.subscription?.status || "inactive")}>
                  {selectedCompany.subscription?.status || "inactive"}
                </Badge>
              </div>
              <div>
                <Label>Plan</Label>
                <Select
                  value={subscriptionData.plan}
                  onValueChange={(value) => setSubscriptionData(prev => ({ ...prev, plan: value }))}
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
                  onValueChange={(value) => setSubscriptionData(prev => ({ ...prev, duration: parseInt(value) }))}
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
                  {activateSubscriptionMutation.isPending ? "Activating..." : "Activate Subscription"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}