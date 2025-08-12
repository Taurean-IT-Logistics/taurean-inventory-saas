"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InvoicesAPI, TaxSchedulesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function AdminInvoicesPage() {
  const qc = useQueryClient()
  const { data: invData, isLoading: li } = useQuery({ queryKey: ["company-invoices"], queryFn: () => InvoicesAPI.listCompany() })
  const { data: recData, isLoading: lr } = useQuery({ queryKey: ["company-receipts"], queryFn: () => InvoicesAPI.receiptsCompany() })
  const { data: schedules } = useQuery({ queryKey: ["tax-schedules"], queryFn: () => TaxSchedulesAPI.list() })

  const [customerId, setCustomerId] = useState("")
  const [currency, setCurrency] = useState("GHS")
  const [taxScheduleId, setTaxScheduleId] = useState("")
  const [lines, setLines] = useState<Array<{
    sku?: string
    description: string
    quantity: number
    unitPrice: number
    duration: number
    durationPeriod: string
  }>>([
    { description: "", quantity: 1, unitPrice: 0, duration: 1, durationPeriod: "Days" },
  ])

  const addLine = () => setLines((arr) => [...arr, { description: "", quantity: 1, unitPrice: 0, duration: 1, durationPeriod: "Days" }])
  const updateLine = (i: number, k: string, v: any) => setLines((arr) => arr.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)))
  const removeLine = (i: number) => setLines((arr) => arr.filter((_, idx) => idx !== i))

  const createInv = useMutation({
    mutationFn: async () => InvoicesAPI.create({ customerId, currency, taxScheduleId, lines }),
    onSuccess: () => {
      setCustomerId("")
      setCurrency("GHS")
      setTaxScheduleId("")
      setLines([{ description: "", quantity: 1, unitPrice: 0, duration: 1, durationPeriod: "Days" }])
      qc.invalidateQueries({ queryKey: ["company-invoices"] })
    },
  })

  const [payRef, setPayRef] = useState("")
  const [payMethod, setPayMethod] = useState("card")
  const markPaid = useMutation({
    mutationFn: async (id: string) => InvoicesAPI.pay(id, { method: payMethod, provider: "paystack", reference: payRef, timestamp: new Date().toISOString() }),
    onSuccess: () => {
      setPayRef("")
      qc.invalidateQueries({ queryKey: ["company-invoices"] })
      qc.invalidateQueries({ queryKey: ["company-receipts"] })
    },
  })

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-8">
        <h1 className="text-2xl font-semibold">Invoices</h1>

        <div className="space-y-3 border rounded-md p-4">
          <h2 className="font-semibold">Create Invoice</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Customer ID</Label>
              <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
            <div>
              <Label>Tax Schedule</Label>
              <select className="border rounded-md px-2 py-2 w-full" value={taxScheduleId} onChange={(e) => setTaxScheduleId(e.target.value)}>
                <option value="">None</option>
                {(schedules?.schedules || schedules || []).map((s: any) => (
                  <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            {lines.map((ln, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                <div>
                  <Label>Description</Label>
                  <Input value={ln.description} onChange={(e) => updateLine(i, "description", e.target.value)} />
                </div>
                <div>
                  <Label>Qty</Label>
                  <Input type="number" value={ln.quantity} onChange={(e) => updateLine(i, "quantity", Number(e.target.value))} />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input type="number" value={ln.unitPrice} onChange={(e) => updateLine(i, "unitPrice", Number(e.target.value))} />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input type="number" value={ln.duration} onChange={(e) => updateLine(i, "duration", Number(e.target.value))} />
                </div>
                <div>
                  <Label>Period</Label>
                  <Input value={ln.durationPeriod} onChange={(e) => updateLine(i, "durationPeriod", e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => removeLine(i)}>Remove</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addLine}>Add Line</Button>
          </div>
          <div>
            <Button onClick={() => createInv.mutate()} disabled={!customerId || lines.some((l) => !l.description)}>
              {createInv.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold">Company Invoices</h2>
        {li ? <p>Loading...</p> : (
          <div className="grid gap-3">
            {(invData?.invoices || invData || []).map((inv: any) => (
              <div key={inv._id || inv.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{inv.reference || inv._id}</div>
                    <div className="text-sm text-slate-600">{inv.status} • {inv.currency}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Paystack reference" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
                    <Button size="sm" onClick={() => markPaid.mutate(inv._id || inv.id)} disabled={!payRef}>Mark Paid</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-xl font-semibold">Company Receipts</h2>
        {lr ? <p>Loading...</p> : (
          <div className="grid gap-3">
            {(recData?.receipts || recData || []).map((r: any) => (
              <div key={r._id || r.id} className="border rounded-md p-4">
                <div className="font-medium">{r.invoice}</div>
                <div className="text-sm text-slate-600">{r.amount} • {r.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}