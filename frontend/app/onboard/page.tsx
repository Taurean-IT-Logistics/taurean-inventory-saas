"use client"

import { useState } from "react"
import { CompaniesAPI } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PhoneInput } from "@/components/ui/phone-input"

export default function OnboardPage() {
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    registrationDocs: "",
    location: "",
    contactEmail: "",
    contactPhone: "+233 ",
    invoiceFormat: "auto",
    currency: "GHS",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      await CompaniesAPI.onboard(form)
      setMessage("Company onboarded. Our team will reach out.")
      setForm({ name: "", logoUrl: "", registrationDocs: "", location: "", contactEmail: "", contactPhone: "+233 ", invoiceFormat: "auto", currency: "GHS" })
    } catch (e: any) {
      setMessage(e.message || "Failed to onboard")
    } finally {
      setLoading(false)
    }
  }

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-12">
      <h1 className="text-2xl font-semibold mb-6">Company Onboarding</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="name">Company Name</Label>
          <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="logoUrl">Company Logo URL</Label>
          <Input id="logoUrl" value={form.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="registrationDocs">Registration Documents (URL)</Label>
          <Input id="registrationDocs" value={form.registrationDocs} onChange={(e) => update("registrationDocs", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
        </div>
        <div>
          <Label>Contact Phone</Label>
          <PhoneInput value={form.contactPhone} onChange={(v) => update("contactPhone", v)} />
        </div>
        <div>
          <Label htmlFor="invoiceFormat">Preferred Invoice Format</Label>
          <Input id="invoiceFormat" value={form.invoiceFormat} onChange={(e) => update("invoiceFormat", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" value={form.currency} onChange={(e) => update("currency", e.target.value)} />
        </div>
        {message && <p className="text-sm">{message}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</Button>
      </form>
    </div>
  )
}