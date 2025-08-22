"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  BookingCalendarProps,
  Booking,
  BookingEvent,
} from "@/types/index";
import { getStatusColor, calculateDuration } from "./utils";
import { CalendarHeader } from "./calendarHeader";
import { CalendarFilters } from "./calendarFilters";
import { CalendarView } from "./calendarView";
import { BookingDetailsModal } from "./bookingDetailsModal";
import { BookingFormModal } from "./bookingFormModal";

const BookingCalendar = ({
  bookings,
  facilities,
  onRefresh,
  onUpdateBooking,
  onDeleteBooking,
  onCreateBooking,
}: BookingCalendarProps) => {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [viewType, setViewType] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("dayGridMonth");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFacility, setFilterFacility] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  const loadBookings = useCallback(() => {
    try {
      if (!bookings || !Array.isArray(bookings)) {
        setEvents([]);
        setIsLoading(false);
        return;
      }

      const filtered = bookings
        .filter((b) => filterStatus === "all" || b.status === filterStatus)
        .filter((b) => {
          if (filterFacility === "all") return true;
          const facilityId =
            typeof b.facility === "string"
              ? b.facility
              : (b.facility as any)?._id;
          return facilityId === filterFacility;
        })
        .map((b) => {
          const facilityName =
            typeof b.facility === "string"
              ? facilities.find((f) => f._id === b.facility)?.name ||
                "Unknown Facility"
              : (b.facility as any)?.name || "Unknown Facility";

          return {
            title: `${facilityName} - ${b.user?.name || "Unknown User"}`,
            start: b.startDate
              ? new Date(b.startDate).toISOString()
              : new Date().toISOString(),
            end: b.endDate
              ? new Date(b.endDate).toISOString()
              : new Date().toISOString(),
            backgroundColor: getStatusColor(b.status),
            borderColor: getStatusColor(b.status),
            extendedProps: {
              booking: b,
              facility: b.facility,
            },
          };
        });

      setEvents(filtered);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Failed to load bookings");
      setIsLoading(false);
    }
  }, [bookings, filterStatus, filterFacility, facilities]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking;
    if (booking) {
      setSelectedBooking(booking);
      setShowBookingModal(true);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDateRange({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setFormData({
      startDate: new Date(selectInfo.startStr),
      endDate: new Date(selectInfo.endStr),
      status: "pending",
      paymentStatus: "pending",
      totalPrice: 0,
      duration: calculateDuration(selectInfo.startStr, selectInfo.endStr),
      notes: "",
      internalNotes: "",
    });
    setShowEditModal(true);
    setEditingBooking(null);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      ...booking,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
    });
    setShowBookingModal(false);
    setShowEditModal(true);
  };

  const handleSaveBooking = async () => {
    if (!formData.facility || !formData.startDate || !formData.endDate) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const bookingData = {
        ...formData,
        duration: calculateDuration(
          formData.startDate!.toISOString(),
          formData.endDate!.toISOString()
        ),
        user:
          (formData.user && typeof formData.user === "object"
            ? (formData.user as any)._id
            : formData.user) || undefined,
        facility:
          (formData.facility && typeof formData.facility === "object"
            ? (formData.facility as any)._id
            : formData.facility) || undefined,
      };

      if (editingBooking) {
        if (onUpdateBooking) {
          await onUpdateBooking({
            ...editingBooking,
            ...bookingData,
          } as Booking);
          if (onRefresh) onRefresh();
        }
      } else {
        if (onCreateBooking) {
          await onCreateBooking({
            ...bookingData,
            createdAt: new Date(),
            isDeleted: false,
          });
          if (onRefresh) onRefresh();
        }
      }

      setShowEditModal(false);
      setFormData({});
      setEditingBooking(null);
      loadBookings();
    } catch (err) {
      console.error("Error saving booking:", err);
      setError("Failed to save booking");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    setIsSaving(true);
    try {
      if (onDeleteBooking && booking._id) {
        await onDeleteBooking(booking._id);
        setShowBookingModal(false);
        if (onRefresh) onRefresh();
        loadBookings();
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    setIsSaving(true);
    try {
      const updatedBooking = {
        ...booking,
        status: newStatus as Booking["status"],
        updatedAt: new Date(),
      };

      if (onUpdateBooking) {
        await onUpdateBooking(updatedBooking);
        setSelectedBooking(updatedBooking);
        loadBookings();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update booking status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewBooking = () => {
    setFormData({
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 60 * 1000),
      status: "pending",
      paymentStatus: "pending",
      totalPrice: 0,
      duration: "1 hour",
      notes: "",
      internalNotes: "",
    });
    setEditingBooking(null);
    setShowEditModal(true);
  };

  const handleRefresh = () => {
    setRefresh(!refresh);
    if (onRefresh) onRefresh();
  };

  const handleExport = () => {
    console.log("Export functionality to be implemented");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <Alert className="mb-6 border-red-100 bg-red-50/50 rounded-xl">
            <AlertDescription className="text-red-700 font-medium">
              {error}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 text-red-500 hover:text-red-700"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <CalendarHeader
          onNewBooking={handleNewBooking}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        <CalendarFilters
          viewType={viewType}
          filterStatus={filterStatus}
          filterFacility={filterFacility}
          facilities={facilities}
          bookings={bookings}
          onViewTypeChange={setViewType}
          onStatusChange={setFilterStatus}
          onFacilityChange={setFilterFacility}
        />

        <CalendarView
          viewType={viewType}
          events={events}
          isLoading={isLoading}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
        />

        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showBookingModal}
          isSaving={isSaving}
          onClose={() => setShowBookingModal(false)}
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          onStatusChange={handleStatusChange}
        />

        <BookingFormModal
          isOpen={showEditModal}
          isSaving={isSaving}
          editingBooking={editingBooking}
          formData={formData}
          facilities={facilities}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveBooking}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
};

export default BookingCalendar;
