import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking } from "@/types";
import { currencyFormat } from "@/lib/utils";

interface BookingTabsProps {
  booking: Booking;
}

export const BookingTabs = ({ booking }: BookingTabsProps) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="checkin">Check-in/Out</TabsTrigger>
        {booking.cancellation && (
          <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="font-medium">Customer:</span>{" "}
              {booking.user?.name || "N/A"}
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              {booking.user?.email || "N/A"}
            </div>
            <div>
              <span className="font-medium">Phone:</span>{" "}
              {booking.user?.phone || "N/A"}
            </div>
            <div>
              <span className="font-medium">Duration:</span>{" "}
              {booking.duration || "N/A"}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Date:</span>{" "}
              {booking.startDate
                ? new Date(booking.startDate).toLocaleDateString()
                : "N/A"}
            </div>
            <div>
              <span className="font-medium">Start Time:</span>{" "}
              {booking.startDate
                ? new Date(booking.startDate).toLocaleTimeString()
                : "N/A"}
            </div>
            <div>
              <span className="font-medium">End Time:</span>{" "}
              {booking.endDate
                ? new Date(booking.endDate).toLocaleTimeString()
                : "N/A"}
            </div>
            <div>
              <span className="font-medium">Total Price:</span>{" "}
              {currencyFormat(booking.totalPrice || 0)}
            </div>
          </div>
        </div>

        {booking.discount && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Discount Applied:</span>{" "}
                  {booking.discount.type === "percentage"
                    ? `${booking.discount.value}%`
                    : currencyFormat(booking.discount.value)}
                </div>
                <div>
                  <span className="font-medium">Reason:</span>{" "}
                  {booking.discount.reason}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {booking.notes && (
          <div>
            <span className="font-medium">Notes:</span> {booking.notes}
          </div>
        )}

        {booking.internalNotes && (
          <div>
            <span className="font-medium">Internal Notes:</span>{" "}
            {booking.internalNotes}
          </div>
        )}
      </TabsContent>

      <TabsContent value="checkin" className="space-y-4">
        {booking.checkIn ? (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Checked In:</span>{" "}
                  {new Date(booking.checkIn.time).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Verified By:</span>{" "}
                  {booking.checkIn.verifiedBy?.name || "N/A"}
                </div>
                {booking.checkIn.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>{" "}
                    {booking.checkIn.notes}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription>Not checked in yet</AlertDescription>
          </Alert>
        )}

        {booking.checkOut ? (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Checked Out:</span>{" "}
                  {new Date(booking.checkOut.time).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Verified By:</span>{" "}
                  {booking.checkOut.verifiedBy?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Condition:</span>{" "}
                  {booking.checkOut.condition}
                </div>
                {booking.checkOut.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>{" "}
                    {booking.checkOut.notes}
                  </div>
                )}
                {booking.checkOut.damageReport && (
                  <div>
                    <span className="font-medium">Damage Report:</span>{" "}
                    {booking.checkOut.damageReport}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription>Not checked out yet</AlertDescription>
          </Alert>
        )}
      </TabsContent>

      {booking.cancellation && (
        <TabsContent value="cancellation">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Cancelled At:</span>{" "}
                  {new Date(booking.cancellation.cancelledAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Cancelled By:</span>{" "}
                  {booking.cancellation.cancelledBy?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Reason:</span>{" "}
                  {booking.cancellation.reason}
                </div>
                {booking.cancellation.refundAmount && (
                  <div>
                    <span className="font-medium">Refund Amount:</span>{" "}
                    {currencyFormat(booking.cancellation.refundAmount)}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </TabsContent>
      )}
    </Tabs>
  );
};
