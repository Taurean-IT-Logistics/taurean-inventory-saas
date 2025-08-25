"use client";

import { useState, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { BookingEditModal } from "./bookingEditModal";
import { toast } from "@/hooks/use-toast";

const BookingCalendar = ({
  bookings,
  facilities,
  onUpdateBooking,
  onDeleteBooking,
  onCreateBooking,
}: BookingCalendarProps) => {
  const queryClient = useQueryClient();

  // Local UI state only
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [viewType, setViewType] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("dayGridMonth");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFacility, setFilterFacility] = useState<string>("all");

  // Transform bookings to calendar events - memoized to prevent infinite re-renders
  const events: BookingEvent[] = useMemo(() => {
    if (!bookings || !facilities) return [];

    return bookings
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
  }, [bookings, facilities, filterStatus, filterFacility]);

  // Mutations
  const updateBookingMutation = useMutation({
    mutationFn: async (booking: Booking) => {
      if (onUpdateBooking) {
        return await onUpdateBooking(booking);
      }
      throw new Error("Update function not provided");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
      toast({
        title: "Booking updated successfully",
        description: "The booking has been updated successfully",
      });
      setShowEditModal(false);
      setFormData({});
      setEditingBooking(null);
    },
    onError: (error: any) => {
      console.error("Error updating booking:", error);
      toast({
        title: "Error updating booking",
        description: "An error occurred while updating the booking",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (booking: Partial<Booking>) => {
      if (onCreateBooking) {
        return await onCreateBooking(booking);
      }
      throw new Error("Create function not provided");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
      toast({
        title: "Booking created successfully",
        description: "The booking has been created successfully",
      });
      setShowEditModal(false);
      setFormData({});
      setEditingBooking(null);
    },
    onError: (error: any) => {
      console.error("Error creating booking:", error);
      toast({
        title: "Error creating booking",
        description: "An error occurred while creating the booking",
        variant: "destructive",
      });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      if (onDeleteBooking) {
        return await onDeleteBooking(bookingId);
      }
      throw new Error("Delete function not provided");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
      setShowBookingModal(false);
      toast({
        title: "Booking deleted successfully",
        description: "The booking has been deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error deleting booking",
        description: "An error occurred while deleting the booking",
        variant: "destructive",
      });
    },
  });

  const statusChangeMutation = useMutation({
    mutationFn: async ({
      booking,
      newStatus,
    }: {
      booking: Booking;
      newStatus: string;
    }) => {
      if (onUpdateBooking) {
        const updatedBooking = {
          ...booking,
          status: newStatus as Booking["status"],
          updatedAt: new Date(),
        };
        await onUpdateBooking(updatedBooking);
        return updatedBooking;
      }
      throw new Error("Update function not provided");
    },
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
      setSelectedBooking(updatedBooking);
    },
    onError: (error: any) => {
      console.error("Error updating status:", error);
    },
  });

  // Loading states - memoized to prevent unnecessary re-renders
  const isLoading = useMemo(
    () =>
      updateBookingMutation.isPending ||
      createBookingMutation.isPending ||
      deleteBookingMutation.isPending ||
      statusChangeMutation.isPending,
    [
      updateBookingMutation.isPending,
      createBookingMutation.isPending,
      deleteBookingMutation.isPending,
      statusChangeMutation.isPending,
    ]
  );

  // Event handlers - memoized to prevent unnecessary re-renders
  const handleEventClick = useCallback((info: any) => {
    const booking = info.event.extendedProps.booking;
    if (booking) {
      setSelectedBooking(booking);
      setShowBookingModal(true);
    }
  }, []);

  const handleDateSelect = useCallback((selectInfo: any) => {
    setFormData({
      startDate: new Date(selectInfo.startStr),
      endDate: new Date(selectInfo.endStr),
      status: "pending",
      paymentStatus: "pending",
      totalPrice: 0,
      duration: calculateDuration(selectInfo.startStr, selectInfo.endStr),
      notes: "",
      internalNotes: "",
      facility: "",
      user: undefined,
    });
    setShowEditModal(true);
    setEditingBooking(null);
  }, []);

  const handleEditBooking = useCallback((booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      ...booking,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
    });
    setShowBookingModal(false);
    setShowEditModal(true);
  }, []);

  const handleSaveBooking = useCallback(
    async (formData: Partial<Booking>) => {
      if (!formData.facility || !formData.startDate || !formData.endDate) {
        toast({
          title: "Missing required fields",
          description:
            "Please ensure facility, start date, and end date are selected",
          variant: "destructive",
        });
        return;
      }

      // Prevent multiple submissions by checking mutation states directly
      if (updateBookingMutation.isPending || createBookingMutation.isPending) {
        return;
      }

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
        facility: formData.facility,
      };

      if (editingBooking?._id) {
        // Updating existing booking
        updateBookingMutation.mutate({
          ...editingBooking,
          ...bookingData,
        } as Booking);
      } else {
        // Creating new booking
        createBookingMutation.mutate({
          ...bookingData,
          createdAt: new Date(),
          isDeleted: false,
        });
      }
    },
    [updateBookingMutation, createBookingMutation, editingBooking]
  );

  const handleDeleteBooking = useCallback(
    async (bookingId: string) => {
      if (!window.confirm("Are you sure you want to delete this booking?")) {
        return;
      }

      if (bookingId) {
        deleteBookingMutation.mutate(bookingId);
      }
    },
    [deleteBookingMutation]
  );

  const handleStatusChange = useCallback(
    async (booking: Booking, newStatus: string) => {
      statusChangeMutation.mutate({ booking, newStatus });
    },
    [statusChangeMutation]
  );

  const handleNewBooking = useCallback(() => {
    setFormData({
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 60 * 1000),
      status: "pending",
      paymentStatus: "pending",
      totalPrice: 0,
      duration: "1 hour",
      notes: "",
      internalNotes: "",
      facility: "",
      user: undefined,
    });
    setEditingBooking(null);
    setShowEditModal(true);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["bookings-company"] });
  }, [queryClient]);

  const handleExport = useCallback(() => {
    console.log("Export functionality to be implemented");
  }, []);

  // Memoize modal close handlers to prevent unnecessary re-renders
  const handleCloseBookingModal = useCallback(() => {
    setShowBookingModal(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error handling */}
        {(updateBookingMutation.error ||
          createBookingMutation.error ||
          deleteBookingMutation.error ||
          statusChangeMutation.error) && (
          <Alert className="mb-6 border-red-100 bg-red-50/50 rounded-xl">
            <AlertDescription className="text-red-700 font-medium">
              An error occurred. Please try again.
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 text-red-500 hover:text-red-700"
                onClick={() => {
                  updateBookingMutation.reset();
                  createBookingMutation.reset();
                  deleteBookingMutation.reset();
                  statusChangeMutation.reset();
                }}
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
          isLoading={false}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
        />

        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showBookingModal}
          isSaving={isLoading}
          onClose={handleCloseBookingModal}
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          onStatusChange={handleStatusChange}
        />

        <BookingEditModal
          facilities={facilities}
          booking={editingBooking}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={(bookingId, updates) =>
            handleSaveBooking({ _id: bookingId, ...updates })
          }
          onCreate={handleSaveBooking}
        />
      </div>
    </div>
  );
};

export default BookingCalendar;
