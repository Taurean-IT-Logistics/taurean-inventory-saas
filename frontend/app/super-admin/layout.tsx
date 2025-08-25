import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SuperAdminLayoutWrapper } from "@/components/layout/SuperAdminLayoutWrapper";

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export default function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  return (
    <ProtectedRoute allowedRoles={["superAdmin"]}>
      <SuperAdminLayoutWrapper>{children}</SuperAdminLayoutWrapper>
    </ProtectedRoute>
  );
}
