import { Skeleton } from "@/components/ui/skeleton"

export function HostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>

        <Skeleton className="h-5 w-20 mb-1" />
        <Skeleton className="h-4 w-24 mb-2" />

        <div className="flex items-center space-x-1 mb-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-10" />
        </div>

        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}
