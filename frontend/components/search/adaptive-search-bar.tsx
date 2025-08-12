"use client"

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void
  isMinimal?: boolean
}

interface SearchParams {
  location: string
  checkIn: string
  checkOut: string
  guests: number
}

export function AdaptiveSearchBar({ onSearch, isMinimal = false }: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearch = () => {
    onSearch?.(searchParams)
  }

  if (isMinimal && !isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center px-6 py-3 space-x-4">
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-900">Anywhere</span>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <span className="text-sm font-medium text-slate-900">Any week</span>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <span className="text-sm text-slate-600">Add guests</span>
          </div>
          <Button size="sm" className="bg-[#FF5A5F] hover:bg-[#E04E53] text-white rounded-full p-2">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-gray-200 rounded-full shadow-xl p-2 hover:shadow-2xl transition-shadow duration-300"
      >
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
                onChange={(e) => setSearchParams((prev) => ({ ...prev, guests: Number.parseInt(e.target.value) || 1 }))}
                className="text-sm text-slate-600 bg-transparent border-none outline-none placeholder-gray-400 w-full"
              />
            </div>
            <Button
              size="sm"
              onClick={handleSearch}
              className="bg-[#FF5A5F] hover:bg-[#E04E53] text-white rounded-full p-4 ml-4 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {isMinimal && (
          <div className="text-center mt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="text-xs text-slate-600">
              Minimize
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
