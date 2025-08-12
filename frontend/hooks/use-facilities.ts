"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Facility } from "@/components/facilities/facility-card"
import { FacilitiesAPI } from "@/lib/api"

export function useFacilities(location?: string) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchFacilities = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      setError(null)

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

      setFacilities(mapped)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load facilities"
      setError(errorMessage)

      if (retryCount < 2) {
        toast({ title: "Retrying...", description: `Attempt ${retryCount + 2} of 3` })
        setTimeout(() => fetchFacilities(retryCount + 1), 1500)
      } else {
        toast({ title: "Failed to load facilities", description: errorMessage, variant: "destructive" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (facilityId: string) => {
    // optimistic toggle (backend integration TBD)
    setFacilities((prev) =>
      prev.map((facility) =>
        facility.id === facilityId ? { ...facility, isFavorite: !facility.isFavorite } : facility,
      ),
    )
  }

  const retry = () => {
    fetchFacilities(0)
  }

  useEffect(() => {
    fetchFacilities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  return {
    facilities,
    isLoading,
    error,
    retry,
    toggleFavorite,
  }
}
