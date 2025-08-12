"use client"

import { useEffect } from "react"
import { RequireRole } from "@/components/auth/RequireRole"
import { useQuery } from "@tanstack/react-query"
import { BookingsAPI } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import io from "socket.io-client"

export default function ClientDashboardPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ["my-bookings"], queryFn: () => BookingsAPI.me() })

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token: typeof window !== "undefined" ? localStorage.getItem("fh_access") : undefined },
    })
    socket.on("booking:created", () => refetch())
    socket.on("booking:updated", () => refetch())
    return () => {
      socket.disconnect()
    }
  }, [refetch])

  return (
    <RequireRole roles={[]}> {/* any authenticated user */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8">
        <h1 className="text-2xl font-semibold mb-4">My Bookings</h1>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(data?.bookings || data || []).map((b: any) => (
              <div key={b.id || b._id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.facility?.name || b.facilityName || "Booking"}</div>
                  <div className="text-sm text-slate-600">{b.startDate} → {b.endDate}</div>
                </div>
                <div className="text-sm">{b.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}