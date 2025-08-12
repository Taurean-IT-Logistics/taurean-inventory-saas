"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CompaniesAPI } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SubscriptionsAdminPage() {
  const [companyId, setCompanyId] = useState("")
  const [plan, setPlan] = useState("monthly")

  const activate = useMutation({
    mutationFn: async () => CompaniesAPI.activateSubscription({ companyId, plan, durationMonths: 0 }),
  })
  const renew = useMutation({
    mutationFn: async () => CompaniesAPI.renewSubscription({ companyId, plan, durationMonths: 0 }),
  })

  return (
    <RequireRole roles={["super-admin"]}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <Input placeholder="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
        <Input placeholder="Plan (monthly|biannual|annual|triannual)" value={plan} onChange={(e) => setPlan(e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={() => activate.mutate()} disabled={!companyId}>Activate</Button>
          <Button onClick={() => renew.mutate()} variant="outline" disabled={!companyId}>Renew</Button>
        </div>
      </div>
    </RequireRole>
  )
}