"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InventoryAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function AdminInventoryPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["inventory"], queryFn: () => InventoryAPI.list() })

  const [name, setName] = useState("")
  const [qty, setQty] = useState<number>(1)

  const createMut = useMutation({
    mutationFn: async () => InventoryAPI.create({ name, quantity: qty }),
    onSuccess: () => {
      setName("")
      setQty(1)
      qc.invalidateQueries({ queryKey: ["inventory"] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: async (id: string) => InventoryAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  })

  const returnMut = useMutation({
    mutationFn: async (payload: { id: string; quantity: number; condition: string; returnedBy: string }) =>
      InventoryAPI.returnItem(payload.id, { quantity: payload.quantity, condition: payload.condition, returnedBy: payload.returnedBy }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  })

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Inventory</h1>

        <div className="flex gap-2">
          <Input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" placeholder="Qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          <Button onClick={() => createMut.mutate()} disabled={!name || !qty}>Create</Button>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-3">
            {(data?.items || data || []).map((it: any) => (
              <div key={it._id || it.id} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-slate-600">Qty: {it.quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => returnMut.mutate({ id: it._id || it.id, quantity: 1, condition: "Good", returnedBy: "Front desk" })}>Return 1</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate(it._id || it.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}