"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link className="underline" href="/admin/facilities">Manage Facilities</Link>
          <Link className="underline" href="/admin/users">Manage Users</Link>
          <Link className="underline" href="/admin/bookings">Manage Bookings</Link>
          <Link className="underline" href="/admin/inventory">Inventory</Link>
          <Link className="underline" href="/admin/invoices">Invoices</Link>
          <Link className="underline" href="/admin/taxes">Taxes</Link>
          <Link className="underline" href="/admin/transactions">Transactions</Link>
          <Link className="underline" href="/admin/cashflow">Cashflow</Link>
          <Link className="underline" href="/admin/settings">Settings</Link>
        </div>
      </div>
    </RequireRole>
  )
}