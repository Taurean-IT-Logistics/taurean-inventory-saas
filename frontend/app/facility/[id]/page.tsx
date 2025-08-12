"use client"

import { useState } from "react"
import { Heart, Share, Star, Wifi, Car, Tv, Snowflake, Users, MessageCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function FacilityDetailPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("photos")

  // Mock facility data
  const facility = {
    id: params.id,
    name: "The Avery Apartments at Clifton Place, East Legon",
    location: "Accra, Greater Accra Region, Ghana",
    rating: 5.0,
    reviewCount: 6,
    price: 1265,
    currency: "GH₵",
    duration: "2 nights",
    type: "Entire serviced apartment",
    details: "4 guests · 2 bedrooms · 2 beds · 2 baths",
    host: {
      name: "Pamela",
      avatar: "/placeholder.svg?height=80&width=80",
      yearsHosting: 5,
      rating: 4.71,
      reviewCount: 280,
      responseRate: "100%",
      responseTime: "within an hour",
      coHosts: [
        { name: "Earl", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "Emmanuel", avatar: "/placeholder.svg?height=40&width=40" },
      ],
    },
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=400",
      "/placeholder.svg?height=600&width=400",
      "/placeholder.svg?height=600&width=400",
      "/placeholder.svg?height=600&width=400",
    ],
    amenities: [
      { icon: Users, name: "Kitchen" },
      { icon: Wifi, name: "Wifi" },
      { icon: Car, name: "Free parking on premises" },
      { icon: Tv, name: "TV" },
      { icon: Users, name: "Pool" },
      { icon: Users, name: "Washer" },
      { icon: Snowflake, name: "Air conditioning" },
      { icon: Users, name: "Refrigerator" },
      { icon: Shield, name: "Exterior security cameras on property" },
    ],
    reviews: [
      {
        name: "Kwabena",
        avatar: "/placeholder.svg?height=40&width=40",
        timeOnPlatform: "5 months on Airbnb",
        date: "1 week ago",
        stay: "Stayed a few nights",
        rating: 5,
        comment: "Good stay",
      },
      {
        name: "Kontrast",
        avatar: "/placeholder.svg?height=40&width=40",
        timeOnPlatform: "3 years on Airbnb",
        date: "June 2025",
        stay: "Stayed a few nights",
        rating: 5,
        comment: "Blessings",
      },
      {
        name: "Jeha GABRIEL",
        avatar: "/placeholder.svg?height=40&width=40",
        timeOnPlatform: "4 years on Airbnb",
        date: "April 2024",
        stay: "Stayed a few nights",
        rating: 5,
        comment:
          "Pamela and Richel were amazing hosts. The check in was easy and the location was perfect. The neatness of the apartment got my heart: I love it. Will definitely be back again sometime...",
      },
      {
        name: "Joel",
        avatar: "/placeholder.svg?height=40&width=40",
        timeOnPlatform: "Everett, Massachusetts",
        date: "January 2024",
        stay: "Stayed a few nights",
        rating: 5,
        comment: "Excellent place, looking forward to staying again",
      },
    ],
    ratingBreakdown: {
      overall: 5.0,
      cleanliness: 4.8,
      accuracy: 5.0,
      checkin: 4.5,
      communication: 5.0,
      location: 5.0,
      value: 5.0,
    },
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % facility.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + facility.images.length) % facility.images.length)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-4">{facility.name}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center underline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center underline"
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              Save
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-2 mb-8 h-[400px]">
          <div className="col-span-2 relative rounded-l-xl overflow-hidden">
            <Image src={facility.images[0] || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
          </div>
          <div className="grid grid-rows-2 gap-2">
            <div className="relative overflow-hidden">
              <Image src={facility.images[1] || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
            </div>
            <div className="relative overflow-hidden">
              <Image src={facility.images[2] || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
            </div>
          </div>
          <div className="grid grid-rows-2 gap-2">
            <div className="relative overflow-hidden rounded-tr-xl">
              <Image src={facility.images[3] || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
            </div>
            <div className="relative overflow-hidden rounded-br-xl">
              <Image src={facility.images[4] || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
              <Button variant="outline" size="sm" className="absolute bottom-4 right-4 bg-white hover:bg-gray-50">
                <div className="grid grid-cols-3 gap-1 mr-2">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-gray-900 rounded-full" />
                  ))}
                </div>
                Show all photos
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Facility Info */}
            <div className="mb-8 pb-8 border-b">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {facility.type} in {facility.location.split(",")[0]}
                  </h2>
                  <p className="text-gray-600 mb-2">{facility.details}</p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-black fill-current mr-1" />
                    <span className="font-medium">{facility.rating}</span>
                    <span className="text-gray-500 ml-1">· {facility.reviewCount} reviews</span>
                  </div>
                </div>
                <Image
                  src={facility.host.avatar || "/placeholder.svg"}
                  alt={facility.host.name}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-8 mb-8 border-b">
              {["Photos", "Amenities", "Reviews", "Location"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.toLowerCase()
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Reviews Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Star className="h-5 w-5 text-black fill-current mr-2" />
                <span className="text-xl font-semibold">
                  {facility.rating} · {facility.reviewCount} reviews
                </span>
              </div>

              {/* Rating Breakdown */}
              <div className="grid grid-cols-2 gap-x-16 gap-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall rating</span>
                  <div className="flex items-center">
                    <div className="w-32 h-1 bg-gray-200 rounded-full mr-3">
                      <div className="h-1 bg-black rounded-full" style={{ width: "100%" }} />
                    </div>
                    <span className="text-sm font-medium">5</span>
                  </div>
                </div>
                {Object.entries(facility.ratingBreakdown)
                  .slice(1)
                  .map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      <span className="text-sm font-medium">{rating}</span>
                    </div>
                  ))}
              </div>

              {/* Individual Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {facility.reviews.map((review, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={review.avatar || "/placeholder.svg"}
                        alt={review.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium text-sm">{review.name}</p>
                        <p className="text-xs text-gray-500">{review.timeOnPlatform}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-black fill-current" />
                        ))}
                      </div>
                      <span>·</span>
                      <span>{review.date}</span>
                      <span>·</span>
                      <span>{review.stay}</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">What this place offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facility.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-4 py-3">
                    <amenity.icon className="h-6 w-6 text-gray-600" />
                    <span className="text-gray-900">{amenity.name}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-6 bg-transparent">
                Show all {facility.amenities.length} amenities
              </Button>
            </div>

            {/* Meet your host */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Meet your host</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-start space-x-6">
                  <div className="text-center">
                    <div className="relative">
                      <Image
                        src={facility.host.avatar || "/placeholder.svg"}
                        alt={facility.host.name}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      </div>
                    </div>
                    <h4 className="text-2xl font-semibold mt-4">{facility.host.name}</h4>
                    <p className="text-gray-500 text-sm">Host</p>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{facility.host.reviewCount}</p>
                      <p className="text-sm text-gray-500">Reviews</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{facility.host.rating}★</p>
                      <p className="text-sm text-gray-500">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{facility.host.yearsHosting}</p>
                      <p className="text-sm text-gray-500">Years hosting</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h5 className="font-medium mb-4">Co-hosts</h5>
                    <div className="flex space-x-3">
                      {facility.host.coHosts.map((coHost, index) => (
                        <div key={index} className="text-center">
                          <Image
                            src={coHost.avatar || "/placeholder.svg"}
                            alt={coHost.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <p className="text-xs mt-1">{coHost.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-4">Host details</h5>
                    <p className="text-sm text-gray-600 mb-2">Response rate: {facility.host.responseRate}</p>
                    <p className="text-sm text-gray-600">Responds {facility.host.responseTime}</p>
                  </div>
                </div>

                <Button variant="outline" className="mt-6 bg-transparent">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message host
                </Button>
              </div>
            </div>

            {/* Where you'll be */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Where you'll be</h3>
              <p className="text-gray-600 mb-6">{facility.location}</p>
              <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
                <p className="text-gray-500">Map would be embedded here</p>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-baseline justify-between mb-6">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-semibold">
                      {facility.currency}
                      {facility.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">for {facility.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-black fill-current mr-1" />
                    <span className="font-medium">{facility.rating}</span>
                    <span className="text-gray-500 ml-1">· {facility.reviewCount} reviews</span>
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg mb-4">
                  <div className="grid grid-cols-2">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-medium text-gray-900 mb-1">CHECK-IN</label>
                      <div className="text-sm text-gray-600">11/14/2025</div>
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-medium text-gray-900 mb-1">CHECKOUT</label>
                      <div className="text-sm text-gray-600">11/16/2025</div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-300">
                    <label className="block text-xs font-medium text-gray-900 mb-1">GUESTS</label>
                    <div className="text-sm text-gray-600">1 guest</div>
                  </div>
                </div>

                <Link href={`/facility/${facility.id}/book`}>
                  <Button className="w-full bg-[#ff385c] hover:bg-[#e31c5f] text-white py-3 text-base font-medium mb-4">
                    Reserve
                  </Button>
                </Link>

                <p className="text-center text-gray-500 text-sm mb-6">You won't be charged yet</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="underline">
                      {facility.currency}
                      {facility.price.toLocaleString()} x {facility.duration}
                    </span>
                    <span>
                      {facility.currency}
                      {facility.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Cleaning fee</span>
                    <span>{facility.currency}50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Service fee</span>
                    <span>{facility.currency}180</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-medium">
                    <span>Total before taxes</span>
                    <span>
                      {facility.currency}
                      {(facility.price + 50 + 180).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    <span>Prices include all fees</span>
                  </div>
                </div>

                <Button variant="ghost" className="w-full mt-4 text-sm text-gray-600 underline">
                  <Shield className="h-4 w-4 mr-2" />
                  Report this listing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
