"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe, Menu, Search, Bell, User, Calendar, MapPin, Heart, Home, Settings, LogOut, ShoppingCart } from "lucide-react"
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
import { useAuth } from "@/components/auth/AuthProvider"
import { useQuery } from "@tanstack/react-query"
import { CartAPI } from "@/lib/api"

export function Header() {
  const pathname = usePathname()
  const [showMinimalSearch, setShowMinimalSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { scrollY } = useScroll()
  const { user, logout } = useAuth()
  const { data: cartData } = useQuery({ queryKey: ["cart"], queryFn: () => CartAPI.list(), enabled: !!user })
  const cartCount = (cartData?.items || cartData || []).length || 0

  // Mock user data
  const mockUser = user || {
    name: "Guest",
    email: "",
    avatar: "/placeholder.svg?height=32&width=32",
    isHost: false,
  }

  const shouldShowSearchBar = pathname === "/" || pathname === "/facilities" || pathname === "/rentals"

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (shouldShowSearchBar) {
      setShowMinimalSearch(latest > 150)
    }
  })

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">FacilityHub</Link>

        <div className="flex items-center gap-3">
          {user && (
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {!user ? (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {mockUser.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings">My bookings</Link>
                </DropdownMenuItem>
                {(user.role === "admin" || (user as any).isSuperAdmin) && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin dashboard</Link>
                  </DropdownMenuItem>
                )}
                {(user as any).isSuperAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/super-admin">Super admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
