"use client"

import { useMemo, useState } from "react"
import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FacilitiesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

export default function AdminFacilitiesPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-facilities"], queryFn: () => FacilitiesAPI.list({ limit: 200 }) })
  const [name, setName] = useState("")
  const [city, setCity] = useState("")

  const createMut = useMutation({
    mutationFn: async () => FacilitiesAPI.create({ name, location: city }),
    onSuccess: () => { setName(""); setCity(""); qc.invalidateQueries({ queryKey: ["admin-facilities"] }) },
  })
  const deleteMut = useMutation({
    mutationFn: async (id: string) => FacilitiesAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-facilities"] }),
  })

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const rows = useMemo(() => (data?.items || data?.facilities || data || []), [data])
  const filtered = useMemo(() => rows.filter((f: any) => (f.name || "").toLowerCase().includes(search.toLowerCase())), [rows, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Facilities</h1>
        <div className="flex gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Button onClick={() => createMut.mutate()} disabled={!name || !city || createMut.isPending}>{createMut.isPending ? "Creating..." : "Create"}</Button>
        </div>
        <Input placeholder="Search facilities" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto border rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((f: any) => (
                  <tr key={f._id || f.id} className="border-t">
                    <td className="p-2">{f.name}</td>
                    <td className="p-2">{f.location?.city || f.location}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/facilities/${f._id || f.id}`}>Edit</a>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate(f._id || f.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }} />
            </PaginationItem>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1) }}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </RequireRole>
  )
}