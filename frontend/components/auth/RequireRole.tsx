"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

export function RequireRole({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: Array<string | "super-admin">
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth/login")
      else if (roles && roles.length > 0) {
        const isSuper = (user as any).isSuperAdmin
        const ok = isSuper || roles.includes(user.role) || roles.includes("super-admin")
        if (!ok) router.replace("/")
      }
    }
  }, [user, loading, roles, router])

  if (loading || !user) return null
  if (roles && roles.length > 0) {
    const isSuper = (user as any).isSuperAdmin
    const ok = isSuper || roles.includes(user.role) || roles.includes("super-admin")
    if (!ok) return null
  }
  return <>{children}</>
}