"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Facility } from "@/components/facilities/facility-card"

// Mock data - replace with actual API calls
const mockFacilities: Facility[] = [
  {
    id: "1",
    name: "Conference Hall in Accra",
    location: "Accra",
    price: 938,
    currency: "GHC",
    duration: "2 hours",
    rating: 5.0,
    reviewCount: 12,
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-12%20130436-4IXrmMA0JsiKTmAimGfcDfEu9Ust4u.png",
    isGuestFavorite: true,
  },
  {
    id: "2",
    name: "Event Hall in Accra",
    location: "Accra",
    price: 1203,
    currency: "GHC",
    duration: "2 hours",
    rating: 4.79,
    reviewCount: 8,
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    name: "Meeting Room in Accra",
    location: "Accra",
    price: 711,
    currency: "GHC",
    duration: "2 hours",
    rating: 4.79,
    reviewCount: 15,
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "4",
    name: "Outdoor Space in Accra",
    location: "Accra",
    price: 1443,
    currency: "GHC",
    duration: "2 hours",
    rating: 4.93,
    reviewCount: 6,
    imageUrl: "/placeholder.svg?height=200&width=300",
    isGuestFavorite: true,
  },
]

export function useFacilities(location?: string) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchFacilities = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      setError(null)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate occasional failures for demo
      if (Math.random() < 0.1 && retryCount === 0) {
        throw new Error("Network error occurred")
      }

      setFacilities(mockFacilities)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load facilities"
      setError(errorMessage)

      if (retryCount < 2) {
        toast({
          title: "Retrying...",
          description: `Attempt ${retryCount + 2} of 3`,
        })
        setTimeout(() => fetchFacilities(retryCount + 1), 2000)
      } else {
        toast({
          title: "Failed to load facilities",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (facilityId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

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
  }, [location])

  return {
    facilities,
    isLoading,
    error,
    retry,
    toggleFavorite,
  }
}
