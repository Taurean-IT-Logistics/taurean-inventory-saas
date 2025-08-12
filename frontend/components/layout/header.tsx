"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe, Menu, Search, Bell, User, Calendar, MapPin, Heart, Home, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const [showMinimalSearch, setShowMinimalSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { scrollY } = useScroll()

  // Mock user data
  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    isHost: true,
  }

  const shouldShowSearchBar = pathname === "/" || pathname === "/facilities" || pathname === "/rentals"

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (shouldShowSearchBar) {
      setShowMinimalSearch(latest > 150)
    }
  })

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-4 left-0 right-0 z-50 flex justify-center"
      >
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-lg px-6 py-3 w-[88%] max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Taurean%20IT%20Logo1_vectorized-rqrFu3K2Mr6YMUklSnhrFRKrFhGNfY.png"
                alt="Logo"
                className="h-8 w-8"
              />
            </Link>

            {/* Navigation or Minimal Search */}
            <div className="flex-1 flex justify-center">
              {shouldShowSearchBar && showMinimalSearch ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <div className="px-4 py-2 text-center">
                    <span className="text-sm font-medium text-gray-900">Anywhere</span>
                  </div>
                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                  <div className="px-4 py-2 text-center">
                    <span className="text-sm font-medium text-gray-900">Any duration</span>
                  </div>
                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                  <div className="px-4 py-2 text-center">
                    <span className="text-sm font-medium text-gray-900">Add guests</span>
                  </div>
                  <Button size="sm" className="bg-[#ff8c00] hover:bg-[#e67c00] text-white rounded-full m-1 p-2">
                    <Search className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <nav className="hidden md:flex items-center space-x-6">
                  <Link
                    href="/facilities"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-full hover:bg-gray-100"
                  >
                    Facilities
                  </Link>
                  <Link
                    href="/rentals"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-full hover:bg-gray-100"
                  >
                    Rentals
                  </Link>
                  <Link
                    href="/services"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-full hover:bg-gray-100"
                  >
                    Services
                  </Link>
                </nav>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
                <Globe className="h-4 w-4 text-gray-600" />
              </Button>
              <Link href="/host" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4 font-medium text-sm"
                >
                  Become a host
                </Button>
              </Link>

              {/* Notification Icon */}
              <div className="relative hidden md:block mr-3">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Booking Confirmed</p>
                            <p className="text-xs text-gray-500">Your booking at Modern Apartment has been confirmed</p>
                            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Payment Successful</p>
                            <p className="text-xs text-gray-500">Payment of GH₢1,265 has been processed</p>
                            <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Reminder: Check-in Tomorrow</p>
                            <p className="text-xs text-gray-500">Don't forget your check-in at 2:00 PM</p>
                            <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">View all notifications</button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* User Menu */}
              <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <Menu className="h-4 w-4 text-gray-600 ml-2" />
                    <div className="w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {mockUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-rentals" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Rentals</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/track-bookings" className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Track Active Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/host" className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Become a Host</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      {shouldShowSearchBar && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showMinimalSearch ? 0 : 1, y: 0 }}
          className="fixed top-20 left-0 right-0 z-40 flex justify-center"
        >
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-lg px-2 py-2 w-[88%] max-w-4xl">
            <div className="flex items-center">
              <div className="flex-1 flex items-center bg-gray-50 rounded-full">
                <div className="flex-1 px-6 py-3 cursor-pointer hover:bg-white rounded-full transition-colors duration-200">
                  <div className="text-xs font-medium text-gray-900 mb-1">Where/What</div>
                  <div className="text-sm text-gray-500">Search facilities & items</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="flex-1 px-6 py-3 cursor-pointer hover:bg-white rounded-full transition-colors duration-200">
                  <div className="text-xs font-medium text-gray-900 mb-1">Duration</div>
                  <div className="text-sm text-gray-500">Add duration</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="flex-1 px-6 py-3 cursor-pointer hover:bg-white rounded-full transition-colors duration-200">
                  <div className="text-xs font-medium text-gray-900 mb-1">Who</div>
                  <div className="text-sm text-gray-500">Add guests</div>
                </div>
              </div>
              <Button className="bg-[#ff8c00] hover:bg-[#e67c00] text-white rounded-full ml-2 p-3">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default Header
