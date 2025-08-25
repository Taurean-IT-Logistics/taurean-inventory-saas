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
  Receipt,
  CreditCard,
} from "lucide-react";
import { CashflowAPI, BookingsAPI, FacilitiesAPI, UsersAPI, InvoicesAPI } from "@/lib/api";
import ReportTemplate from "@/components/reports/ReportTemplate";
import { toast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");
  const [showReport, setShowReport] = useState(false);

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

  const { data: invoices } = useQuery({
    queryKey: ["invoices-stats"],
    queryFn: () => InvoicesAPI.getStats(),
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
    const invoiceStats = invoices as any;
    return { 
      income, 
      totalBookings, 
      facilitiesCount, 
      activeUsers,
      totalInvoices: invoiceStats?.total || 0,
      paidInvoices: invoiceStats?.paid || 0,
      overdueInvoices: invoiceStats?.overdue || 0,
      totalInvoiceAmount: invoiceStats?.totalAmount || 0,
      paidInvoiceAmount: invoiceStats?.paidAmount || 0,
      overdueInvoiceAmount: invoiceStats?.overdueAmount || 0,
    };
  }, [cashflow, bookings, facilities, users, invoices]);

  const exportReport = (format: string) => {
    // TODO: wire to export endpoints if needed
    console.log(`Exporting ${reportType} report in ${format} format`);
    toast({
      title: "Export Started",
      description: `Exporting ${reportType} report in ${format} format`,
    });
  };

  const generateReport = () => {
    setShowReport(true);
  };

  const reportData = useMemo(() => {
    const startDate = new Date();
    const endDate = new Date();
    
    switch (dateRange) {
      case "7":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "365":
        startDate.setDate(startDate.getDate() - 365);
        break;
    }

    return {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      subtitle: `Generated for ${dateRange} days period`,
      generatedAt: new Date(),
      dateRange: { start: startDate, end: endDate },
      company: {
        name: "Your Company",
        address: "Company Address",
        phone: "+233 XX XXX XXXX",
        email: "info@company.com",
      },
      summary: {
        totalRevenue: metrics.income,
        totalBookings: metrics.totalBookings,
        totalUsers: metrics.activeUsers,
        totalFacilities: metrics.facilitiesCount,
        currency: "GHS",
      },
      metrics: [
        {
          label: "Total Invoices",
          value: metrics.totalInvoices,
          icon: <Receipt className="w-5 h-5 text-blue-600" />,
        },
        {
          label: "Paid Invoices",
          value: metrics.paidInvoices,
          icon: <CreditCard className="w-5 h-5 text-green-600" />,
        },
        {
          label: "Overdue Invoices",
          value: metrics.overdueInvoices,
          icon: <Calendar className="w-5 h-5 text-red-600" />,
        },
        {
          label: "Total Invoice Amount",
          value: `GHS ${metrics.totalInvoiceAmount.toLocaleString()}`,
          icon: <DollarSign className="w-5 h-5 text-purple-600" />,
        },
        {
          label: "Paid Amount",
          value: `GHS ${metrics.paidInvoiceAmount.toLocaleString()}`,
          icon: <TrendingUp className="w-5 h-5 text-green-600" />,
        },
        {
          label: "Overdue Amount",
          value: `GHS ${metrics.overdueInvoiceAmount.toLocaleString()}`,
          icon: <TrendingDown className="w-5 h-5 text-red-600" />,
        },
      ],
      charts: [
        {
          title: "Revenue Trend",
          type: "line" as const,
          data: [
            { name: "Jan", value: metrics.income * 0.8 },
            { name: "Feb", value: metrics.income * 0.9 },
            { name: "Mar", value: metrics.income * 0.95 },
            { name: "Apr", value: metrics.income },
            { name: "May", value: metrics.income * 1.1 },
            { name: "Jun", value: metrics.income * 1.2 },
          ],
        },
        {
          title: "Invoice Status Distribution",
          type: "pie" as const,
          data: [
            { name: "Paid", value: metrics.paidInvoices },
            { name: "Pending", value: metrics.totalInvoices - metrics.paidInvoices - metrics.overdueInvoices },
            { name: "Overdue", value: metrics.overdueInvoices },
          ],
        },
        {
          title: "Monthly Bookings",
          type: "bar" as const,
          data: [
            { name: "Jan", value: metrics.totalBookings * 0.7 },
            { name: "Feb", value: metrics.totalBookings * 0.8 },
            { name: "Mar", value: metrics.totalBookings * 0.9 },
            { name: "Apr", value: metrics.totalBookings },
            { name: "May", value: metrics.totalBookings * 1.1 },
            { name: "Jun", value: metrics.totalBookings * 1.2 },
          ],
        },
      ],
      tables: [
        {
          title: "Financial Summary",
          headers: ["Metric", "Value", "Status"],
          rows: [
            ["Total Revenue", `GHS ${metrics.income.toLocaleString()}`, "Active"],
            ["Total Bookings", metrics.totalBookings.toString(), "Active"],
            ["Total Users", metrics.activeUsers.toString(), "Active"],
            ["Total Facilities", metrics.facilitiesCount.toString(), "Active"],
          ],
        },
      ],
    };
  }, [reportType, dateRange, metrics]);

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Total invoices
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
              <div className="flex space-x-3">
                <Button
                  onClick={generateReport}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button
                  onClick={() => exportReport("all")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Reports
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Template Display */}
      {showReport && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Generated Report</h2>
            <Button
              onClick={() => setShowReport(false)}
              variant="outline"
              size="sm"
            >
              Close Report
            </Button>
          </div>
          <ReportTemplate
            data={reportData}
            onExport={exportReport}
            onPrint={() => window.print()}
          />
        </div>
      )}
    </div>
  );
}
