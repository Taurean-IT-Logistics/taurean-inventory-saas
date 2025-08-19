"use client"

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void
}

interface SearchParams {
  location: string
  checkIn: string
  checkOut: string
  guests: number
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  })

  const handleSearch = () => {
    onSearch?.(searchParams)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Find the perfect facility for your event
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover amazing venues, meeting rooms, and event spaces for any occasion
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-full shadow-xl p-2 hover:shadow-2xl transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            {/* Where */}
            <div className="flex flex-col px-6 py-4 border-r border-gray-200 cursor-pointer hover:bg-gray-50 rounded-l-full transition-colors">
              <label className="text-xs font-semibold text-slate-900 mb-1">Where</label>
              <input
                type="text"
                placeholder="Search destinations"
                value={searchParams.location}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, location: e.target.value }))}
                className="text-sm text-slate-600 bg-transparent border-none outline-none placeholder-gray-400 w-full"
              />
            </div>

            {/* Check in */}
            <div className="flex flex-col px-6 py-4 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <label className="text-xs font-semibold text-slate-900 mb-1">Check in</label>
              <input
                type="date"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, checkIn: e.target.value }))}
                className="text-sm text-slate-600 bg-transparent border-none outline-none w-full"
              />
            </div>

            {/* Check out */}
            <div className="flex flex-col px-6 py-4 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <label className="text-xs font-semibold text-slate-900 mb-1">Check out</label>
              <input
                type="date"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, checkOut: e.target.value }))}
                className="text-sm text-slate-600 bg-transparent border-none outline-none w-full"
              />
            </div>

            {/* Who */}
            <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 rounded-r-full transition-colors">
              <div className="flex flex-col flex-1">
                <label className="text-xs font-semibold text-slate-900 mb-1">Who</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Add guests"
                  value={searchParams.guests}
                  onChange={(e) =>
                    setSearchParams((prev) => ({ ...prev, guests: Number.parseInt(e.target.value) || 1 }))
                  }
                  className="text-sm text-slate-600 bg-transparent border-none outline-none placeholder-gray-400 w-full"
                />
              </div>
              <Button
                size="sm"
                onClick={handleSearch}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-4 ml-4 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
