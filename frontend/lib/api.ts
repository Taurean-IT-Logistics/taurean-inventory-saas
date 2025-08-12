export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api/v1"

let accessToken: string | null = null
let refreshToken: string | null = null

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken
  refreshToken = tokens.refreshToken
  if (typeof window !== "undefined") {
    localStorage.setItem("fh_access", accessToken)
    localStorage.setItem("fh_refresh", refreshToken)
  }
}

export function loadTokensFromStorage() {
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("fh_access")
    refreshToken = localStorage.getItem("fh_refresh")
  }
}

async function refreshAccessToken() {
  if (!refreshToken) throw new Error("No refresh token available")
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
  const json = await res.json()
  if (!res.ok || !json?.success) throw new Error(json?.message || "Failed to refresh token")
  const tokens = json.data?.tokens || json.tokens
  if (!tokens?.accessToken || !tokens?.refreshToken) throw new Error("Invalid refresh response")
  setTokens(tokens)
  return tokens.accessToken as string
}

export async function apiFetch<T>(path: string, options: RequestInit & { method?: HttpMethod } = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (!(options.body instanceof FormData)) headers["Content-Type"] = headers["Content-Type"] || "application/json"
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  let res = await fetch(url, { ...options, headers })

  if (res.status === 401 && refreshToken) {
    try {
      const newAccess = await refreshAccessToken()
      headers.Authorization = `Bearer ${newAccess}`
      res = await fetch(url, { ...options, headers })
    } catch {
      // fall through
    }
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    const message = json?.message || res.statusText || "Request failed"
    throw new Error(message)
  }
  return (json?.data ?? json) as T
}

// Auth endpoints
export const AuthAPI = {
  login: (identifier: string, password: string) =>
    apiFetch<{ user: any; tokens: { accessToken: string; refreshToken: string } }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  register: (payload: { name: string; email: string; username: string; password: string }) =>
    apiFetch<{ user: any; tokens: { accessToken: string; refreshToken: string } }>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  profile: () => apiFetch(`/auth/profile`, { method: "GET" }),
  logout: () => apiFetch(`/auth/logout`, { method: "POST" }),
}

// Facilities
export const FacilitiesAPI = {
  list: (params?: Record<string, string | number | boolean>) => {
    const qs = params
      ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
      : ""
    return apiFetch<{ items?: any[]; facilities?: any[]; data?: any }>(`/facilities${qs}`, { method: "GET" })
  },
  detail: (id: string) => apiFetch(`/facilities/${id}`, { method: "GET" }),
  reviews: (id: string) => apiFetch(`/facilities/${id}/reviews`, { method: "GET" }),
  calendar: (id: string) => apiFetch(`/facilities/${id}/calendar`, { method: "GET" }),
  create: (payload: Record<string, any>, files?: File[]) => {
    const form = new FormData()
    for (const [k, v] of Object.entries(payload)) form.append(k, String(v))
    if (files && files.length) files.forEach((f) => form.append("files", f))
    return apiFetch(`/facilities`, { method: "POST", body: form })
  },
  update: (id: string, payload: Record<string, any>, files?: File[]) => {
    const form = new FormData()
    for (const [k, v] of Object.entries(payload)) form.append(k, String(v))
    if (files && files.length) files.forEach((f) => form.append("files", f))
    return apiFetch(`/facilities/${id}`, { method: "PUT", body: form })
  },
  remove: (id: string) => apiFetch(`/facilities/${id}`, { method: "DELETE" }),
}

// Bookings
export const BookingsAPI = {
  create: (payload: any) => apiFetch(`/bookings`, { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiFetch(`/bookings/me`, { method: "GET" }),
  get: (id: string) => apiFetch(`/bookings/${id}`, { method: "GET" }),
  listAll: () => apiFetch(`/bookings`, { method: "GET" }),
  update: (id: string, payload: any) => apiFetch(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  checkIn: (id: string) => apiFetch(`/bookings/${id}/check-in`, { method: "POST" }),
  checkOut: (id: string) => apiFetch(`/bookings/${id}/check-out`, { method: "POST" }),
  remove: (id: string) => apiFetch(`/bookings/${id}`, { method: "DELETE" }),
}

// Users
export const UsersAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : ""
    return apiFetch(`/users${qs}`, { method: "GET" })
  },
  update: (id: string, payload: any) => apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateRole: (id: string, role: string) => apiFetch(`/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  stats: () => apiFetch(`/users/statistics`, { method: "GET" }),
}