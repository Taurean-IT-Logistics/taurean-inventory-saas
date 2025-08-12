"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { AuthAPI, loadTokensFromStorage, setTokens } from "@/lib/api"
import { useRouter } from "next/navigation"

type AuthUser = {
  id: string
  name: string
  email: string
  role: string
  isSuperAdmin?: boolean
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (payload: { name: string; email: string; username: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadTokensFromStorage()
    AuthAPI.profile()
      .then((u: any) => setUser(u as AuthUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (identifier: string, password: string) => {
    const res = await AuthAPI.login(identifier, password)
    setTokens(res.tokens)
    setUser(res.user as any)
  }

  const register = async (payload: { name: string; email: string; username: string; password: string }) => {
    const res = await AuthAPI.register(payload)
    setTokens(res.tokens)
    setUser(res.user as any)
  }

  const logout = async () => {
    try {
      await AuthAPI.logout()
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("fh_access")
        localStorage.removeItem("fh_refresh")
      }
      setUser(null)
      router.push("/")
    }
  }

  const refreshProfile = async () => {
    const u = await AuthAPI.profile()
    setUser(u as AuthUser)
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshProfile }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}