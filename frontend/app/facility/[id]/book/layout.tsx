import { ProtectedRoute } from "@/components/ProtectedRoute";

interface BookingLayoutProps {
  children: React.ReactNode;
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
