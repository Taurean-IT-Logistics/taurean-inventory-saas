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
      if (!user) {
        redirectToLogin();
      } else if (
        allowedRoles &&
        !allowedRoles.includes(user.role) &&
        user.role !== "superAdmin"
      ) {
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

  return <>{children}</>;
}
