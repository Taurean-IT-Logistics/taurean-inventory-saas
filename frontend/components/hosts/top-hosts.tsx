"use client"

import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { HostCardSkeleton } from "./host-card-skeleton"
import { useState, useEffect } from "react"
import Link from "next/link"

const topHosts = [
  {
    id: 1,
    name: "Kwame",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.9,
    reviewCount: 127,
    yearsHosting: 3,
    location: "Accra, Ghana",
  },
  {
    id: 2,
    name: "Ama",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.8,
    reviewCount: 89,
    yearsHosting: 2,
    location: "Kumasi, Ghana",
  },
  {
    id: 3,
    name: "Kofi",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.9,
    reviewCount: 156,
    yearsHosting: 4,
    location: "Cape Coast, Ghana",
  },
  {
    id: 4,
    name: "Akosua",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.7,
    reviewCount: 73,
    yearsHosting: 1,
    location: "Tamale, Ghana",
  },
]

export function TopHosts() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <Link href="/hosts" className="text-2xl font-semibold text-slate-900 hover:underline cursor-pointer">
            Our top hosts &gt;
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
          ? Array.from({ length: 4 }).map((_, index) => <HostCardSkeleton key={index} />)
          : topHosts.map((host) => (
              <div
                key={host.id}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Image
                      src={host.avatar || "/placeholder.svg"}
                      alt={host.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1">{host.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{host.location}</p>

                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-sm font-medium text-slate-900">{host.rating}</span>
                    <span className="text-sm text-slate-600">({host.reviewCount})</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {host.yearsHosting} year{host.yearsHosting !== 1 ? "s" : ""} hosting
                  </p>
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}
