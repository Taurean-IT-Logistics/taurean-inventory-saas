"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStats } from "./bookingStats";
import type { Booking, Facility } from "@/types";

interface CalendarFiltersProps {
  viewType: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
  filterStatus: string;
  filterFacility: string;
  facilities: Facility[];
  bookings: Booking[];
  onViewTypeChange: (
    value: "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  ) => void;
  onStatusChange: (value: string) => void;
  onFacilityChange: (value: string) => void;
}

export const CalendarFilters = ({
  viewType,
  filterStatus,
  filterFacility,
  facilities,
  bookings,
  onViewTypeChange,
  onStatusChange,
  onFacilityChange,
}: CalendarFiltersProps) => {
  return (
    <div className="space-y-6 mb-8">
      <BookingStats bookings={bookings} />

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">View</Label>
            <Select value={viewType} onValueChange={onViewTypeChange}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dayGridMonth">Month</SelectItem>
                <SelectItem value="timeGridWeek">Week</SelectItem>
                <SelectItem value="timeGridDay">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select value={filterStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Facility
            </Label>
            <Select value={filterFacility} onValueChange={onFacilityChange}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {facilities.map((f) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
