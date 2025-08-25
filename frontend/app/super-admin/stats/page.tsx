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
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  TrendingUp,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Server,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";

export default function SuperAdminStatsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Queries
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["super-admin-stats", timeRange],
    queryFn: () => SuperAdminAPI.getSystemStatistics(),
  });

  const {
    data: activityData,
    isLoading: activityLoading,
    isError: activityError,
  } = useQuery({
    queryKey: ["super-admin-activity", 20],
    queryFn: () => SuperAdminAPI.getRecentActivity(20),
  });

  const {
    data: companiesData,
    isLoading: companiesLoading,
    isError: companiesError,
  } = useQuery({
    queryKey: ["super-admin-companies"],
    queryFn: SuperAdminAPI.getAllCompanies,
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ["super-admin-users"],
    queryFn: SuperAdminAPI.getAllUsers,
  });

  if (statsLoading || companiesLoading || usersLoading || activityLoading) {
    return <Loader />;
  }

  if (statsError || companiesError || usersError || activityError) {
    return <ErrorComponent message="Failed to load system statistics" />;
  }

  const stats = (statsData as any)?.stats || {};

  // Extract companies and users data using the same pattern as dashboard
  const companies = (companiesData as any)?.companies || [];
  const users = (usersData as any)?.users || [];

  const exportStats = () => {
    // Implementation for exporting stats
    window.print();
    toast({
      title: "Export Started",
      description: "System statistics export has been initiated",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            System Statistics
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive overview of system performance and metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              // @ts-ignore
              refetchStats();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportStats}>
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
            Filters & Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="metric">Metric Type</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="users">User Metrics</SelectItem>
                  <SelectItem value="companies">Company Metrics</SelectItem>
                  <SelectItem value="financial">Financial Metrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                placeholder="Search metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users?.unassigned || 0} unassigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.companies?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.companies?.total || 0} total companies
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
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingJoinRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">Join requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Users</span>
              <Badge variant="default">{stats.users?.total || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assigned Users</span>
              <Badge variant="default">{stats.users?.assigned || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unassigned Users</span>
              <Badge variant="destructive">
                {stats.users?.unassigned || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Users</span>
              <Badge variant="default">{stats.users?.active || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Company Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Company Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Companies</span>
              <Badge variant="default">{stats.companies?.total || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Companies</span>
              <Badge variant="default">{stats.companies?.active || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Requests</span>
              <Badge variant="destructive">
                {stats.pendingJoinRequests || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Facilities</span>
              <Badge variant="default">{stats.facilities || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.companies?.active || 0}
              </div>
              <p className="text-sm text-gray-600">Active Companies</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.users?.assigned || 0}
              </div>
              <p className="text-sm text-gray-600">Assigned Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.facilities || 0}
              </div>
              <p className="text-sm text-gray-600">Total Facilities</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              User Distribution
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.users?.assigned && stats.users?.total
                ? Math.round((stats.users.assigned / stats.users.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Users assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Facility Density
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.companies?.total && stats.facilities
                ? Math.round(stats.facilities / stats.companies.total)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Avg per company</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingJoinRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">Pending requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Types</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {
                companies.filter(
                  (c: any) => c.subscription?.status === "active"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              With active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {
                users.filter(
                  (u: any) => u.role === "admin" || u.role === "superAdmin"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Users/Company
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.companies?.total && stats.users?.assigned
                ? Math.round(stats.users.assigned / stats.companies.total)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per active company</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Utilization
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.facilities && stats.companies?.total
                ? Math.round(
                    (stats.facilities / (stats.companies.total * 5)) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Facility capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          ) : activityError ? (
            <div className="text-center py-8 text-gray-500">
              Failed to load activity data
            </div>
          ) : (
            <div className="space-y-3">
              {/* Extract the nested activity data from the API response */}
              {(() => {
                const activityResponse = (activityData as any)?.activity || {};
                const recentBookings = activityResponse.recentBookings || [];
                const recentTransactions =
                  activityResponse.recentTransactions || [];
                const recentUsers = activityResponse.recentUsers || [];

                // Combine all activities into a single array with type indicators
                const allActivities = [
                  ...recentBookings.map((booking: any) => ({
                    ...booking,
                    activityType: "booking",
                    description: `${
                      booking.user?.name || "Unknown User"
                    } booked ${booking.facility?.name || "Unknown Facility"}`,
                    timestamp: booking.createdAt,
                    type: "booking",
                  })),
                  ...recentTransactions.map((transaction: any) => ({
                    ...transaction,
                    activityType: "transaction",
                    description: `${
                      transaction.user?.name || "Unknown User"
                    } made a ${transaction.type} transaction`,
                    timestamp: transaction.createdAt,
                    type: "transaction",
                  })),
                  ...recentUsers.map((user: any) => ({
                    ...user,
                    activityType: "user",
                    description: `New user ${user.name} joined the system`,
                    timestamp: user.createdAt,
                    type: "user",
                  })),
                ];

                // Sort activities by timestamp (most recent first) and take first 10
                const sortedActivities = allActivities
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .slice(0, 10);

                return sortedActivities.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {activity.description || "System activity"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.type || "info"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {activity.timestamp
                          ? format(
                              new Date(activity.timestamp),
                              "MMM dd, HH:mm"
                            )
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
