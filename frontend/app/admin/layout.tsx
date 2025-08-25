import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";

interface SideBarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SideBarProps) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
