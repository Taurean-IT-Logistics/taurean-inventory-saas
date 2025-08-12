"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CartAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { RequireRole } from "@/components/auth/RequireRole"

export default function CartPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["cart"], queryFn: () => CartAPI.list() })
  const items = data?.items || data || []

  const removeMut = useMutation({
    mutationFn: async (payload: any) => CartAPI.remove(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  })

  const checkoutMut = useMutation({
    mutationFn: async () => CartAPI.checkout(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  })

  return (
    <RequireRole roles={[]}> {/* any authenticated user */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Cart</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {items.map((it: any, idx: number) => (
              <div key={idx} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.name || it.title || it.id}</div>
                  <div className="text-sm text-slate-600">{it.type} × {it.quantity || 1}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeMut.mutate({ id: it.id, type: it.type })}>Remove</Button>
              </div>
            ))}
            <div className="pt-2">
              <Button onClick={() => checkoutMut.mutate()} disabled={checkoutMut.isPending}>
                {checkoutMut.isPending ? "Processing..." : "Checkout"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  )
}