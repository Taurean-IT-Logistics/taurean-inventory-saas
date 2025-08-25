"use client";

import { useState } from "react";
import {
  Loader2,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types";
import { getStatusColor } from "./utils";
import { currencyFormat } from "@/lib/utils";
import { PaymentStatusBadge } from "./paymentStatusBadge";
import { BookingStatusBadge } from "./bookingStatusBadge";
import { Label } from "@/components/ui/label";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onDelete: (bookingId: string) => void;
  onStatusChange: (booking: Booking, newStatus: string) => void;
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border-0 shadow-xl">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Booking Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(booking)}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(booking._id)}
                className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Current Status
              </p>
              <div className="flex items-center gap-2 mt-1">
                <BookingStatusBadge status={booking.status} />
                <PaymentStatusBadge status={booking.paymentStatus} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <Label htmlFor="booking-status">Booking</Label>
                <Select
                  value={booking.status}
                  onValueChange={(value) => onStatusChange(booking, value)}
                >
                  <SelectTrigger className="w-40" id="booking-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment-status">Payment Status</Label>
                <Select
                  value={booking.paymentStatus}
                  onValueChange={(value: typeof booking.paymentStatus) =>
                    onStatusChange(
                      { ...booking, paymentStatus: value },
                      booking.status
                    )
                  }
                >
                  <SelectTrigger className="w-40" id="payment-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="partial_refund">
                      Partial Refund
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Start Date & Time
                  </p>
                  <p className="text-gray-900">
                    {formatDate(booking.startDate)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(booking.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    End Date & Time
                  </p>
                  <p className="text-gray-900">{formatDate(booking.endDate)}</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(booking.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Facility</p>
                  <p className="text-gray-900">
                    {typeof booking.facility === "string"
                      ? "Facility ID: " + booking.facility
                      : (booking.facility as any)?.name || "Unknown Facility"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer</p>
                  <p className="text-gray-900">
                    {typeof booking.user === "string"
                      ? "User ID: " + booking.user
                      : (booking.user as any)?.name || "Unknown User"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Price
                  </p>
                  <p className="text-gray-900">
                    {currencyFormat(
                      parseFloat(booking.totalPrice?.toFixed(2)) || 0
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-gray-900">{booking.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Customer Notes
              </p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {booking.notes}
              </p>
            </div>
          )}

          {booking.internalNotes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Internal Notes
              </p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {booking.internalNotes}
              </p>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Created:</p>
              <p className="text-gray-900">
                {booking.createdAt ? formatDate(booking.createdAt) : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated:</p>
              <p className="text-gray-900">
                {booking.updatedAt ? formatDate(booking.updatedAt) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
