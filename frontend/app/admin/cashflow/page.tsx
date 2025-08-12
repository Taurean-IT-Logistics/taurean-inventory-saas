"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useQuery } from "@tanstack/react-query"
import { CashflowAPI } from "@/lib/api"

export default function CashflowPage() {
  const { data: summary, isLoading: ls } = useQuery({ queryKey: ["cashflow-summary"], queryFn: () => CashflowAPI.summary() })
  const { data: anomalies, isLoading: la } = useQuery({ queryKey: ["cashflow-anomalies"], queryFn: () => CashflowAPI.anomalies() })

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Cash Flow</h1>
        {ls ? <p>Loading summary...</p> : <pre className="bg-slate-50 p-3 rounded-md overflow-auto text-sm">{JSON.stringify(summary, null, 2)}</pre>}
        <h2 className="text-xl font-semibold">Anomalies</h2>
        {la ? <p>Loading anomalies...</p> : <pre className="bg-slate-50 p-3 rounded-md overflow-auto text-sm">{JSON.stringify(anomalies, null, 2)}</pre>}
      </div>
    </RequireRole>
  )
}