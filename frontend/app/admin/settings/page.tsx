"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  const [currency, setCurrency] = useState("GHS")
  const [invoiceFormat, setInvoiceFormat] = useState("auto")
  const [message, setMessage] = useState<string | null>(null)

  const save = async () => {
    // TODO: create a dedicated settings endpoint; placeholder for now
    setMessage("Saved (demo)")
  }

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div>
          <Label>Currency</Label>
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>
        <div>
          <Label>Invoice Format</Label>
          <Input value={invoiceFormat} onChange={(e) => setInvoiceFormat(e.target.value)} />
        </div>
        {message && <p className="text-sm">{message}</p>}
        <Button onClick={save}>Save</Button>
      </div>
    </RequireRole>
  )
}