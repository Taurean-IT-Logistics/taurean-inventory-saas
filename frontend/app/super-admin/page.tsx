import { Metadata } from "next";
import SuperAdminDashboard from "@/components/super-admin/SuperAdminDashboard";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | FacilityHub",
  description: "Manage all companies, users, and system-wide settings from the super admin dashboard.",
  keywords: ["super admin", "dashboard", "company management", "user management", "system administration"],
  robots: "noindex, nofollow", // Super admin pages should not be indexed
};

export default function SuperAdminPage() {
  return <SuperAdminDashboard />;
}
