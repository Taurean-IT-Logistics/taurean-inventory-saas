"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, Wallet, TrendingUp } from "lucide-react";
import { currencyFormat } from "@/lib/utils";

interface DashboardStatsProps {
  totalBookings: number;
  totalSpent: number;
  pendingPayments: number;
  completedBookings: number;
  activeBookings: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalBookings,
  totalSpent,
  pendingPayments,
  completedBookings,
  activeBookings,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <div className="p-3 bg-blue-100 rounded-xl">
            <CalendarDays className="h-6 w-6 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {totalBookings}
          </div>
          <p className="text-sm text-muted-foreground">
            {completedBookings} completed
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <div className="p-3 bg-emerald-100 rounded-xl">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {currencyFormat(totalSpent)}
          </div>
          <p className="text-sm text-muted-foreground">Across all bookings</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Payments
          </CardTitle>
          <div className="p-3 bg-amber-100 rounded-xl">
            <Wallet className="h-6 w-6 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {currencyFormat(pendingPayments)}
          </div>
          <p className="text-sm text-muted-foreground">Outstanding invoices</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
          <div className="p-3 bg-green-100 rounded-xl">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {activeBookings}
          </div>
          <p className="text-sm text-muted-foreground">Currently in progress</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
