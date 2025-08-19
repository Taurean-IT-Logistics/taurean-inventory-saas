import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";

interface UserRouteProps {
  children: React.ReactNode;
}

export default function UserRoute({ children }: UserRouteProps) {
  return (
    <ProtectedRoute allowedRoles={["superAdmin"]}>
      {children}
      <EnhancedChatWidget />
    </ProtectedRoute>
  );
}
