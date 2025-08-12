"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useQuery } from "@tanstack/react-query"
import { TransactionsAPI } from "@/lib/api"

export default function TransactionsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["transactions"], queryFn: () => TransactionsAPI.listCompany() })

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-3">
            {(data?.transactions || data || []).map((t: any) => (
              <div key={t._id || t.id} className="border rounded-md p-4">
                <div className="font-medium">{t.reference}</div>
                <div className="text-sm text-slate-600">{t.amount} • {t.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}