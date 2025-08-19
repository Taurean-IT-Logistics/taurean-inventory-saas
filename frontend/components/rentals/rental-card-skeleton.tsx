import { Skeleton } from "@/components/ui/skeleton"

export function RentalCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Skeleton className="aspect-[4/3] rounded-2xl" />
        <Skeleton className="absolute top-3 right-3 w-8 h-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-8 ml-2" />
        </div>
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}
