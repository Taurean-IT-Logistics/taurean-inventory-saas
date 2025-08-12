"use client"

import { Header } from "@/components/layout/header"
import { RentalGrid } from "@/components/rentals/rental-grid"
import { Footer } from "@/components/layout/footer"
import { useState } from "react"

// Mock rental data
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
  // Add more mock rentals...
]

export default function RentalsPage() {
  const [rentals] = useState(mockRentals)

  const handleFavoriteToggle = async (rentalId: string) => {
    // Handle favorite toggle logic
    console.log("Toggle favorite for rental:", rentalId)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 py-8 space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Equipment Rentals</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Rent professional equipment for your events, projects, and special occasions
          </p>
        </div>

        <RentalGrid title="Popular equipment rentals" rentals={rentals} onFavoriteToggle={handleFavoriteToggle} />

        <RentalGrid
          title="Audio & Visual Equipment"
          rentals={rentals.filter((r) => r.category.includes("Audio") || r.category.includes("Photography"))}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </main>

      <Footer />
    </div>
  )
}
