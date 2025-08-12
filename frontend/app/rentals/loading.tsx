import { Skeleton } from "@/components/ui/skeleton"
import { RentalCardSkeleton } from "@/components/rentals/rental-card-skeleton"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 py-8 space-y-10">
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-80 mx-auto" />
        <Skeleton className="h-5 w-[28rem] mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <RentalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}