"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Booking, Facility } from "@/types";
import { Loader2 } from "lucide-react";

interface BookingEditModalProps {
  booking: Booking | null;
  facilities: Facility[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  onCreate?: (booking: Partial<Booking>) => Promise<void>;
}

export function BookingEditModal({
  booking,
  facilities,
  isOpen,
  onClose,
  onSave,
  onCreate,
}: BookingEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    facility: "",
    status: "pending" as Booking["status"],
    paymentStatus: "pending" as Booking["paymentStatus"],
    startDate: "",
    endDate: "",
    totalPrice: 0,
    notes: "",
    internalNotes: "",
  });

  // Reset form when booking changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (booking && booking._id) {
        // Editing existing booking
        setFormData({
          facility: booking.facility
            ? typeof booking.facility === "string"
              ? booking.facility
              : (booking.facility as any)._id || ""
            : "",
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          startDate: new Date(booking.startDate).toISOString().slice(0, 16),
          endDate: new Date(booking.endDate).toISOString().slice(0, 16),
          totalPrice: booking.totalPrice,
          notes: booking.notes || "",
          internalNotes: booking.internalNotes || "",
        });
      } else {
        // Creating new booking - use booking data if provided, otherwise defaults
        const defaultFacility =
          facilities && facilities.length > 0 ? facilities[0]._id : "";
        setFormData({
          facility: (booking as any)?.facility || defaultFacility,
          status: (booking as any)?.status || "pending",
          paymentStatus: (booking as any)?.paymentStatus || "pending",
          startDate: (booking as any)?.startDate
            ? new Date((booking as any).startDate).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          endDate: (booking as any)?.endDate
            ? new Date((booking as any).endDate).toISOString().slice(0, 16)
            : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
          totalPrice: (booking as any)?.totalPrice || 0,
          notes: (booking as any)?.notes || "",
          internalNotes: (booking as any)?.internalNotes || "",
        });
      }
    }
  }, [booking, isOpen, facilities]);

  const handleSave = async () => {
    if (!formData.facility || !formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updates = {
        facility: formData.facility,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        totalPrice: formData.totalPrice,
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        updatedAt: new Date(),
      };

      if (booking && booking._id) {
        // Updating existing booking
        await onSave(booking._id, updates);
        toast({
          title: "Success",
          description: "Booking updated successfully",
        });
      } else {
        // Creating new booking
        if (onCreate) {
          await onCreate(updates);
          toast({
            title: "Success",
            description: "Booking created successfully",
          });
        } else {
          // Fallback to onSave with undefined ID for new bookings
          await onSave("", updates);
          toast({
            title: "Success",
            description: "Booking created successfully",
          });
        }
      }

      onClose();
    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        title: "Error",
        description: "Failed to save booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {booking && booking._id
              ? `Edit Booking #${booking._id.slice(-8)}`
              : "Create New Booking"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-1">
          <div className="space-y-6 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facility">Facility *</Label>
                <Select
                  value={formData.facility}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, facility: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility._id} value={facility._id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Booking["status"]) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: Booking["paymentStatus"]) =>
                    setFormData((prev) => ({ ...prev, paymentStatus: value }))
                  }
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Price</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  value={formData.totalPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Customer Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Customer notes..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                rows={2}
                value={formData.internalNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    internalNotes: e.target.value,
                  }))
                }
                placeholder="Internal staff notes..."
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {booking && booking._id ? "Update Booking" : "Create Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
