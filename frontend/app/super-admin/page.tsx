"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import Link from "next/link"

export default function SuperAdminDashboardPage() {
  return (
    <RequireRole roles={["super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Super Admin</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link className="underline" href="/super-admin/companies">Companies</Link>
          <Link className="underline" href="/super-admin/subscriptions">Subscriptions</Link>
          <Link className="underline" href="/super-admin/tax-schedules">Tax Schedules</Link>
        </div>
      </div>
    </RequireRole>
  )
}