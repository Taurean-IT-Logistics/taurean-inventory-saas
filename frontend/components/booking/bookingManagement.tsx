import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Building2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { BookingStatusBadge } from "./booking-calendar/bookingStatusBadge";
import { PaymentStatusBadge } from "./booking-calendar/paymentStatusBadge";
import { BookingEditModal } from "./booking-calendar/bookingEditModal";
import { BookingDetailsModal } from "./booking-calendar/bookingDetailsModal";
import { toast } from "@/hooks/use-toast";
import { Booking, Facility, BookingFilters, BookingStats } from "@/types";
import {
  currencyFormat,
  formatDate,
  formatTime,
  calculateDuration,
} from "@/lib/utils";
import { ErrorComponent } from "../ui/error";

interface BookingManagementProps {
  bookings: Booking[];
  facilities: Facility[];
  onRefresh: () => void;
  onUpdateBooking: (booking: Booking) => Promise<void>;
  onDeleteBooking: (bookingId: string) => Promise<void>;
  onCreateBooking?: (booking: Booking) => Promise<void>;
}

export default function BookingManagement({
  bookings,
  facilities,
  onRefresh,
  onUpdateBooking,
  onDeleteBooking,
  onCreateBooking,
}: BookingManagementProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [filters, setFilters] = useState<BookingFilters>({
    search: "",
    status: "all",
    paymentStatus: "all",
    dateRange: "all",
    facility: "all",
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter bookings with useMemo to prevent unnecessary recalculations
  const filteredBookings = useMemo(() => {
    return (bookings as Booking[]).filter((booking) => {
      if (booking.isDeleted) return false;

      const facilityName =
        (facilities as Facility[]).find((f) => f._id === booking.facility)
          ?.name || "";
      const searchMatch =
        booking.user.name
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        booking.user.email
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        facilityName.toLowerCase().includes(filters.search.toLowerCase());

      const statusMatch =
        filters.status === "all" || booking.status === filters.status;
      const paymentMatch =
        filters.paymentStatus === "all" ||
        booking.paymentStatus === filters.paymentStatus;
      const facilityMatch =
        filters.facility === "all" || booking.facility === filters.facility;

      let dateMatch = true;
      if (filters.dateRange === "today") {
        const today = new Date();
        const bookingDate = new Date(booking.startDate);
        dateMatch = bookingDate.toDateString() === today.toDateString();
      } else if (filters.dateRange === "week") {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        dateMatch = new Date(booking.startDate) <= weekFromNow;
      } else if (filters.dateRange === "month") {
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        dateMatch = new Date(booking.startDate) <= monthFromNow;
      }

      return (
        searchMatch && statusMatch && paymentMatch && facilityMatch && dateMatch
      );
    });
  }, [bookings, facilities, filters]);

  // Calculate stats with useMemo
  const stats: BookingStats = useMemo(() => {
    return {
      total: (bookings as Booking[]).length,
      confirmed: (bookings as Booking[]).filter((b) => b.status === "confirmed")
        .length,
      pending: (bookings as Booking[]).filter((b) => b.status === "pending")
        .length,
      revenue: (bookings as Booking[])
        .filter((b) => ["confirmed", "completed"].includes(b.status))
        .reduce((sum, b) => sum + b.totalPrice, 0),
    };
  }, [bookings]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Event handlers with useCallback to prevent recreating functions
  const handleFilterChange = useCallback(
    (key: keyof BookingFilters, value: string) => {
      setFilters((prev: any) => ({ ...prev, [key]: value }));
      setCurrentPage(1); // Reset to first page when filtering
    },
    []
  );

  const handleEditBooking = useCallback((booking: Booking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  }, []);

  const handleViewBooking = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  }, []);

  const handleSaveBooking = useCallback(
    async (bookingId: string, updates: Partial<Booking>) => {
      try {
        setIsSaving(true);
        const updatedBooking = { ...editingBooking, ...updates } as Booking;
        await onUpdateBooking(updatedBooking);
        setEditingBooking(null);
        setIsEditModalOpen(false);
        toast({
          title: "Success",
          description: "Booking updated successfully",
          variant: "default",
        });
      } catch (err) {
        console.error("Error updating booking:", err);
        toast({
          title: "Error",
          description: "Failed to update booking",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [onUpdateBooking, editingBooking]
  );

  const handleDeleteBooking = useCallback(
    async (bookingId: string) => {
      if (!window.confirm("Are you sure you want to delete this booking?")) {
        return;
      }

      try {
        onDeleteBooking(bookingId);
        setShowDetailsModal(false);

        toast({
          title: "Success",
          description: "Booking deleted successfully",
          variant: "default",
        });
      } catch (err) {
        console.error("Error deleting booking:", err);
        toast({
          title: "Error",
          description: "Failed to delete booking",
          variant: "destructive",
        });
      }
    },
    [onDeleteBooking]
  );

  const handleCreateBooking = useCallback(() => {
    toast({
      title: "Coming Soon",
      description: "Create new booking functionality will be implemented",
    });
  }, []);

  const handleExportBookings = useCallback(() => {
    toast({
      title: "Export Started",
      description: "Your booking data is being prepared for download",
    });
  }, []);

  const handleStatusChange = useCallback(
    (booking: Booking, newStatus: Booking["status"]) => {
      onUpdateBooking({ ...booking, status: newStatus });
    },
    [onUpdateBooking]
  );

  if (!bookings || !facilities) {
    return (
      <ErrorComponent
        title="Error loading bookings"
        message="Please refresh the page"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Management
            </h1>
            <p className="text-gray-600 text-lg">
              Manage facility bookings and reservations with ease
            </p>
          </div>
          <div className="flex gap-3 mt-6 lg:mt-0">
            <Button
              onClick={handleCreateBooking}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
            <Button variant="outline" onClick={handleExportBookings}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.total}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Bookings
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.confirmed}
                  </p>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {currencyFormat(stats.revenue)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.pending}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pending Review
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search bookings..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment</Label>
                <Select
                  value={filters.paymentStatus}
                  onValueChange={(value) =>
                    handleFilterChange("paymentStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Facility</Label>
                <Select
                  value={filters.facility}
                  onValueChange={(value) =>
                    handleFilterChange("facility", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Facilities</SelectItem>
                    {(facilities as Facility[]).map((facility) => (
                      <SelectItem key={facility._id} value={facility._id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) =>
                    handleFilterChange("dateRange", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredBookings.length} of{" "}
              {(bookings as Booking[]).length} bookings
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Booking ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Facility</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBookings.map((booking: Booking) => {
                    return (
                      <TableRow key={booking._id} className="hover:bg-gray-100">
                        <TableCell className="font-mono text-sm">
                          #{booking._id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {booking.user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {(booking?.facility as any)?.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {formatDate(booking.startDate)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatTime(booking.startDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {calculateDuration(
                            booking.startDate,
                            booking.endDate
                          )}
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={booking.paymentStatus} />
                        </TableCell>
                        <TableCell className="font-semibold">
                          {currencyFormat(booking.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewBooking(booking)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBooking(booking)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBooking(booking._id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredBookings.length)} of{" "}
                  {filteredBookings.length} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingBooking && (
        <BookingEditModal
          booking={editingBooking}
          facilities={facilities as Facility[]}
          isOpen={!!editingBooking}
          onSave={handleSaveBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onStatusChange={(booking, newStatus) =>
            handleStatusChange(booking, newStatus as Booking["status"])
          }
          onClose={() => setSelectedBooking(null)}
          isOpen={!!selectedBooking}
          isSaving={isSaving}
          onDelete={handleDeleteBooking}
          onEdit={handleEditBooking}
        />
      )}
    </div>
  );
}
