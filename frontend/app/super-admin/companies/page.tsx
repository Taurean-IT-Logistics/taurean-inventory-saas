"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CompaniesAPI } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function CompaniesAdminPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["companies"], queryFn: () => CompaniesAPI.listAll() })

  const suspend = useMutation({
    mutationFn: async (id: string) => CompaniesAPI.suspend(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  })
  const activate = useMutation({
    mutationFn: async (id: string) => CompaniesAPI.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  })

  const [subaccount, setSubaccount] = useState("")
  const [feePercent, setFeePercent] = useState<number>(5)
  const [companyId, setCompanyId] = useState("")
  const updatePayout = useMutation({
    mutationFn: async () => CompaniesAPI.updatePayoutConfig({ companyId, subaccountCode: subaccount, feePercent }),
  })

  return (
    <RequireRole roles={["super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Companies</h1>
        {isLoading ? <p>Loading...</p> : (
          <div className="grid gap-3">
            {(data?.companies || data || []).map((c: any) => (
              <div key={c._id || c.id} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-slate-600">Active: {String(c.isActive)} • Currency: {c.currency} • Plan: {c.subscription?.plan}</div>
                </div>
                <div className="flex gap-2">
                  {c.isActive ? (
                    <Button size="sm" variant="destructive" onClick={() => suspend.mutate(c._id || c.id)}>Suspend</Button>
                  ) : (
                    <Button size="sm" onClick={() => activate.mutate(c._id || c.id)}>Activate</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 border rounded-md p-4">
          <h2 className="font-semibold">Update Payout Config</h2>
          <Input placeholder="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
          <Input placeholder="Paystack Subaccount Code" value={subaccount} onChange={(e) => setSubaccount(e.target.value)} />
          <Input type="number" placeholder="Fee Percent" value={feePercent} onChange={(e) => setFeePercent(Number(e.target.value))} />
          <Button onClick={() => updatePayout.mutate()} disabled={!companyId}>Save</Button>
        </div>
      </div>
    </RequireRole>
  )
}