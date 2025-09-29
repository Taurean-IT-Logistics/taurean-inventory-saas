import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SuperAdminLayoutWrapper } from "@/components/layout/SuperAdminLayoutWrapper";

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export default function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <SuperAdminLayoutWrapper>{children}</SuperAdminLayoutWrapper>
    </ProtectedRoute>
  );
}
