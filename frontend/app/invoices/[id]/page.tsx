"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { InvoicesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data: mine } = useQuery({ queryKey: ["my-invoices"], queryFn: () => InvoicesAPI.listMine() })
  const { data: company } = useQuery({ queryKey: ["company-invoices"], queryFn: () => InvoicesAPI.listCompany() })

  const invoice = useMemo(() => {
    const all = [...(mine?.invoices || mine || []), ...(company?.invoices || company || [])]
    return all.find((i: any) => String(i._id || i.id) === String(id))
  }, [mine, company, id])

  const onPrint = () => window.print()

  if (!invoice) return <div className="max-w-3xl mx-auto px-4 pt-28">Invoice not found.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-12 print:pt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Invoice {invoice.reference || invoice._id}</h1>
        <Button onClick={onPrint}>Print / Save PDF</Button>
      </div>
      <div className="border rounded-md p-6 bg-white">
        <div className="mb-4">
          <div>Status: {invoice.status}</div>
          <div>Currency: {invoice.currency}</div>
          <div>Date: {new Date(invoice.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Line Items</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Duration</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.lines || []).map((ln: any, idx: number) => (
                <tr key={idx}>
                  <td>{ln.description}</td>
                  <td>{ln.quantity}</td>
                  <td>{ln.unitPrice}</td>
                  <td>{ln.duration} {ln.durationPeriod}</td>
                  <td>{(ln.quantity || 0) * (ln.unitPrice || 0) * (ln.duration || 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}