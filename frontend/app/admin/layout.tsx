import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/Sidebar/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ExpiredCompanyBanner from "@/components/ExpiredCompany";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";

interface SideBarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SideBarProps) {
  return (
    <ProtectedRoute allowedRoles={["admin", "superAdmin"]}>
      <SidebarProvider>
        <div className="relative flex h-screen w-full">
          <DashboardSidebar />
          <SidebarInset className="flex flex-col">
            <ExpiredCompanyBanner>{children}</ExpiredCompanyBanner>
          </SidebarInset>
          <EnhancedChatWidget />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
