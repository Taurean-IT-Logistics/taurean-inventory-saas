"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function SidebarTriggerWrapper() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (!isCollapsed) return null;

  return (
    <div className="fixed top-4 left-4 z-50 md:left-4">
      <SidebarTrigger className="h-10 w-10 bg-white shadow-lg border rounded-lg hover:bg-gray-50" />
    </div>
  );
}
