import { useQuery } from "@tanstack/react-query";
import { BookingsAPI } from "@/lib/api";

export function useBookings(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => BookingsAPI.listAll(),
  });
}
