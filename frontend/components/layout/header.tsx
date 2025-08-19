"use client";

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Bell,
  User2,
  Calendar,
  MapPin,
  Home,
  LogOut,
  LogIn,
  Loader,
  Coins,
  LockOpen,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { User } from "@/types";
import { useAuth } from "../AuthProvider";
import NotificationPanel from "../notifications/NotificationPanel";
import { NotificationsAPI } from "@/lib/api";

export function Header() {
  const pathname = usePathname();
  const { user, logout, loading, login } = useAuth();
  const queryClient = useQueryClient();
  // const [showMinimalSearch, setShowMinimalSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notification-unread-count"],
    queryFn: () => NotificationsAPI.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user,
  }) as { data: number };

  const hideHeader =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");

  // Reset all dropdown states when user changes (login/logout)
  useEffect(() => {
    if (!user) {
      setShowUserMenu(false);
      setShowNotifications(false);
    }
  }, []);
  useEffect(() => {
    if (!user) {
      setShowUserMenu(false);
      setShowNotifications(false);
    }
  }, [user]);

  // Create logout mutation at component level
  const handleLogout = () => {
    queryClient.clear();
    logout();

    clearTokens();
    queryClient.clear();
    setShowUserMenu(false);
    setShowNotifications(false);

    toast({
      title: "Logged out",
      description: "You have been logged out.",
      variant: "destructive",
    });
  };

  return (
    <>
      {!hideHeader && (
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
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-100 rounded-full"
                ></Button>
                {!user?.company ? (
                  <Link href="/user/host" className="hidden sm:block">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4 font-medium text-sm"
                    >
                      Become a host
                    </Button>
                  </Link>
                ) : (
                  <Link href="/admin" className="hidden sm:block">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4 font-medium text-sm"
                    >
                      {(user?.company as any)?.name}
                    </Button>
                  </Link>
                )}

                {/* Notification Icon - Only show when user is logged in */}
                {user && (
                  <div className="relative hidden md:block mr-3">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>

                    <NotificationPanel
                      isOpen={showNotifications}
                      onClose={() => setShowNotifications(false)}
                    />
                  </div>
                )}

                {/* User Menu */}
                {user && (
                  <DropdownMenu
                    open={showUserMenu}
                    onOpenChange={setShowUserMenu}
                  >
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <Menu className="h-4 w-4 text-gray-600 ml-2" />
                        <div className="w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {(user as User)?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/user/profile"
                          className="flex items-center"
                        >
                          <User2 className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/user/rentals"
                          className="flex items-center"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>My Rentals</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/user/transactions"
                          className="flex items-center"
                        >
                          <Coins className="mr-2 h-4 w-4" />
                          <span>My Transactions</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/user/bookings"
                          className="flex items-center"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>Track Active Bookings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        {!user?.company ? (
                          <Link href="/user/host" className="flex items-center">
                            <Home className="mr-2 h-4 w-4" />
                            <span>Become a Host</span>
                          </Link>
                        ) : user?.company && !(user.company as any).isActive ? (
                          <Link href="/license" className="flex items-center">
                            <LockOpen className="mr-2 h-4 w-4" />
                            <span>Activate License</span>
                          </Link>
                        ) : (
                          user?.company &&
                          (user.company as any).isActive && (
                            <Link href="/admin" className="flex items-center">
                              <Home className="mr-2 h-4 w-4" />
                              <span>Visit Dashboard</span>
                            </Link>
                          )
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="mr-2 h-4 w-4" />
                        )}
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {!user && (
                  <Link href="/auth/sign-in" className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Log in</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </>
  );
}

export default Header;
