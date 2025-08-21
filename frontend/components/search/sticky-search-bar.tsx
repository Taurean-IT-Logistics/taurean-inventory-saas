"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { DatePicker } from "@/components/ui/date-picker"
import { useState } from "react"

export function StickySearchBar() {
  const { scrollY } = useScroll()
  const scale = useTransform(scrollY, [0, 100], [1, 0.85])
  const opacity = useTransform(scrollY, [0, 50], [1, 0.9])
  
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()

  return (
    <motion.div style={{ scale, opacity }} className="sticky top-24 z-40 px-4 sm:px-6 lg:px-8 mb-8">
      <motion.div
        initial={{ y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-full shadow-lg border border-gray-200 p-2"
      >
        <div className="flex items-center divide-x divide-gray-200">
          <div className="flex-1 px-4 py-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs font-medium text-gray-900">Where</div>
                <Input
                  placeholder="Search destinations"
                  className="border-0 p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs font-medium text-gray-900">Check in</div>
                <DatePicker
                  date={checkInDate}
                  onDateChange={setCheckInDate}
                  placeholder="Add dates"
                  className="border-0 p-0 text-sm h-8 shadow-none bg-transparent hover:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs font-medium text-gray-900">Check out</div>
                <DatePicker
                  date={checkOutDate}
                  onDateChange={setCheckOutDate}
                  placeholder="Add dates"
                  className="border-0 p-0 text-sm h-8 shadow-none bg-transparent hover:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs font-medium text-gray-900">Who</div>
                <Input
                  placeholder="Add guests"
                  className="border-0 p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="px-2">
            <Button size="sm" className="bg-[#ff8c00] hover:bg-[#e67c00] text-white rounded-full p-3">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
