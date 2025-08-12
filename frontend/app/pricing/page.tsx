"use client"

import { useQuery } from "@tanstack/react-query"
import { CompaniesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PricingPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["pricing"], queryFn: () => CompaniesAPI.pricing() })
  const plans = data?.plans || []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 py-12">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">Failed to load pricing</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p: any) => (
          <div key={p.id} className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">{p.label}</h2>
            <p className="text-sm text-slate-600 mb-4">All features included</p>
            <Link href="/onboard">
              <Button className="w-full">Get started</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}