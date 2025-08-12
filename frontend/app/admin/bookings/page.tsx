"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BookingsAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function AdminBookingsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => BookingsAPI.listAll() })

  const updateStatus = useMutation({
    mutationFn: async (payload: { id: string; status: string }) => BookingsAPI.update(payload.id, { status: payload.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  })

  const checkIn = useMutation({
    mutationFn: async (id: string) => BookingsAPI.checkIn(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  })

  const checkOut = useMutation({
    mutationFn: async (id: string) => BookingsAPI.checkOut(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  })

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-3">
            {(data?.bookings || data || []).map((b: any) => (
              <div key={b._id || b.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.facility?.name || b.facilityName || "Booking"}</div>
                    <div className="text-sm text-slate-600">{b.startDate} → {b.endDate}</div>
                  </div>
                  <div className="text-sm">Status: {b.status}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: b._id || b.id, status: "confirmed" })}>Confirm</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: b._id || b.id, status: "cancelled" })}>Cancel</Button>
                  <Button size="sm" onClick={() => checkIn.mutate(b._id || b.id)}>Check-in</Button>
                  <Button size="sm" onClick={() => checkOut.mutate(b._id || b.id)}>Check-out</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}