import { Skeleton } from "@/components/ui/skeleton"
import { FacilityCardSkeleton } from "@/components/facilities/facility-card-skeleton"
import { RentalCardSkeleton } from "@/components/rentals/rental-card-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 py-8 space-y-16">
        <section className="space-y-6">
          <Skeleton className="h-8 w-80" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <FacilityCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <Skeleton className="h-8 w-96" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <FacilityCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <Skeleton className="h-8 w-80" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <RentalCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
