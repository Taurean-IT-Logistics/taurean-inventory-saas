import { TrendingUp, TrendingDown } from "lucide-react";
import type { Booking } from "@/types";

interface BookingStatsProps {
  bookings: Booking[];
}

export const BookingStats = ({ bookings }: BookingStatsProps) => {
  const confirmedCount = bookings.filter(
    (b) => b && (b.status === "confirmed" || b.status === "completed")
  ).length;
  const pendingCount = bookings.filter(
    (b) => b && b.status === "pending"
  ).length;
  const totalCount = bookings.length;

  const confirmedChange = 12.1;
  const pendingChange = -9.8;
  const totalChange = 7.7;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalCount.toLocaleString()}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              totalChange >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {totalChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {totalChange >= 0 ? "+" : ""}
            {totalChange}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Confirmed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {confirmedCount.toLocaleString()}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              confirmedChange >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {confirmedChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {confirmedChange >= 0 ? "+" : ""}
            {confirmedChange}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {pendingCount.toLocaleString()}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              pendingChange >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {pendingChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {pendingChange >= 0 ? "+" : ""}
            {pendingChange}%
          </div>
        </div>
      </div>
    </div>
  );
};
