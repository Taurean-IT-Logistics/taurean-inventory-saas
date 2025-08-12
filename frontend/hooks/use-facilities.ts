"use client"

import { useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Facility } from "@/components/facilities/facility-card"
import { FacilitiesAPI } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export function useFacilities(location?: string) {
  const { toast } = useToast()

  const query = useQuery({
    queryKey: ["facilities", { location }],
    queryFn: async () => {
      const data: any = await FacilitiesAPI.list({ location, limit: 16 })
      const items = data.items || data.facilities || data
      const mapped: Facility[] = (items || []).map((it: any) => ({
        id: String(it._id || it.id),
        name: it.name || it.title || "Facility",
        location: it.location?.city || it.city || it.location || "",
        price: it.price?.amount || it.price || 0,
        currency: it.price?.currency || it.currency || "GHS",
        duration: it.duration || it.billingPeriod || "",
        rating: it.rating?.overall || it.rating || 0,
        reviewCount: it.reviewsCount || it.reviewCount || 0,
        imageUrl: it.images?.[0]?.url || it.coverImage || "/placeholder.svg?height=200&width=300",
        isGuestFavorite: Boolean(it.isGuestFavorite),
        isFavorite: Boolean(it.isFavorite),
      }))
      return mapped
    },
    retry: 2,
    staleTime: 1000 * 30,
  })

  const { data, isLoading, error, refetch, isRefetching } = query

  const facilities = data || []
  const errorMessage = error instanceof Error ? error.message : null

  const retry = () => {
    refetch()
    if (errorMessage) toast({ title: "Retrying..." })
  }

  const toggleFavorite = async (facilityId: string) => {
    // This could use a mutation; for UI demo we leave it as a no-op here
    // Use optimistic updates with setQueryData in a real favorite mutation
  }

  return {
    facilities,
    isLoading: isLoading || isRefetching,
    error: errorMessage,
    retry,
    toggleFavorite,
  }
}
