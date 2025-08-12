"use client"

import { Button } from "@/components/ui/button"

export function HostBanner() {
  return (
    <section className="py-12 bg-gray-50 mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Become a host</h2>
          <p className="text-slate-600">It's easy to start hosting and earn extra income.</p>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3">Get started</Button>
        </div>
      </div>
    </section>
  )
}
