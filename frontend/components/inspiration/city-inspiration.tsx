"use client"

import Image from "next/image"
import { CityCardSkeleton } from "./city-card-skeleton"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const cities = [
  {
    id: 1,
    name: "Accra",
    description: "Event spaces",
    image: "/placeholder.svg?height=300&width=300",
    count: "120+ venues",
  },
  {
    id: 2,
    name: "Kumasi",
    description: "Meeting rooms",
    image: "/placeholder.svg?height=300&width=300",
    count: "85+ venues",
  },
  {
    id: 3,
    name: "Cape Coast",
    description: "Conference halls",
    image: "/placeholder.svg?height=300&width=300",
    count: "45+ venues",
  },
  {
    id: 4,
    name: "Tamale",
    description: "Outdoor spaces",
    image: "/placeholder.svg?height=300&width=300",
    count: "30+ venues",
  },
]

export function CityInspiration() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <Link href="/cities" className="text-2xl font-semibold text-slate-900 hover:underline cursor-pointer">
            Get inspiration from cities around you &gt;
          </Link>
        </div>
        {!loading && (
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <CityCardSkeleton key={index} />)
          : cities.map((city) => (
              <div key={city.id} className="group cursor-pointer">
                <div className="aspect-square rounded-xl overflow-hidden mb-3">
                  <Image
                    src={city.image || "/placeholder.svg"}
                    alt={city.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">{city.name}</h3>
                  <p className="text-sm text-slate-600">{city.description}</p>
                  <p className="text-xs text-slate-500">{city.count}</p>
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}
