"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TaxesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function TaxesAdminPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["taxes"], queryFn: () => TaxesAPI.list() })

  const [name, setName] = useState("")
  const [rate, setRate] = useState<number>(0)

  const createMut = useMutation({
    mutationFn: async () => TaxesAPI.create({ name, rate }),
    onSuccess: () => {
      setName("")
      setRate(0)
      qc.invalidateQueries({ queryKey: ["taxes"] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: async (id: string) => TaxesAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taxes"] }),
  })

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Taxes</h1>
        <div className="flex gap-2 items-end">
          <div>
            <label className="text-sm">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Rate (%)</label>
            <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </div>
          <Button onClick={() => createMut.mutate()} disabled={!name}>Create</Button>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-3">
            {(data?.taxes || data || []).map((t: any) => (
              <div key={t._id || t.id} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-slate-600">{t.rate}%</div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate(t._id || t.id)}>Delete</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}