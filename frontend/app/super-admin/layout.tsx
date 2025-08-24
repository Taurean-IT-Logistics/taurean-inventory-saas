import { ProtectedRoute } from "@/components/ProtectedRoute";

interface UserRouteProps {
  children: React.ReactNode;
}

export default function UserRoute({ children }: UserRouteProps) {
  return (
    <ProtectedRoute allowedRoles={["superAdmin"]}>{children}</ProtectedRoute>
  );
}
