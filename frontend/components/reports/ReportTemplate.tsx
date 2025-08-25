"use client";

import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Printer,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Building2,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import RevenueChart from "@/components/charts/RevenueChart";

interface ReportData {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  dateRange?: {
    start: Date;
    end: Date;
  };
  company?: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  summary?: {
    totalRevenue?: number;
    totalBookings?: number;
    totalUsers?: number;
    totalFacilities?: number;
    growthRate?: number;
    currency?: string;
  };
  metrics?: Array<{
    label: string;
    value: string | number;
    change?: number;
    trend?: "up" | "down" | "neutral";
    icon?: React.ReactNode;
  }>;
  charts?: Array<{
    title: string;
    type: "bar" | "line" | "pie" | "area";
    data: any;
  }>;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: Array<Array<string | number>>;
  }>;
  sections?: Array<{
    title: string;
    content: React.ReactNode;
  }>;
}

interface ReportTemplateProps {
  data: ReportData;
  onExport?: (format: "pdf" | "excel" | "csv") => void;
  onPrint?: () => void;
  className?: string;
}

export const ReportTemplate: React.FC<ReportTemplateProps> = ({
  data,
  onExport,
  onPrint,
  className = "",
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    if (onExport) {
      onExport(format);
    }
  };

  const formatCurrency = (amount: number, currency = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-GH").format(num);
  };

  const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={`space-y-6 ${className}`} ref={reportRef}>
      {/* Report Header */}
      <div className="bg-white border rounded-lg p-6 print:border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              {data.company?.logo && (
                <img
                  src={data.company.logo}
                  alt={data.company.name}
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {data.title}
                </h1>
                {data.subtitle && (
                  <p className="text-lg text-gray-600 mt-1">
                    {data.subtitle}
                  </p>
                )}
              </div>
            </div>

            {data.company && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold">{data.company.name}</p>
                {data.company.address && <p>{data.company.address}</p>}
                <div className="flex space-x-4 mt-1">
                  {data.company.phone && <p>📞 {data.company.phone}</p>}
                  {data.company.email && <p>✉️ {data.company.email}</p>}
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
              <p>Generated on: {format(data.generatedAt, "PPP")}</p>
              {data.dateRange && (
                <p>
                  Period: {format(data.dateRange.start, "PP")} -{" "}
                  {format(data.dateRange.end, "PP")}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons - Hidden in print */}
          <div className="flex space-x-2 print:hidden">
            <Button
              onClick={() => handleExport("pdf")}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={() => handleExport("excel")}
              variant="outline"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {data.summary && (
        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.summary.totalRevenue !== undefined && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.summary.totalRevenue, data.summary.currency)}
                  </h3>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              )}

              {data.summary.totalBookings !== undefined && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatNumber(data.summary.totalBookings)}
                  </h3>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                </div>
              )}

              {data.summary.totalUsers !== undefined && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatNumber(data.summary.totalUsers)}
                  </h3>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              )}

              {data.summary.totalFacilities !== undefined && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatNumber(data.summary.totalFacilities)}
                  </h3>
                  <p className="text-sm text-gray-600">Facilities</p>
                </div>
              )}
            </div>

            {data.summary.growthRate !== undefined && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Growth Rate
                  </span>
                  <Badge
                    variant={data.summary.growthRate >= 0 ? "default" : "destructive"}
                    className="text-sm"
                  >
                    {data.summary.growthRate >= 0 ? "+" : ""}
                    {data.summary.growthRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {data.metrics && data.metrics.length > 0 && (
        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.metrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {metric.icon && (
                    <div className="flex-shrink-0">{metric.icon}</div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {metric.label}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-semibold text-gray-900">
                        {metric.value}
                      </p>
                      {metric.change !== undefined && (
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(metric.trend)}
                          <span
                            className={`text-sm font-medium ${getTrendColor(
                              metric.trend
                            )}`}
                          >
                            {metric.change >= 0 ? "+" : ""}
                            {metric.change}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      {data.charts && data.charts.length > 0 && (
        <div className="space-y-6">
          {data.charts.map((chart, index) => (
            <RevenueChart
              key={index}
              data={chart.data}
              title={chart.title}
              type={chart.type}
              height={300}
            />
          ))}
        </div>
      )}

      {/* Tables Section */}
      {data.tables && data.tables.length > 0 && (
        <div className="space-y-6">
          {data.tables.map((table, index) => (
            <Card key={index} className="print:border-0 print:shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {table.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {table.headers.map((header, headerIndex) => (
                          <th
                            key={headerIndex}
                            className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="py-3 px-4 text-gray-900"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Sections */}
      {data.sections && data.sections.length > 0 && (
        <div className="space-y-6">
          {data.sections.map((section, index) => (
            <Card key={index} className="print:border-0 print:shadow-none">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>{section.content}</CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Footer */}
      <div className="bg-gray-50 border rounded-lg p-4 print:border-0">
        <div className="text-center text-sm text-gray-600">
          <p>
            This report was generated automatically by the Facility Management
            System
          </p>
          <p className="mt-1">
            For questions or support, please contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplate;