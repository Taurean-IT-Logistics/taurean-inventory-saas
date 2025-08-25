"use client";

import { Plus, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  onNewBooking: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const CalendarHeader = ({
  onNewBooking,
  onRefresh,
  onExport,
}: CalendarHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
        <p className="text-gray-600 mt-1">
          Manage and track all facility bookings
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          className="border-gray-200 hover:bg-gray-50 bg-white shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={onExport}
          className="border-gray-200 hover:bg-gray-50 bg-white shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button
          onClick={onNewBooking}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>
    </div>
  );
};
