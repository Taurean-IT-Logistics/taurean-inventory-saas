"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Loader } from "./ui/loader";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireGuest = false,
  allowedRoles = [],
  redirectTo,
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // If page requires authentication but user is not logged in
    if (requireAuth && !user) {
      const currentUrl = pathname + window.location.search;
      // Store the current URL as intended destination
      sessionStorage.setItem("intendedUrl", currentUrl);
      router.push("/auth/sign-in");
      return;
    }

    // If page requires guest access (like sign-in page) but user is logged in
    if (requireGuest && user) {
      const redirectUrl = redirectTo || "/";
      router.push(redirectUrl);
      return;
    }

    // If page has role restrictions
    if (requireAuth && user && allowedRoles.length > 0) {
      // Super admins have access to everything
      if (user.isSuperAdmin) {
        return;
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(user.role)) {
        // Store current URL before redirecting
        const currentUrl = pathname + window.location.search;
        sessionStorage.setItem("intendedUrl", currentUrl);
        router.push("/");
        return;
      }
    }
  }, [
    user,
    loading,
    requireAuth,
    requireGuest,
    allowedRoles,
    redirectTo,
    router,
    pathname,
  ]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Loading..." />
      </div>
    );
  }

  // If page requires authentication but user is not logged in, don't render
  if (requireAuth && !user) {
    return null;
  }

  // If page requires guest access but user is logged in, don't render
  if (requireGuest && user) {
    return null;
  }

  // If page has role restrictions and user doesn't have access, don't render
  if (requireAuth && user && allowedRoles.length > 0) {
    if (!user.isSuperAdmin && !allowedRoles.includes(user.role)) {
      return null;
    }
  }

  // Default behavior: allow access to all users (including authenticated users)
  // unless explicitly restricted by requireAuth or requireGuest
  return <>{children}</>;
}
