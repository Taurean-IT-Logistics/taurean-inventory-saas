"use client";

import { Check, CalendarCheck, CalendarX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types";

interface QuickActionsProps {
  booking: Booking;
  isSaving: boolean;
  onStatusChange: (booking: Booking, status: string) => void;
}

export const QuickActions = ({
  booking,
  isSaving,
  onStatusChange,
}: QuickActionsProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {booking.status === "pending" && (
        <Button
          size="sm"
          onClick={() => onStatusChange(booking, "confirmed")}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-md"
        >
          <Check className="w-4 h-4 mr-1" />
          Confirm
        </Button>
      )}

      {booking.status === "confirmed" && (
        <Button
          size="sm"
          onClick={() => onStatusChange(booking, "completed")}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
        >
          <CalendarCheck className="w-4 h-4 mr-1" />
          Complete
        </Button>
      )}

      {["pending", "confirmed"].includes(booking.status) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(booking, "cancelled")}
          disabled={isSaving}
          className="border-red-300 text-red-700 hover:bg-red-50 transition-all duration-200"
        >
          <CalendarX className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      )}

      {booking.status === "confirmed" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(booking, "no_show")}
          disabled={isSaving}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
        >
          <X className="w-4 h-4 mr-1" />
          No Show
        </Button>
      )}
    </div>
  );
};
