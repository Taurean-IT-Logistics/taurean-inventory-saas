import { Skeleton } from "@/components/ui/skeleton"

export function FacilityCardSkeleton() {
  return (
    <div className="cursor-pointer group">
      <div className="relative mb-3">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="pt-1">
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  )
}
