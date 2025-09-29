"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, MoreHorizontal } from "lucide-react";
import { currencyFormat } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/booking/booking-calendar/bookingStatusBadge";
import { ErrorComponent } from "@/components/ui/error";

interface BookingsTableProps {
  bookings: any;
  bookingsError: any;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  bookingsError,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          My Bookings
        </CardTitle>
        <CardDescription>All your facility bookings</CardDescription>
      </CardHeader>
      <CardContent>
        {bookingsError ? (
          <ErrorComponent
            title="Error loading bookings"
            message={bookingsError.message}
          />
        ) : !(bookings as any) || (bookings as any).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No bookings found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking #</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bookings as any).map((booking: any) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">
                    #{booking._id.slice(-8)}
                  </TableCell>
                  <TableCell>{booking.facility?.name}</TableCell>
                  <TableCell>
                    {new Date(booking.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{booking.duration} hours</TableCell>
                  <TableCell>
                    {currencyFormat(booking.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {booking.status === "pending" && (
                          <DropdownMenuItem>
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsTable;
