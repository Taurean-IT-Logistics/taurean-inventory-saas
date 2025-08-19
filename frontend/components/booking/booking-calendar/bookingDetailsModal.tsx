"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Booking } from "@/types";
import { getStatusBadgeVariant } from "./utils";
import { BookingTabs } from "./bookingTabs";
import { QuickActions } from "./quickActions";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onStatusChange: (booking: Booking, status: string) => void;
}

export const BookingDetailsModal = ({
  booking,
  isOpen,
  isSaving,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: BookingDetailsModalProps) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-blue-600">
              {(booking.facility as any)?.name || "Unknown Facility"}
            </h3>
            <div className="flex gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Booking Status</p>
                <Badge className={getStatusBadgeVariant(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Payment Status</p>
                <Badge
                  className={
                    booking.paymentStatus === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {booking.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          <BookingTabs booking={booking} />
          <QuickActions
            booking={booking}
            isSaving={isSaving}
            onStatusChange={onStatusChange}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onEdit(booking)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(booking)}
            disabled={isSaving}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
