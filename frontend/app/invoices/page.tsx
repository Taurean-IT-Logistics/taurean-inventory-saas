"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useQuery } from "@tanstack/react-query"
import { InvoicesAPI } from "@/lib/api"
import Link from "next/link"

export default function MyInvoicesPage() {
  const { data: invoicesData, isLoading: li } = useQuery({ queryKey: ["my-invoices"], queryFn: () => InvoicesAPI.listMine() })
  const { data: receiptsData, isLoading: lr } = useQuery({ queryKey: ["my-receipts"], queryFn: () => InvoicesAPI.receiptsMine() })

  return (
    <RequireRole roles={[]}> {/* any authenticated user */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">My Invoices</h1>
        {li ? <p>Loading invoices...</p> : (
          <div className="grid gap-3">
            {(invoicesData?.invoices || invoicesData || []).map((inv: any) => (
              <Link key={inv._id || inv.id} href={`/invoices/${inv._id || inv.id}`} className="border rounded-md p-4 block">
                <div className="font-medium">{inv.reference || inv._id}</div>
                <div className="text-sm text-slate-600">{inv.status} • {inv.currency}</div>
              </Link>
            ))}
          </div>
        )}
        <h2 className="text-xl font-semibold">Receipts</h2>
        {lr ? <p>Loading receipts...</p> : (
          <div className="grid gap-3">
            {(receiptsData?.receipts || receiptsData || []).map((r: any) => (
              <Link key={r._id || r.id} href={`/receipts/${r._id || r.id}`} className="border rounded-md p-4 block">
                <div className="font-medium">{r.invoice || r.invoiceId}</div>
                <div className="text-sm text-slate-600">{r.amount} • {r.timestamp}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}