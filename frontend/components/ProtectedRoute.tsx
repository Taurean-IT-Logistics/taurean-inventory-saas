"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Loader } from "./ui/loader";
import { useRedirect } from "@/hooks/useRedirect";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { redirectToLogin } = useRedirect();

  useEffect(() => {
    if (!loading) {
      // If no user, redirect to login
      if (!user) {
        redirectToLogin();
        return;
      }

      // If no role restrictions, allow access
      if (!allowedRoles || allowedRoles.length === 0) {
        return;
      }

      // Super admins have access to everything
      if (user.isSuperAdmin) {
        return;
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(user.role)) {
        router.push("/");
      }
    }
  }, [user, loading, allowedRoles, router, redirectToLogin]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.isSuperAdmin && !allowedRoles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}
