"use client"

import { RequireRole } from "@/components/auth/RequireRole"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UsersAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => UsersAPI.list() })

  const roleMut = useMutation({
    mutationFn: async (payload: { id: string; role: string }) => UsersAPI.updateRole(payload.id, payload.role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  })

  return (
    <RequireRole roles={["admin", "staff", "super-admin"]}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-3">
            {(data?.users || data || []).map((u: any) => (
              <div key={u._id || u.id} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.name} <span className="text-xs text-slate-500">({u.email})</span></div>
                  <div className="text-sm text-slate-600">Role: {u.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="role" defaultValue={u.role} onBlur={(e) => roleMut.mutate({ id: u._id || u.id, role: e.target.value })} />
                  <Button size="sm" variant="outline" onClick={() => roleMut.mutate({ id: u._id || u.id, role: "user" })}>Set user</Button>
                  <Button size="sm" variant="outline" onClick={() => roleMut.mutate({ id: u._id || u.id, role: "staff" })}>Set staff</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  )
}