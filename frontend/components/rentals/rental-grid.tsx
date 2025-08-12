"use client"

import { RentalCard, type Rental } from "./rental-card"
import { RentalCardSkeleton } from "./rental-card-skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import Link from "next/link"

interface RentalGridProps {
  title: string
  rentals: Rental[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onFavoriteToggle?: (rentalId: string) => void
}

export function RentalGrid({
  title,
  rentals,
  isLoading = false,
  error = null,
  onRetry,
  onFavoriteToggle,
}: RentalGridProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-2 rounded-full border border-gray-200 hover:border-gray-300">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Link href="/rentals" className="hover:underline">
            <h2 className="text-2xl font-semibold text-slate-900">{title} ›</h2>
          </Link>
        </div>
        <Button variant="ghost" size="sm" className="p-2 rounded-full border border-gray-200 hover:border-gray-300">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => <RentalCardSkeleton key={index} />)
          : rentals.map((rental) => <RentalCard key={rental.id} rental={rental} onFavoriteToggle={onFavoriteToggle} />)}
      </div>
    </section>
  )
}
