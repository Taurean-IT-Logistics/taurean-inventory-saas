"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Share, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import type { Metadata } from "next"
import { CartAPI } from "@/lib/api"

export default function RentalDetailPage({ params }: { params: { id: string } }) {
  const [isFavorited, setIsFavorited] = useState(false)

  // Mock rental data - in real app, fetch based on params.id
  const rental = {
    id: params.id,
    name: "Professional Camera Kit",
    category: "Photography Equipment",
    location: "Accra, Ghana",
    price: 150,
    currency: "GH₵",
    duration: "day",
    rating: 4.9,
    reviewCount: 23,
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
    ],
    availability: "available",
    description:
      "Complete professional camera kit including DSLR camera, multiple lenses, tripod, and accessories. Perfect for events, photoshoots, and professional projects.",
    features: [
      "Canon EOS R5 Camera",
      "24-70mm f/2.8 Lens",
      "70-200mm f/2.8 Lens",
      "Professional Tripod",
      "Camera Bag",
      "Extra Batteries",
    ],
    host: {
      name: "Michael Asante",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.9,
      reviewCount: 156,
      responseTime: "within an hour",
    },
  }

  const addToCart = async () => {
    await CartAPI.add({ id: params.id, type: "inventory" })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{rental.name}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-slate-900" />
              <span className="font-medium">{rental.rating}</span>
              <span>({rental.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{rental.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                <Share className="h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => setIsFavorited(!isFavorited)}>
                <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
              <div className="col-span-2 aspect-[2/1]">
                <Image
                  src={rental.images[0] || "/placeholder.svg"}
                  alt={rental.name}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">About this rental</h2>
                <p className="text-slate-600 leading-relaxed">{rental.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">What's included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rental.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-900 rounded-full" />
                      <span className="text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="border border-slate-200 rounded-2xl p-6 shadow-lg">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold">
                      {rental.currency}
                      {rental.price}
                    </span>
                    <span className="text-slate-600">per {rental.duration}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {rental.availability === "available" ? "Available" : "Limited availability"}
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-slate-200 rounded-lg p-3">
                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Start Date</label>
                      <div className="text-sm font-medium">Add dates</div>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-3">
                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">End Date</label>
                      <div className="text-sm font-medium">Add dates</div>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Duration</label>
                    <div className="text-sm font-medium">1 day</div>
                  </div>
                </div>

                <Link href={`/rental/${rental.id}/book`}>
                  <Button className="w-full bg-[#1e3a5f] hover:bg-[#2d4a6b] text-white py-3 text-base font-medium">
                    Reserve
                  </Button>
                </Link>

                <p className="text-center text-sm text-slate-500 mt-3">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button onClick={addToCart}>Add to Cart</Button>
          <Link href="/cart">
            <Button variant="outline">Go to Cart</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
