"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UsersAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => UsersAPI.list() })
  const roleMut = useMutation({
    mutationFn: async (payload: { id: string; role: string }) => UsersAPI.updateRole(payload.id, payload.role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  })

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const rows = useMemo(() => (data?.users || data || []), [data])
  const filtered = useMemo(() => rows.filter((u: any) => (u.name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase())), [rows, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Input placeholder="Search by name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto border rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((u: any) => (
                  <tr key={u._id || u.id} className="border-t">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => roleMut.mutate({ id: u._id || u.id, role: "user" })}>User</Button>
                        <Button size="sm" variant="outline" onClick={() => roleMut.mutate({ id: u._id || u.id, role: "staff" })}>Staff</Button>
                        <Button size="sm" variant="outline" onClick={() => roleMut.mutate({ id: u._id || u.id, role: "admin" })}>Admin</Button>
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