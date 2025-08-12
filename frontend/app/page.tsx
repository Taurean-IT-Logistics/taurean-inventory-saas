"use client"

import { Header } from "@/components/layout/header"
import { FacilityGrid } from "@/components/facilities/facility-grid"
import { RentalGrid } from "@/components/rentals/rental-grid"
import { TopHosts } from "@/components/hosts/top-hosts"
import { CityInspiration } from "@/components/inspiration/city-inspiration"
import { HostBanner } from "@/components/layout/host-banner"
import { Footer } from "@/components/layout/footer"
import { useFacilities } from "@/hooks/use-facilities"
import { useState } from "react"

export default function FacilityRentalPlatform() {
  const [searchLocation, setSearchLocation] = useState<string>("")
  const { facilities, isLoading, error, retry, toggleFavorite } = useFacilities(searchLocation)
  const [rentals] = useState(mockRentals)

  const popularFacilities = facilities.slice(0, 8)
  const weekendFacilities = facilities.slice(8, 16)

  const handleRentalFavoriteToggle = async (rentalId: string) => {
    console.log("Toggle favorite for rental:", rentalId)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 py-8 space-y-16">
        <FacilityGrid
          title="Popular facilities in Accra"
          facilities={popularFacilities}
          isLoading={isLoading}
          error={error}
          onRetry={retry}
          onFavoriteToggle={toggleFavorite}
        />

      	<FacilityGrid
          title="Available in East Legon this weekend"
          facilities={weekendFacilities}
          isLoading={isLoading}
          error={error}
          onRetry={retry}
          onFavoriteToggle={toggleFavorite}
        />

        <RentalGrid title="Popular equipment rentals" rentals={rentals} onFavoriteToggle={handleRentalFavoriteToggle} />

        <TopHosts />

        <CityInspiration />
      </main>

      <HostBanner />
      <Footer />
    </div>
  )
}

const mockRentals = [
  {
    id: "1",
    name: "Professional Camera Kit",
    category: "Photography Equipment",
    location: "Accra, Ghana",
    price: 150,
    currency: "GH₵",
    duration: "day",
    rating: 4.9,
    reviewCount: 23,
    imageUrl: "/placeholder.svg?height=400&width=300",
    availability: "available" as const,
    isFavorite: false,
  },
  {
    id: "2",
    name: "Sound System Package",
    category: "Audio Equipment",
    location: "East Legon, Accra",
    price: 300,
    currency: "GH₵",
    duration: "day",
    rating: 4.8,
    reviewCount: 45,
    imageUrl: "/placeholder.svg?height=400&width=300",
    availability: "limited" as const,
    isFavorite: true,
  },
]
