"use client"

import { useState } from "react"
import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FacilitiesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminFacilitiesPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-facilities"], queryFn: () => FacilitiesAPI.list({ limit: 50 }) })
  const [name, setName] = useState("")
  const [city, setCity] = useState("")

  const createMut = useMutation({
    mutationFn: async () => FacilitiesAPI.create({ name, location: city }),
    onSuccess: () => {
      setName("")
      setCity("")
      qc.invalidateQueries({ queryKey: ["admin-facilities"] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: async (id: string) => FacilitiesAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-facilities"] }),
  })

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Facilities</h1>

        <div className="flex gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Button onClick={() => createMut.mutate()} disabled={!name || !city || createMut.isPending}>
            {createMut.isPending ? "Creating..." : "Create"}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {(data?.items || data?.facilities || data || []).map((f: any) => (
              <div key={f._id || f.id} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-slate-600">{f.location?.city || f.location}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/admin/facilities/${f._id || f.id}`}>Edit</a>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate(f._id || f.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}