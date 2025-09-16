"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Calendar1Icon,
  Coins,
  HouseIcon,
  Building2,
  LinkIcon,
  LogOut,
  Package2,
  PieChart,
  ShoppingBag,
  Users,
  MessageSquare,
  BarChart3,
  Mail,
  CreditCard,
} from "lucide-react";
import Logo from "../logo/Logo";
import type { Route } from "./NavMain";
import DashboardNavigation from "./NavMain";
import { NotificationPopover } from "../notifications/NotificationPopover";
import { Button } from "../ui/button";
import { useAuth } from "../AuthProvider";
import { getResourceUrl } from "@/lib/api";
import { SocketStatus } from "../ui/socket-status";
import { logo } from "@/assets";
import Link from "next/link";
import { useRouter } from "next/navigation";

const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "JL",
    text: "Server upgrade completed.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "HH",
    text: "New user signed up.",
    time: "2h ago",
  },
];

const dashboardRoutes: Route[] = [
  {
    id: "home",
    title: "Home",
    icon: <PieChart className="size-4" />,
    link: "/admin",
  },
  {
    id: "facilities",
    title: "Facilities",
    icon: <HouseIcon className="size-4" />,
    link: "/admin/facilities",
    subs: [
      {
        title: "Manage",
        link: "/admin/facilities",
        icon: <HouseIcon className="size-4" />,
      },
      {
        title: "Create",
        link: "/admin/facilities/create",
        icon: <HouseIcon className="size-4" />,
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    icon: <Package2 className="size-4" />,
    link: "/admin/inventory",
    subs: [
      {
        title: "Manage",
        link: "/admin/inventory",
        icon: <Package2 className="size-4" />,
      },
      {
        title: "Create Inventory",
        link: "/admin/inventory/create",
        icon: <LinkIcon className="size-4" />,
      },
    ],
  },
  {
    id: "bookings",
    title: "Bookings",
    icon: <Calendar1Icon className="size-4" />,
    link: "/admin/bookings",
  },
  {
    id: "users",
    title: "Users",
    icon: <Users className="size-4" />,
    link: "/admin/users",
  },
  {
    id: "transactions",
    title: "Transactions",
    icon: <ShoppingBag className="size-4" />,
    link: "/admin/transactions",
  },
  {
    id: "tax",
    title: "Taxes",
    icon: <Coins className="size-4" />,
    link: "/admin/taxes",
  },
  {
    id: "company-profile",
    title: "Company Profile",
    icon: <Building2 className="size-4" />,
    link: "/admin/company-profile",
  },
  {
    id: "subaccount",
    title: "Subaccount",
    icon: <CreditCard className="size-4" />,
    link: "/admin/subaccount",
  },
  {
    id: "support",
    title: "Support",
    icon: <MessageSquare className="size-4" />,
    link: "/admin/support",
  },
  {
    id: "reports",
    title: "Reports",
    icon: <BarChart3 className="size-4" />,
    link: "/admin/reports",
  },
  {
    id: "email-settings",
    title: "Email Settings",
    icon: <Mail className="size-4" />,
    link: "/admin/email-settings",
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const router = useRouter();
  const isCollapsed = state === "collapsed";
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r w-64 min-w-64">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <Logo
            width={50}
            logo={
              (user?.company as any)?.logo?.path
                ? getResourceUrl((user?.company as any).logo?.path)
                : logo
            }
          />
        </Link>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <NotificationPopover />
          <SidebarTrigger />
          <SocketStatus />

          {/* <ThemeToggle /> */}
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      <SidebarFooter className="px-2">
        <Button
          className="flex items-center justify-center gap-2 bg-red-600/40 hover:bg-red-600 transition-all p-2 rounded-lg text-secondary"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
