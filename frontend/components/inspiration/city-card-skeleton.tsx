import { Skeleton } from "@/components/ui/skeleton"

export function CityCardSkeleton() {
  return (
    <div className="cursor-pointer group">
      <div className="relative mb-3">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
        <div className="absolute bottom-4 left-4">
          <Skeleton className="h-6 w-32 mb-1 bg-white/20" />
          <Skeleton className="h-4 w-24 bg-white/20" />
        </div>
      </div>
    </div>
  )
}
