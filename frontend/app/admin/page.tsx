"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useQuery } from "@tanstack/react-query"
import { FacilitiesAPI } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import io from "socket.io-client"
import { useEffect } from "react"

export default function AdminDashboardPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-facilities"], queryFn: () => FacilitiesAPI.list({ limit: 10 }) })

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token: typeof window !== "undefined" ? localStorage.getItem("fh_access") : undefined },
    })
    socket.on("inventory:created", () => refetch())
    socket.on("inventory:updated", () => refetch())
    socket.on("inventory:deleted", () => refetch())
    socket.on("notification:company", () => refetch())
    return () => socket.disconnect()
  }, [refetch])

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <a className="underline" href="/admin/facilities">Manage Facilities</a>
          <a className="underline" href="/admin/users">Manage Users</a>
          <a className="underline" href="/admin/bookings">Manage Bookings</a>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data?.items || data?.facilities || data || []).map((f: any) => (
              <div key={f._id || f.id} className="border rounded-md p-4">
                <div className="font-medium">{f.name}</div>
                <div className="text-sm text-slate-600">{f.location?.city || f.location}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}