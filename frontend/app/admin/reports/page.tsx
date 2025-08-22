"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { CashflowAPI, BookingsAPI, FacilitiesAPI, UsersAPI } from "@/lib/api";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");

  const { data: cashflow } = useQuery({
    queryKey: ["cashflow", dateRange],
    queryFn: () => CashflowAPI.summary(),
  });

  const { data: bookings } = useQuery({
    queryKey: ["bookings-company-report"],
    queryFn: () => BookingsAPI.listCompany(),
  });

  const { data: facilities } = useQuery({
    queryKey: ["facilities-company-report"],
    queryFn: () => FacilitiesAPI.listCompany(),
  });

  const { data: users } = useQuery({
    queryKey: ["users-report"],
    queryFn: () => UsersAPI.listCompany(),
  });

  const metrics = useMemo(() => {
    const income = (cashflow as any)?.income || 0;
    const totalBookings = Array.isArray(bookings) ? (bookings as any).length : ((bookings as any)?.length || (bookings as any)?.data?.length || (bookings as any)?.bookings?.length || 0);
    const facilitiesCount = (facilities as any)?.facilities?.length || (facilities as any)?.items?.length || 0;
    const activeUsers = (users as any)?.users?.length || 0;
    return { income, totalBookings, facilitiesCount, activeUsers };
  }, [cashflow, bookings, facilities, users]);

  const exportReport = (format: string) => {
    // TODO: wire to export endpoints if needed
    console.log(`Exporting ${reportType} report in ${format} format`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">View insights and export data for your business</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="bookings">Bookings</option>
            <option value="revenue">Revenue</option>
            <option value="users">Users</option>
            <option value="facilities">Facilities</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵{metrics.income.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Based on transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Company bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Users in company</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.facilitiesCount}</div>
            <p className="text-xs text-muted-foreground">Available facilities</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Chart integration coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Chart integration coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="overview">Overview Report</option>
                  <option value="bookings">Bookings Report</option>
                  <option value="revenue">Revenue Report</option>
                  <option value="users">Users Report</option>
                  <option value="facilities">Facilities Report</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => exportReport("excel")}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => exportReport("pdf")}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={() => exportReport("all")} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export All Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
