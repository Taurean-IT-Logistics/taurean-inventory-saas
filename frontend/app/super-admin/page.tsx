"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import io from "socket.io-client"
import { useEffect, useState } from "react"

export default function SuperAdminDashboardPage() {
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token: typeof window !== "undefined" ? localStorage.getItem("fh_access") : undefined },
    })
    const handler = (e: any) => setEvents((prev) => [JSON.stringify(e), ...prev].slice(0, 20))
    socket.on("notification:company", handler)
    socket.on("notification:user", handler)
    socket.on("invoice:created", handler)
    socket.on("transaction:created", handler)
    return () => socket.disconnect()
  }, [])

  return (
    <RequireRole roles={["super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Super Admin</h1>
        <p className="text-sm text-slate-600">Live events</p>
        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-slate-500">No events yet.</p>
          ) : (
            events.map((ev, idx) => (
              <div key={idx} className="text-xs break-all border rounded p-2 bg-slate-50">{ev}</div>
            ))
          )}
        </div>
      </div>
    </RequireRole>
  )
}