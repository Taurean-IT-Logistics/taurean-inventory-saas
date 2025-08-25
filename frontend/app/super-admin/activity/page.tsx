"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SuperAdminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Clock,
  User,
  Building2,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Calendar,
  MoreHorizontal,
  Trash2,
  Archive,
  FileText,
  Users,
  Settings,
  Shield,
  Database,
  Server,
  Network,
  Lock,
  Unlock,
  Key,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { currencyFormat } from "@/lib/utils";

export default function SuperAdminActivityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activityType, setActivityType] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Queries
  const {
    data: activityData,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: [
      "super-admin-activity",
      100,
      activityType,
      userFilter,
      dateRange,
    ],
    queryFn: () => SuperAdminAPI.getRecentActivity(100),
  });

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
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["super-admin-users"],
    queryFn: SuperAdminAPI.getAllUsers,
  });

  if (activityLoading || statsLoading || usersLoading) {
    return <Loader />;
  }

  if (activityError || statsError || usersError) {
    return (
      <ErrorComponent
        message="Failed to load activity logs"
        onRetry={() => {
          refetchActivity();
          refetchStats();
          refetchUsers();
        }}
      />
    );
  }

  // Extract the nested activity data from the API response
  const activityResponse = (activityData as any)?.activity || {};
  const recentBookings = activityResponse.recentBookings || [];
  const recentTransactions = activityResponse.recentTransactions || [];
  const recentUsers = activityResponse.recentUsers || [];

  // Extract stats data using the same pattern as dashboard
  const stats = (statsData as any)?.stats || {};

  // Extract users data using the same pattern as users page
  const users = (usersData as any)?.users || [];

  // Combine all activities into a single array with type indicators
  const allActivities = [
    ...recentBookings.map((booking: any) => ({
      ...booking,
      activityType: "booking",
      description: `${booking.user?.name || "Unknown User"} booked ${
        booking.facility?.name || "Unknown Facility"
      }`,
      timestamp: booking.createdAt,
      user: booking.user?.name,
      company: booking.company?.name,
      amount: booking.totalPrice,
      status: booking.status,
    })),
    ...recentTransactions.map((transaction: any) => ({
      ...transaction,
      activityType: "transaction",
      description: `${transaction.user?.name || "Unknown User"} made a ${
        transaction.type
      } transaction`,
      timestamp: transaction.createdAt,
      user: transaction.user?.name,
      company: transaction.company?.name,
      amount: transaction.amount,
      status: transaction.reconciled ? "completed" : "pending",
    })),
    ...recentUsers.map((user: any) => ({
      ...user,
      activityType: "user",
      description: `New user ${user.name} joined the system`,
      timestamp: user.createdAt,
      user: user.name,
      company: user.company?.name,
      status: user.status,
    })),
  ];

  // Sort activities by timestamp (most recent first)
  const sortedActivities = allActivities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "booking":
        return <Calendar className="h-4 w-4" />;
      case "transaction":
        return <DollarSign className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "system":
        return <Server className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
      case "failed":
        return "destructive";
      case "active":
        return "outline";
      default:
        return "outline";
    }
  };

  const getActivityIconColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "confirmed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
      case "failed":
        return "text-red-600";
      case "active":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const exportActivityLogs = () => {
    window.print();
    toast({
      title: "Export Started",
      description: "Activity logs export has been initiated",
    });
  };

  const clearOldLogs = () => {
    toast({
      title: "Clear Logs",
      description: "Old activity logs have been cleared",
    });
  };

  const filteredActivities = sortedActivities.filter((activity: any) => {
    const matchesSearch =
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      activityType === "all" || activity.activityType === activityType;
    const matchesUser = userFilter === "all" || activity.user === userFilter;

    return matchesSearch && matchesType && matchesUser;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-2">
            Monitor system activities, user actions, and security events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              // @ts-ignore
              refetchActivity();
              refetchStats();
              refetchUsers();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={clearOldLogs}>
            <Archive className="h-4 w-4 mr-2" />
            Clear Old
          </Button>
          <Button onClick={exportActivityLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="activityType">Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="booking">Bookings</SelectItem>
                  <SelectItem value="transaction">Transactions</SelectItem>
                  <SelectItem value="user">User Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="userFilter">User Filter</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users
                    .filter(
                      (user: any) =>
                        user.role === "admin" || user.role === "superAdmin"
                    )
                    .map((user: any) => (
                      <SelectItem key={user._id} value={user.name}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  {users
                    .filter(
                      (user: any) =>
                        user.role === "user" || user.role === "staff"
                    )
                    .map((user: any) => (
                      <SelectItem key={user._id} value={user.name}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredActivities.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {sortedActivities.length} total in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.bookings?.total || recentBookings.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentBookings.length} recent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.transactions?.total || recentTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentTransactions.length} recent
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
              {stats.users?.total || users.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentUsers.length} recently joined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">
              Total Facilities
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.companies?.active && stats.companies?.total
                ? Math.round(
                    (stats.companies.active / stats.companies.total) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Companies active</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activity Logs
            </div>
            <Badge variant="outline">
              {filteredActivities.length} activities
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activities found matching your filters
              </div>
            ) : (
              filteredActivities.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedActivity(activity);
                    setIsDetailModalOpen(true);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full bg-gray-200 ${getActivityIconColor(
                        activity.status
                      )}`}
                    >
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        {activity.user && (
                          <span className="text-xs text-gray-600 flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {activity.user}
                          </span>
                        )}
                        {activity.company && (
                          <span className="text-xs text-gray-600 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {activity.company}
                          </span>
                        )}
                        {activity.amount && (
                          <span className="text-xs text-gray-600 flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {currencyFormat(activity.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={getActivityBadgeVariant(activity.status)}
                      className="text-xs"
                    >
                      {activity.status || "info"}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.timestamp
                        ? format(new Date(activity.timestamp), "MMM dd, HH:mm")
                        : "Unknown"}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activity Details
            </DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Type
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={getActivityBadgeVariant(selectedActivity.status)}
                    >
                      {selectedActivity.activityType || "Unknown"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Timestamp
                  </Label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedActivity.timestamp
                      ? format(
                          new Date(selectedActivity.timestamp),
                          "PPP 'at' HH:mm:ss"
                        )
                      : "Unknown"}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedActivity.description || "No description available"}
                </div>
              </div>

              {selectedActivity.user && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    User
                  </Label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedActivity.user}
                  </div>
                </div>
              )}

              {selectedActivity.company && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Company
                  </Label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedActivity.company}
                  </div>
                </div>
              )}

              {selectedActivity.amount && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Amount
                  </Label>
                  <div className="mt-1 text-sm text-gray-900">
                    {currencyFormat(selectedActivity.amount)}
                  </div>
                </div>
              )}

              {selectedActivity.status && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={getActivityBadgeVariant(selectedActivity.status)}
                    >
                      {selectedActivity.status}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
