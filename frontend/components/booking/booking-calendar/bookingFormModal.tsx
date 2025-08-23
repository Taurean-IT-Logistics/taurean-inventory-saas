"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Booking, Facility } from "@/types";
import { DateTimePicker } from "@/components/ui/date-picker";

interface BookingFormModalProps {
  isOpen: boolean;
  isSaving: boolean;
  editingBooking: Booking | null;
  formData: Partial<Booking>;
  facilities: Facility[];
  onClose: () => void;
  onSave: () => void;
}

export const BookingFormModal = ({
  isOpen,
  isSaving,
  editingBooking,
  formData,
  facilities,
  onClose,
  onSave,
}: BookingFormModalProps) => {
  // Local state for form editing - prevents infinite loops
  const [localFormData, setLocalFormData] = useState<Partial<Booking>>({});

  // Initialize local form data when modal opens or editing booking changes
  useEffect(() => {
    if (isOpen && formData) {
      setLocalFormData(formData);
    }
  }, [isOpen, formData]);

  // Reset local form data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLocalFormData({});
    }
  }, [isOpen]);

  // Early return if not open to prevent any rendering issues
  if (!isOpen) {
    return null;
  }

  const handleFacilityChange = (value: string) => {
    const selectedFacility = facilities.find((f) => f.name === value);
    setLocalFormData({
      ...localFormData,
      facility: selectedFacility?._id || value,
    });
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    value: Date | undefined
  ) => {
    if (value) {
      setLocalFormData({
        ...localFormData,
        [field]: value,
      });
    }
  };

  const handleInputChange = (field: keyof Booking, value: any) => {
    setLocalFormData({
      ...localFormData,
      [field]: value,
    });
  };

  const handleSave = () => {
    // Update the parent formData before calling onSave
    Object.assign(formData, localFormData);
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border-0 shadow-xl">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {editingBooking ? "Edit Booking" : "Create New Booking"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="facility"
                className="text-sm font-medium text-gray-700"
              >
                Facility <span className="text-red-500">*</span>
              </Label>
              <Select
                value={
                  typeof localFormData.facility === "string"
                    ? facilities.find((f) => f._id === localFormData.facility)
                        ?.name || ""
                    : (localFormData.facility as any)?._id
                    ? facilities.find(
                        (f) => f._id === (localFormData.facility as any)._id
                      )?.name || ""
                    : ""
                }
                onValueChange={handleFacilityChange}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select a facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility._id} value={facility.name}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Status
              </Label>
              <Select
                value={localFormData.status || "pending"}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-sm font-medium text-gray-700"
              >
                Start Date <span className="text-red-500">*</span>
              </Label>
              <DateTimePicker
                date={localFormData.startDate}
                onDateChange={(value: Date | undefined) =>
                  handleDateChange("startDate", value)
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-sm font-medium text-gray-700"
              >
                End Date <span className="text-red-500">*</span>
              </Label>
              <DateTimePicker
                date={localFormData.endDate}
                onDateChange={(value: Date | undefined) =>
                  handleDateChange("endDate", value)
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="paymentStatus"
                className="text-sm font-medium text-gray-700"
              >
                Payment Status
              </Label>
              <Select
                value={localFormData.paymentStatus || "pending"}
                onValueChange={(value) =>
                  handleInputChange("paymentStatus", value)
                }
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="partial_refund">Partial Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="totalPrice"
                className="text-sm font-medium text-gray-700"
              >
                Total Price
              </Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={localFormData.totalPrice || 0}
                onChange={(e) =>
                  handleInputChange(
                    "totalPrice",
                    Number.parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Customer Notes
            </Label>
            <Textarea
              id="notes"
              rows={3}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
              value={localFormData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Add any customer notes or special requests..."
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="internalNotes"
              className="text-sm font-medium text-gray-700"
            >
              Internal Notes
            </Label>
            <Textarea
              id="internalNotes"
              rows={2}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
              value={localFormData.internalNotes || ""}
              onChange={(e) =>
                handleInputChange("internalNotes", e.target.value)
              }
              placeholder="Internal staff notes (not visible to customer)..."
            />
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-100 gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-200 hover:bg-gray-50 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              !localFormData.facility ||
              !localFormData.startDate ||
              !localFormData.endDate
            }
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingBooking ? "Update" : "Create"} Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
