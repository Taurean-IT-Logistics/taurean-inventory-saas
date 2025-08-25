"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Users,
  Activity,
  LogOut,
  Menu,
  X,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";
import Logo from "../logo/Logo";
import { logo } from "@/assets";

interface SuperAdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function SuperAdminLayoutWrapper({
  children,
}: SuperAdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/sign-in");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the system",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/super-admin",
      icon: BarChart3,
      current: true,
    },
    {
      name: "Companies",
      href: "/super-admin/companies",
      icon: Building2,
      current: false,
    },
    {
      name: "Users",
      href: "/super-admin/users",
      icon: Users,
      current: false,
    },
    {
      name: "System Stats",
      href: "/super-admin/stats",
      icon: TrendingUp,
      current: false,
    },
    {
      name: "Activity Logs",
      href: "/super-admin/activity",
      icon: Activity,
      current: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Logo logo={logo} height={40} width={40} />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Super Admin
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <Logo logo={logo} height={40} width={40} />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Super Admin
            </span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {user?.name || "Super Admin"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
