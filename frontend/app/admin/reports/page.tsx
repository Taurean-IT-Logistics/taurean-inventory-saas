"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    const totalBookings = Array.isArray(bookings)
      ? (bookings as any).length
      : (bookings as any)?.length ||
        (bookings as any)?.data?.length ||
        (bookings as any)?.bookings?.length ||
        0;
    const facilitiesCount =
      (facilities as any)?.facilities?.length ||
      (facilities as any)?.items?.length ||
      0;
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
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            View insights and export data for your business
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="bookings">Bookings</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="facilities">Facilities</SelectItem>
            </SelectContent>
          </Select>
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
            <div className="text-2xl font-bold">
              GH₵{metrics.income.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on transactions
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
            <p className="text-xs text-muted-foreground">
              Available facilities
            </p>
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
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview Report</SelectItem>
                    <SelectItem value="bookings">Bookings Report</SelectItem>
                    <SelectItem value="revenue">Revenue Report</SelectItem>
                    <SelectItem value="users">Users Report</SelectItem>
                    <SelectItem value="facilities">
                      Facilities Report
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button
                onClick={() => exportReport("all")}
                className="bg-blue-600 hover:bg-blue-700"
              >
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
