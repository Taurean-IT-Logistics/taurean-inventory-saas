"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TaxSchedulesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function TaxSchedulesAdminPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["tax-schedules"], queryFn: () => TaxSchedulesAPI.list() })
  const [name, setName] = useState("")
  const [componentsStr, setComponentsStr] = useState("")
  const [startDate, setStartDate] = useState("")
  const [sunsetDate, setSunsetDate] = useState("")

  const createMut = useMutation({
    mutationFn: async () => {
      const components = componentsStr.split(",").map((c) => c.trim()).filter(Boolean)
      if (components.length < 4) throw new Error("At least 4 components required")
      return TaxSchedulesAPI.create({ name, components, startDate, sunsetDate })
    },
    onSuccess: () => {
      setName("")
      setComponentsStr("")
      setStartDate("")
      setSunsetDate("")
      qc.invalidateQueries({ queryKey: ["tax-schedules"] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: async (id: string) => TaxSchedulesAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tax-schedules"] }),
  })

  return (
    <RequireRole roles={["super-admin"]}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Tax Schedules</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Components (comma separated, min 4)</Label>
            <Input value={componentsStr} onChange={(e) => setComponentsStr(e.target.value)} />
          </div>
          <div>
            <Label>Start</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Sunset</Label>
            <Input type="date" value={sunsetDate} onChange={(e) => setSunsetDate(e.target.value)} />
          </div>
          <div className="md:col-span-4">
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>Create</Button>
          </div>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-3">
            {(data?.schedules || data || []).map((s: any) => (
              <div key={s._id || s.id} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-slate-600">{(s.components || []).join(", ")}</div>
                  <div className="text-xs text-slate-500">{s.startDate} → {s.sunsetDate}</div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate(s._id || s.id)}>Delete</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}