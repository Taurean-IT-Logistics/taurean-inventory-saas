import type {
  User,
  Facility,
  Booking,
  Transaction,
  InventoryItem,
  Tax,
  NotificationPreferences,
  SubscriptionPlan,
  SubscriptionStatus,
  UsageStats,
  Company,
} from "@/types";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api/v1";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  if (typeof window !== "undefined") {
    localStorage.setItem("fh_access", accessToken);
    localStorage.setItem("fh_refresh", refreshToken);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("fh_access");
    localStorage.removeItem("fh_refresh");
  }
}

export function loadTokensFromStorage() {
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("fh_access");
    refreshToken = localStorage.getItem("fh_refresh");
  }

  return { accessToken, refreshToken };
}

async function refreshAccessToken() {
  if (!refreshToken) throw new Error("No refresh token available");
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const json = await res.json();
  if (!res.ok || !json?.success)
    throw new Error(json?.message || "Failed to refresh token");
  const tokens = json.data?.tokens || json.tokens;
  if (!tokens?.accessToken || !tokens?.refreshToken)
    throw new Error("Invalid refresh response");
  setTokens(tokens);
  return tokens.accessToken as string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { method?: HttpMethod } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData))
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    try {
      const newAccess = await refreshAccessToken();
      headers.Authorization = `Bearer ${newAccess}`;
      res = await fetch(url, { ...options, headers });
    } catch {
      // fall through
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    const message = json?.message || res.statusText || "Request failed";
    throw new Error(message);
  }
  return (json?.data ?? json) as T;
}

// Auth endpoints
export const AuthAPI = {
  login: (identifier: string, password: string) =>
    apiFetch<{
      user: any;
      tokens: { accessToken: string; refreshToken: string };
    }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    username: string;
    password: string;
  }) =>
    apiFetch<{
      user: any;
      tokens: { accessToken: string; refreshToken: string };
    }>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  profile: () => apiFetch<User | null>(`/auth/profile`, { method: "GET" }),
  logout: () => apiFetch(`/auth/logout`, { method: "POST" }),
};

// Companies
export const CompaniesAPI = {
  list: (params?: Record<string, string | number | boolean>) => {
    const qs = params
      ? `?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        )}`
      : "";
    return apiFetch<{ companies: Company[]; data: Company[] }>(
      `/companies/public`,
      {
        method: "GET",
      }
    );
  },
  sendJoinRequest: (companyId: string) =>
    apiFetch(`/companies/${companyId}/join-request`, {
      method: "POST",
      body: JSON.stringify({ message: "User requests to join company" }),
    }),
  onboard: (payload: FormData) =>
    apiFetch(`/companies/onboard`, {
      method: "POST",
      body: payload,
    }),
  pricing: () => apiFetch(`/companies/pricing`, { method: "GET" }),
  activateSubscription: (payload: {
    companyId: string;
    planId: string;
    email: string;
  }) =>
    apiFetch(`/subscriptions/initialize-payment`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  renewSubscription: (payload: {
    companyId: string;
    planId: string;
    email: string;
  }) =>
    apiFetch(`/subscriptions/renew`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updatePayoutConfig: (payload: any) =>
    apiFetch(`/companies/payout-config`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Company Join Requests
export const CompanyJoinRequestsAPI = {
  // User requests to join a company
  requestToJoin: (companyId: string) =>
    apiFetch(`/company-join-requests/request`, {
      method: "POST",
      body: JSON.stringify({ companyId }),
    }),

  // Get user's join requests
  getUserRequests: () =>
    apiFetch(`/company-join-requests/user`, { method: "GET" }),

  // Admin invites user to company
  inviteUser: (email: string, companyId: string) =>
    apiFetch(`/company-join-requests/invite`, {
      method: "POST",
      body: JSON.stringify({ email, companyId }),
    }),

  // Get company's pending requests (for company admins)
  getCompanyRequests: () =>
    apiFetch(`/company-join-requests/company/pending`, { method: "GET" }),

  // Approve join request (for company admins)
  approveRequest: (requestId: string, notes?: string) =>
    apiFetch(`/company-join-requests/${requestId}/approve`, {
      method: "PATCH",
      body: notes ? JSON.stringify({ notes }) : undefined,
    }),

  // Reject join request (for company admins)
  rejectRequest: (requestId: string, notes?: string) =>
    apiFetch(`/company-join-requests/${requestId}/reject`, {
      method: "PATCH",
      body: notes ? JSON.stringify({ notes }) : undefined,
    }),

  // Cancel join request (for users)
  cancelRequest: (requestId: string) =>
    apiFetch(`/company-join-requests/${requestId}/cancel`, {
      method: "DELETE",
    }),

  // Accept invitation (for users)
  acceptRequest: (requestId: string) =>
    apiFetch(`/company-join-requests/${requestId}/accept`, {
      method: "PATCH",
    }),

  // Decline invitation (for users)
  declineRequest: (requestId: string) =>
    apiFetch(`/company-join-requests/${requestId}/decline`, {
      method: "PATCH",
    }),
};

// Subscriptions
export const SubscriptionsAPI = {
  getPlans: () =>
    apiFetch<SubscriptionPlan[]>(`/subscriptions/plans`, { method: "GET" }),

  startFreeTrial: (companyId: string) =>
    apiFetch(`/subscriptions/start-trial`, {
      method: "POST",
      body: JSON.stringify({ companyId }),
    }),

  initializePayment: (payload: {
    companyId: string;
    planId: string;
    email: string;
  }) =>
    apiFetch(`/subscriptions/initialize-payment`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyPayment: (payload: { reference: string }) =>
    apiFetch(`/subscriptions/verify-payment`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getStatus: (companyId: string) =>
    apiFetch<{ status: SubscriptionStatus; usageStats: UsageStats }>(
      `/subscriptions/status/${companyId}`,
      { method: "GET" }
    ),

  checkFeatureAccess: (companyId: string, feature: string) =>
    apiFetch<{ feature: string; canAccess: boolean }>(
      `/subscriptions/feature-access/${companyId}/${feature}`,
      { method: "GET" }
    ),

  getUsageStats: (companyId: string) =>
    apiFetch<UsageStats>(`/subscriptions/usage/${companyId}`, {
      method: "GET",
    }),

  renew: (payload: { companyId: string; planId: string; email: string }) =>
    apiFetch(`/subscriptions/renew`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  upgrade: (payload: { companyId: string; newPlanId: string; email: string }) =>
    apiFetch(`/subscriptions/upgrade`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  cancel: (companyId: string) =>
    apiFetch(`/subscriptions/${companyId}`, { method: "DELETE" }),
};

// Facilities
export const FacilitiesAPI = {
  list: (params?: Record<string, string | number | boolean>) => {
    const qs = params
      ? `?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        )}`
      : "";
    return apiFetch<{ items?: any[]; facilities?: any[]; data?: any }>(
      `/facilities${qs}`,
      { method: "GET" }
    );
  },
  listCompany: (params?: Record<string, string | number | boolean>) => {
    const qs = params
      ? `?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        )}`
      : "";
    return apiFetch<{ items?: any[]; facilities?: any[]; data?: any }>(
      `/facilities/company${qs}`,
      { method: "GET" }
    );
  },
  detail: (id: string) => apiFetch(`/facilities/${id}`, { method: "GET" }),
  reviews: (id: string) =>
    apiFetch(`/facilities/${id}/reviews`, { method: "GET" }),
  calendar: (id: string) =>
    apiFetch(`/facilities/${id}/calendar`, { method: "GET" }),
  create: (payload: Record<string, any>, files?: File[]) => {
    const formData = new FormData();

    if (payload.name) formData.append("name", payload.name);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.location?.address)
      formData.append("location[address]", payload.location.address);
    if (payload.location?.coordinates?.latitude !== undefined)
      formData.append(
        "location[coordinates][latitude]",
        payload.location.coordinates.latitude.toString()
      );
    if (payload.location?.coordinates?.longitude !== undefined)
      formData.append(
        "location[coordinates][longitude]",
        payload.location.coordinates.longitude.toString()
      );

    if (payload.capacity?.maximum !== undefined)
      formData.append("capacity[maximum]", payload.capacity.maximum.toString());
    if (payload.capacity?.recommended !== undefined)
      formData.append(
        "capacity[recommended]",
        payload.capacity.recommended.toString()
      );

    if (payload.operationalHours?.opening)
      formData.append(
        "operationalHours[opening]",
        payload.operationalHours.opening
      );
    if (payload.operationalHours?.closing)
      formData.append(
        "operationalHours[closing]",
        payload.operationalHours.closing
      );

    if (payload.amenities && Array.isArray(payload.amenities)) {
      payload.amenities.forEach((amenity) =>
        formData.append("amenities", amenity)
      );
    }

    if (payload.terms) formData.append("terms", payload.terms);
    if (payload.isTaxable)
      formData.append("isTaxable", payload.isTaxable ? "true" : "false");

    if (payload.pricing && Array.isArray(payload.pricing)) {
      payload.pricing.forEach((price, index) => {
        if (price.unit) formData.append(`pricing[${index}][unit]`, price.unit);
        if (price.amount !== undefined)
          formData.append(`pricing[${index}][amount]`, price.amount.toString());
        formData.append(
          `pricing[${index}][isDefault]`,
          price.isDefault ? "true" : "false"
        );
      });
    }

    if (payload.availability && Array.isArray(payload.availability)) {
      payload.availability.forEach((slot, index) => {
        if (slot.day) formData.append(`availability[${index}][day]`, slot.day);
        if (slot.startTime)
          formData.append(`availability[${index}][startTime]`, slot.startTime);
        if (slot.endTime)
          formData.append(`availability[${index}][endTime]`, slot.endTime);
        formData.append(
          `availability[${index}][isAvailable]`,
          slot.isAvailable ? "true" : "false"
        );
      });
    }

    if (files && files.length > 0) {
      files.forEach((file) => formData.append("files", file));
    }

    return apiFetch(`/facilities`, { method: "POST", body: formData });
  },
  update: (
    id: string,
    payload: Record<string, any>,
    files?: File[],
    removedImageIds?: string[]
  ) => {
    const filteredData = {
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.location && { location: payload.location }),
      ...(payload.capacity && { capacity: payload.capacity }),
      ...(payload.operationalHours && {
        operationalHours: payload.operationalHours,
      }),
      ...(payload.amenities && { amenities: payload.amenities }),
      ...(payload.pricing && { pricing: payload.pricing }),
      ...(payload.availability && { availability: payload.availability }),
      ...(payload.terms && { terms: payload.terms }),
      ...(payload.isTaxable !== undefined && { isTaxable: payload.isTaxable }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
    };

    const formData = new FormData();

    if (filteredData.name) formData.append("name", filteredData.name);
    if (filteredData.description)
      formData.append("description", filteredData.description);

    if (filteredData.location?.address)
      formData.append("location[address]", filteredData.location.address);
    if (filteredData.location?.coordinates?.latitude !== undefined)
      formData.append(
        "location[coordinates][latitude]",
        filteredData.location.coordinates.latitude.toString()
      );
    if (filteredData.location?.coordinates?.longitude !== undefined)
      formData.append(
        "location[coordinates][longitude]",
        filteredData.location.coordinates.longitude.toString()
      );

    if (filteredData.capacity?.maximum !== undefined)
      formData.append(
        "capacity[maximum]",
        filteredData.capacity.maximum.toString()
      );
    if (filteredData.capacity?.recommended !== undefined)
      formData.append(
        "capacity[recommended]",
        filteredData.capacity.recommended.toString()
      );

    if (filteredData.operationalHours?.opening)
      formData.append(
        "operationalHours[opening]",
        filteredData.operationalHours.opening
      );
    if (filteredData.operationalHours?.closing)
      formData.append(
        "operationalHours[closing]",
        filteredData.operationalHours.closing
      );

    if (filteredData.amenities && Array.isArray(filteredData.amenities)) {
      filteredData.amenities.forEach((amenity: any) =>
        formData.append("amenities", amenity)
      );
    }

    if (filteredData.terms) formData.append("terms", filteredData.terms);
    if (filteredData.isTaxable !== undefined)
      formData.append("isTaxable", filteredData.isTaxable ? "true" : "false");

    if (filteredData.isActive !== undefined)
      formData.append("isActive", filteredData.isActive ? "true" : "false");

    // Add pricing
    if (filteredData.pricing && Array.isArray(filteredData.pricing)) {
      filteredData.pricing.forEach((price: any, index: number) => {
        if (price.unit) formData.append(`pricing[${index}][unit]`, price.unit);
        if (price.amount !== undefined)
          formData.append(`pricing[${index}][amount]`, price.amount.toString());
        formData.append(
          `pricing[${index}][isDefault]`,
          price.isDefault ? "true" : "false"
        );
      });
    }

    // Add availability
    if (filteredData.availability && Array.isArray(filteredData.availability)) {
      filteredData.availability.forEach((slot: any, index: number) => {
        if (slot.day) formData.append(`availability[${index}][day]`, slot.day);
        if (slot.startTime)
          formData.append(`availability[${index}][startTime]`, slot.startTime);
        if (slot.endTime)
          formData.append(`availability[${index}][endTime]`, slot.endTime);
        formData.append(
          `availability[${index}][isAvailable]`,
          slot.isAvailable ? "true" : "false"
        );
      });
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    // Add removed image IDs
    if (removedImageIds && removedImageIds.length > 0) {
      formData.append("removeImageIds", JSON.stringify(removedImageIds));
    }
    return apiFetch(`/facilities/${id}`, { method: "PUT", body: formData });
  },
  remove: (id: string) => apiFetch(`/facilities/${id}`, { method: "DELETE" }),
  addAvailability: (id: string, payload: any) =>
    apiFetch(`/facilities/${id}/availability`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  removeAvailability: (id: string, payload: any) =>
    apiFetch(`/facilities/${id}/availability`, {
      method: "DELETE",
      body: JSON.stringify(payload),
    }),
  // Review methods
  createReview: (
    facilityId: string,
    payload: { rating: number; comment: string }
  ) =>
    apiFetch(`/reviews`, {
      method: "POST",
      body: JSON.stringify({ facilityId, ...payload }),
    }),
  updateReview: (
    reviewId: string,
    payload: { rating: number; comment: string }
  ) =>
    apiFetch(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteReview: (reviewId: string) =>
    apiFetch(`/reviews/${reviewId}`, { method: "DELETE" }),
  getUserReview: (facilityId: string) =>
    apiFetch(`/reviews/user/${facilityId}`, { method: "GET" }),
};

// Inventory Items
export const InventoryAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return apiFetch(`/inventory-items${qs}`, { method: "GET" });
  },
  listCompany: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return apiFetch(`/inventory-items/company${qs}`, { method: "GET" });
  },
  lowStock: () => apiFetch(`/inventory-items/low-stock`, { method: "GET" }),
  create: (payload: Record<string, any>, files?: File[]) => {
    const formData = new FormData();

    if (payload.name) formData.append("name", payload.name);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.sku) formData.append("sku", payload.sku);
    if (payload.quantity !== undefined)
      formData.append("quantity", payload.quantity.toString());
    if (payload.status) formData.append("status", payload.status);
    if (payload.associatedFacility)
      formData.append("associatedFacility", payload.associatedFacility);
    if (payload.category) formData.append("category", payload.category);

    // Handle pricing array
    if (payload.pricing && Array.isArray(payload.pricing)) {
      payload.pricing.forEach((priceItem, index) => {
        if (priceItem.unit) {
          formData.append(`pricing[${index}][unit]`, priceItem.unit);
        }
        if (priceItem.amount !== undefined) {
          formData.append(
            `pricing[${index}][amount]`,
            priceItem.amount.toString()
          );
        }
        if (priceItem.isDefault !== undefined) {
          formData.append(
            `pricing[${index}][isDefault]`,
            priceItem.isDefault.toString()
          );
        }
      });
    }

    if (payload.purchaseInfo) {
      const { purchaseDate, purchasePrice, supplier, warrantyExpiry } =
        payload.purchaseInfo;

      if (purchaseDate)
        formData.append("purchaseInfo[purchaseDate]", purchaseDate.toString());
      if (purchasePrice !== undefined)
        formData.append(
          "purchaseInfo[purchasePrice]",
          purchasePrice.toString()
        );
      if (supplier) formData.append("purchaseInfo[supplier]", supplier);
      if (warrantyExpiry)
        formData.append(
          "purchaseInfo[warrantyExpiry]",
          warrantyExpiry.toString()
        );
    }

    if (payload.alerts) {
      Object.entries(payload.alerts).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`alerts[${key}]`, String(value));
        }
      });
    }

    if (payload.isTaxable)
      formData.append("isTaxable", payload.isTaxable ? "true" : "false");

    if (payload.specifications && payload.specifications instanceof Map) {
      const plainObject: Record<string, any> = {};
      payload.specifications.forEach((value, key) => {
        plainObject[key] = value;
      });
      formData.append("specifications", JSON.stringify(plainObject));
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    return apiFetch(`/inventory-items`, { method: "POST", body: formData });
  },
  update: (
    id: string,
    payload: Record<string, any>,
    files?: File[],
    removedImageIds?: string[]
  ) => {
    const filteredData = {
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.sku && { sku: payload.sku }),
      ...(payload.quantity !== undefined && { quantity: payload.quantity }),
      ...(payload.status && { status: payload.status }),
      ...(payload.associatedFacility && {
        associatedFacility: payload.associatedFacility,
      }),
      ...(payload.category && { category: payload.category }),
      ...(payload.pricing && { pricing: payload.pricing }),
      ...(payload.purchaseInfo && { purchaseInfo: payload.purchaseInfo }),
      ...(payload.alerts && { alerts: payload.alerts }),
      ...(payload.isTaxable !== undefined && { isTaxable: payload.isTaxable }),
      ...(payload.specifications && { specifications: payload.specifications }),
    };

    const formData = new FormData();

    if (filteredData.name) formData.append("name", filteredData.name);
    if (filteredData.description)
      formData.append("description", filteredData.description);
    if (filteredData.sku) formData.append("sku", filteredData.sku);
    if (filteredData.quantity !== undefined)
      formData.append("quantity", filteredData.quantity.toString());
    if (filteredData.status) formData.append("status", filteredData.status);
    if (filteredData.associatedFacility)
      formData.append("associatedFacility", filteredData.associatedFacility);
    if (filteredData.category)
      formData.append("category", filteredData.category);

    if (filteredData.pricing && Array.isArray(filteredData.pricing)) {
      filteredData.pricing.forEach((priceItem: any, index: number) => {
        if (priceItem.unit) {
          formData.append(`pricing[${index}][unit]`, priceItem.unit);
        }
        if (priceItem.amount !== undefined) {
          formData.append(
            `pricing[${index}][amount]`,
            priceItem.amount.toString()
          );
        }
        if (priceItem.isDefault !== undefined) {
          formData.append(
            `pricing[${index}][isDefault]`,
            priceItem.isDefault.toString()
          );
        }
      });
    }

    if (filteredData.purchaseInfo) {
      const { purchaseDate, purchasePrice, supplier, warrantyExpiry } =
        filteredData.purchaseInfo;

      if (purchaseDate)
        formData.append("purchaseInfo[purchaseDate]", purchaseDate.toString());
      if (purchasePrice !== undefined)
        formData.append(
          "purchaseInfo[purchasePrice]",
          purchasePrice.toString()
        );
      if (supplier) formData.append("purchaseInfo[supplier]", supplier);
      if (warrantyExpiry)
        formData.append(
          "purchaseInfo[warrantyExpiry]",
          warrantyExpiry.toString()
        );
    }

    if (filteredData.alerts) {
      Object.entries(filteredData.alerts).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`alerts[${key}]`, String(value));
        }
      });
    }

    if (filteredData.isTaxable !== undefined)
      formData.append("isTaxable", filteredData.isTaxable ? "true" : "false");

    if (
      filteredData.specifications &&
      filteredData.specifications instanceof Map
    ) {
      const plainObject: Record<string, unknown> = {};
      filteredData.specifications.forEach((value: any, key: string) => {
        plainObject[key] = value;
      });
      formData.append("specifications", JSON.stringify(plainObject));
    }

    // Add new image files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    // Add removed image IDs
    if (removedImageIds && removedImageIds.length > 0) {
      formData.append("removeImageIds", JSON.stringify(removedImageIds));
    }

    return apiFetch(`/inventory-items/${id}`, {
      method: "PUT",
      body: formData,
    });
  },
  getItem: (id: string) =>
    apiFetch(`/inventory-items/${id}`, { method: "GET" }),
  remove: (id: string) =>
    apiFetch(`/inventory-items/${id}`, { method: "DELETE" }),
  restore: (id: string) =>
    apiFetch(`/inventory-items/${id}/restore`, { method: "POST" }),
  returnItem: (id: string, payload: any) =>
    apiFetch(`/inventory-items/${id}/return`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addMaintenance: (id: string, payload: any) =>
    apiFetch(`/inventory-items/${id}/maintenance`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Bookings
export const BookingsAPI = {
  create: (payload: any) =>
    apiFetch(`/bookings`, { method: "POST", body: JSON.stringify(payload) }),
  checkAvailability: (payload: {
    facilityId: string;
    startDate: string;
    endDate: string;
  }) =>
    apiFetch(`/bookings/check-availability`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => apiFetch(`/bookings/me`, { method: "GET" }),
  getUserBookings: () => apiFetch(`/bookings/me`, { method: "GET" }),
  get: (id: string) => apiFetch(`/bookings/${id}`, { method: "GET" }),
  listAll: () => apiFetch(`/bookings`, { method: "GET" }),
  listCompany: () => apiFetch(`/bookings/company`, { method: "GET" }),
  update: (id: string, payload: any) =>
    apiFetch(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  checkIn: (id: string) =>
    apiFetch(`/bookings/${id}/check-in`, { method: "POST" }),
  checkOut: (id: string) =>
    apiFetch(`/bookings/${id}/check-out`, { method: "POST" }),
  remove: (id: string) => apiFetch(`/bookings/${id}`, { method: "DELETE" }),
};

// Users
export const UsersAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return apiFetch(`/users${qs}`, { method: "GET" });
  },
  listCompany: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return apiFetch(`/users/company${qs}`, { method: "GET" });
  },
  profile: () => apiFetch<User | null>(`/auth/profile`, { method: "GET" }),
  update: (id: string, payload: any) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateRole: (id: string, role: string) =>
    apiFetch(`/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  stats: () => apiFetch(`/users/statistics`, { method: "GET" }),

  // Remove user from company
  removeUserFromCompany: (userId: string) =>
    apiFetch(`/company-join-requests/user/${userId}`, { method: "DELETE" }),

  // Subaccount methods
  getSubaccounts: () => apiFetch(`/users/subaccounts`, { method: "GET" }),
};

// Cart
export const CartAPI = {
  list: () => apiFetch(`/cart`, { method: "GET" }),
  add: (item: {
    id: string;
    type: "facility" | "inventory";
    quantity?: number;
  }) => apiFetch(`/cart/add`, { method: "POST", body: JSON.stringify(item) }),
  remove: (item: { id: string; type: "facility" | "inventory" }) =>
    apiFetch(`/cart/remove`, { method: "POST", body: JSON.stringify(item) }),
  clear: () => apiFetch(`/cart/clear`, { method: "POST" }),
  checkout: () => apiFetch(`/cart/checkout`, { method: "POST" }),
};

// Tax Schedules
export const TaxSchedulesAPI = {
  list: () => apiFetch(`/tax-schedules`, { method: "GET" }),
  create: (payload: any) =>
    apiFetch(`/tax-schedules`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: any) =>
    apiFetch(`/tax-schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id: string) =>
    apiFetch(`/tax-schedules/${id}`, { method: "DELETE" }),
};

// Taxes
export const TaxesAPI = {
  list: () => apiFetch(`/taxes`, { method: "GET" }),
  listCompany: () => apiFetch(`/taxes/company`, { method: "GET" }),
  create: (payload: any) =>
    apiFetch(`/taxes`, { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: any) =>
    apiFetch(`/taxes/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => apiFetch(`/taxes/${id}`, { method: "DELETE" }),
};

// Transactions
export const TransactionsAPI = {
  listCompany: () => apiFetch(`/transaction`, { method: "GET" }),
  getUserTransactions: () => apiFetch(`/transaction/user`, { method: "GET" }),
  initializePayment: (payload: any) =>
    apiFetch(`/transaction/initialize`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  verifyByReference: (reference: string) =>
    apiFetch(`/transaction/verify/${reference}`, { method: "GET" }),
  detailsByReference: (reference: string) =>
    apiFetch(`/transaction/details/${reference}`, { method: "GET" }),
  update: (id: string, payload: any) =>
    apiFetch(`/transaction/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  listBanks: () => apiFetch("/transaction/banks", { method: "GET" }),
  getAccountDetails: (bankCode: string, accountNumber: string) =>
    apiFetch(`/transaction/momo/${bankCode}/${accountNumber}`, {
      method: "GET",
    }),
  updateSubAccount: (subaccountCode: string, payload: any) =>
    apiFetch(`/transaction/subaccount/${subaccountCode}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getSubAccountDetails: (subaccountCode: string) =>
    apiFetch(`/transaction/subaccount/${subaccountCode}`, { method: "GET" }),
};

// Payouts
export const PayoutsAPI = {
  getPayouts: () => apiFetch(`/payouts`, { method: "GET" }),
  requestPayout: (payload: any) =>
    apiFetch(`/payouts/request`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updatePayout: (id: string, payload: any) =>
    apiFetch(`/payouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  approvePayout: (id: string) =>
    apiFetch(`/payouts/${id}/approve`, { method: "POST" }),
  processPayout: (id: string) =>
    apiFetch(`/payouts/${id}/process`, { method: "POST" }),
  getCompanyBalance: () => apiFetch(`/payouts/balance`, { method: "GET" }),
  getPlatformBalance: () =>
    apiFetch(`/payouts/platform-balance`, { method: "GET" }),
};

// Cashflow
export const CashflowAPI = {
  summary: () => apiFetch(`/cashflow/summary`, { method: "GET" }),
  anomalies: () => apiFetch(`/cashflow/anomalies`, { method: "GET" }),
};

// Email
export const EmailAPI = {
  testConfiguration: () => apiFetch(`/email/test-config`, { method: "GET" }),
  testCompanyConfiguration: (companyId: string) =>
    apiFetch(`/email/test-company-config/${companyId}`, { method: "GET" }),
  sendTestEmail: (payload: { to: string; subject: string; message: string }) =>
    apiFetch(`/email/test`, { method: "POST", body: JSON.stringify(payload) }),
  sendWelcomeEmail: (userId: string) =>
    apiFetch(`/email/welcome/${userId}`, { method: "POST" }),

  sendBookingConfirmation: (bookingId: string) =>
    apiFetch(`/email/booking-confirmation/${bookingId}`, { method: "POST" }),
  sendBookingReminder: (bookingId: string) =>
    apiFetch(`/email/booking-reminder/${bookingId}`, { method: "POST" }),
  sendBulkEmail: (payload: any) =>
    apiFetch(`/email/bulk`, { method: "POST", body: JSON.stringify(payload) }),
  getEmailSettings: (companyId: string) =>
    apiFetch(`/email/settings/${companyId}`, { method: "GET" }),
  updateEmailSettings: (companyId: string, settings: any) =>
    apiFetch(`/email/settings/${companyId}`, {
      method: "PUT",
      body: JSON.stringify({ emailSettings: settings }),
    }),
};

// Notifications
export const NotificationsAPI = {
  getUserNotifications: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return apiFetch(`/notifications/user${qs}`, { method: "GET" });
  },

  markAsRead: (notificationId: string) =>
    apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" }),

  markAllAsRead: () => apiFetch(`/notifications/read-all`, { method: "PATCH" }),

  deleteNotification: (notificationId: string) =>
    apiFetch(`/notifications/${notificationId}`, { method: "DELETE" }),

  getPreferences: () =>
    apiFetch(`/notifications/preferences`, { method: "GET" }),

  updatePreferences: (preferences: Partial<NotificationPreferences>) =>
    apiFetch(`/notifications/preferences`, {
      method: "PATCH",
      body: JSON.stringify(preferences),
    }),

  getUnreadCount: () =>
    apiFetch(`/notifications/unread-count`, { method: "GET" }),
};

// Company API
export const CompanyAPI = {
  update: (companyId: string, formData: FormData) =>
    apiFetch(`/companies/${companyId}`, {
      method: "PUT",
      body: formData,
    }),
  getPublic: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiFetch(`/companies/public${qs}`, { method: "GET" });
  },
  getAll: () => apiFetch(`/companies`, { method: "GET" }),
  getById: (companyId: string) =>
    apiFetch(`/companies/${companyId}`, { method: "GET" }),
};

// Company Roles
export const CompanyRoleAPI = {
  getCompanyRoles: () => apiFetch(`/company-roles`, { method: "GET" }),

  getRoleById: (roleId: string) =>
    apiFetch(`/company-roles/${roleId}`, { method: "GET" }),

  createRole: (roleData: {
    name: string;
    permissions: {
      accessFinancials?: boolean;
      viewBookings?: boolean;
      viewInventory?: boolean;
      createRecords?: boolean;
      editRecords?: boolean;
      manageUsers?: boolean;
      manageFacilities?: boolean;
      manageInventory?: boolean;
      manageTransactions?: boolean;
      manageEmails?: boolean;
      manageSettings?: boolean;
    };
  }) =>
    apiFetch(`/company-roles`, {
      method: "POST",
      body: JSON.stringify(roleData),
    }),

  updateRole: (roleId: string, updates: any) =>
    apiFetch(`/company-roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteRole: (roleId: string) =>
    apiFetch(`/company-roles/${roleId}`, { method: "DELETE" }),

  assignRoleToUser: (userId: string, roleId: string) =>
    apiFetch(`/company-roles/assign`, {
      method: "POST",
      body: JSON.stringify({ userId, roleId }),
    }),

  removeRoleFromUser: (userId: string) =>
    apiFetch(`/company-roles/user/${userId}`, { method: "DELETE" }),

  getUsersWithRole: (roleId: string) =>
    apiFetch(`/company-roles/${roleId}/users`, { method: "GET" }),

  initializeDefaultRoles: () =>
    apiFetch(`/company-roles/initialize-defaults`, { method: "POST" }),
};

// Support API
export const SupportAPI = {
  // Create new support ticket
  createTicket: (data: FormData) =>
    apiFetch("/support/tickets", { method: "POST", body: data }),

  // Get user's own tickets
  getUserTickets: () => apiFetch("/support/tickets/user", { method: "GET" }),

  // Get super admin tickets (Taurean IT)
  getSuperAdminTickets: () =>
    apiFetch("/support/tickets/super-admin", { method: "GET" }),

  // Get staff tickets (admin/staff roles)
  getStaffTickets: () => apiFetch("/support/tickets/staff", { method: "GET" }),

  // Get ticket details
  getTicketDetails: (ticketId: string) =>
    apiFetch(`/support/tickets/${ticketId}`, { method: "GET" }),

  // Send message to ticket
  sendMessage: (ticketId: string, data: FormData) =>
    apiFetch(`/support/tickets/${ticketId}/messages`, {
      method: "POST",
      body: data,
    }),

  // Update ticket status
  updateTicketStatus: (ticketId: string, status: string) =>
    apiFetch(`/support/tickets/${ticketId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // Close ticket
  closeTicket: (ticketId: string) =>
    apiFetch(`/support/tickets/${ticketId}/close`, { method: "PUT" }),

  // Reopen ticket
  reopenTicket: (ticketId: string) =>
    apiFetch(`/support/tickets/${ticketId}/reopen`, { method: "PUT" }),

  // Assign ticket to staff member
  assignTicket: (ticketId: string, staffId: string) =>
    apiFetch(`/support/tickets/${ticketId}/assign`, {
      method: "PUT",
      body: JSON.stringify({ staffId }),
    }),

  // Reassign ticket to another staff member
  reassignTicket: (ticketId: string, newStaffId: string, reason?: string) =>
    apiFetch(`/support/tickets/${ticketId}/reassign`, {
      method: "PUT",
      body: JSON.stringify({ newStaffId, reason }),
    }),

  // Update typing status
  updateTypingStatus: (ticketId: string, isTyping: boolean) =>
    apiFetch(`/support/tickets/${ticketId}/typing`, {
      method: "POST",
      body: JSON.stringify({ isTyping }),
    }),

  // Get ticket statistics
  getTicketStats: () => apiFetch("/support/stats", { method: "GET" }),

  // Get available staff for assignment
  getAvailableStaff: () =>
    apiFetch("/support/staff/available", { method: "GET" }),

  getTicketMessages: (ticketId: string) =>
    apiFetch(`/support/tickets/${ticketId}/messages`, { method: "GET" }),
};

export const NotificationAPI = {
  // Get user notifications
  getUserNotifications: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.unreadOnly) searchParams.append("unreadOnly", "true");

    return apiFetch(`/notifications/user?${searchParams.toString()}`, {
      method: "GET",
    });
  },

  // Mark notification as read
  markAsRead: (notificationId: string) =>
    apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" }),

  // Mark all notifications as read
  markAllAsRead: () => apiFetch("/notifications/read-all", { method: "PATCH" }),

  // Delete notification
  deleteNotification: (notificationId: string) =>
    apiFetch(`/notifications/${notificationId}`, { method: "DELETE" }),

  // Get notification preferences
  getPreferences: () =>
    apiFetch("/notifications/preferences", { method: "GET" }),

  // Update notification preferences
  updatePreferences: (preferences: NotificationPreferences) =>
    apiFetch("/notifications/preferences", {
      method: "PATCH",
      body: JSON.stringify(preferences),
    }),

  // Get unread count
  getUnreadCount: () =>
    apiFetch("/notifications/unread-count", { method: "GET" }),
};

export const ReviewAPI = {
  // Get reviews for a facility
  getFacilityReviews: (
    facilityId: string,
    params?: { page?: number; limit?: number; rating?: number }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.rating) searchParams.append("rating", params.rating.toString());

    return apiFetch(
      `/reviews/facility/${facilityId}?${searchParams.toString()}`,
      { method: "GET" }
    );
  },

  // Create a review
  createReview: (reviewData: any) =>
    apiFetch("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  // Update a review
  updateReview: (reviewId: string, reviewData: any) =>
    apiFetch(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    }),

  // Delete a review
  deleteReview: (reviewId: string) =>
    apiFetch(`/reviews/${reviewId}`, { method: "DELETE" }),

  // Get user's reviews
  getUserReviews: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    return apiFetch(`/reviews/user?${searchParams.toString()}`, {
      method: "GET",
    });
  },

  // Get review statistics
  getReviewStats: (facilityId?: string) => {
    const path = facilityId ? `/reviews/stats/${facilityId}` : "/reviews/stats";
    return apiFetch(path, { method: "GET" });
  },
};

export const TaxScheduleAPI = {
  // Get all tax schedules
  getTaxSchedules: () => apiFetch("/tax-schedules", { method: "GET" }),

  // Get tax schedule by ID
  getTaxScheduleById: (scheduleId: string) =>
    apiFetch(`/tax-schedules/${scheduleId}`, { method: "GET" }),

  // Create tax schedule
  createTaxSchedule: (scheduleData: any) =>
    apiFetch("/tax-schedules", {
      method: "POST",
      body: JSON.stringify(scheduleData),
    }),

  // Update tax schedule
  updateTaxSchedule: (scheduleId: string, scheduleData: any) =>
    apiFetch(`/tax-schedules/${scheduleId}`, {
      method: "PUT",
      body: JSON.stringify(scheduleData),
    }),

  // Delete tax schedule
  deleteTaxSchedule: (scheduleId: string) =>
    apiFetch(`/tax-schedules/${scheduleId}`, { method: "DELETE" }),
};

export const ResourceAPI = {
  // Get all resources
  getResources: () => apiFetch("/resources", { method: "GET" }),

  // Get resource by ID
  getResourceById: (resourceId: string) =>
    apiFetch(`/resources/${resourceId}`, { method: "GET" }),

  // Create resource
  createResource: (resourceData: any) =>
    apiFetch("/resources", {
      method: "POST",
      body: JSON.stringify(resourceData),
    }),

  // Update resource
  updateResource: (resourceId: string, resourceData: any) =>
    apiFetch(`/resources/${resourceId}`, {
      method: "PUT",
      body: JSON.stringify(resourceData),
    }),

  // Delete resource
  deleteResource: (resourceId: string) =>
    apiFetch(`/resources/${resourceId}`, { method: "DELETE" }),
};

export const DeletionAPI = {
  // Request data deletion
  requestDeletion: (deletionData: any) =>
    apiFetch("/deletion/request", {
      method: "POST",
      body: JSON.stringify(deletionData),
    }),

  // Get deletion status
  getDeletionStatus: (requestId: string) =>
    apiFetch(`/deletion/status/${requestId}`, { method: "GET" }),

  // Cancel deletion request
  cancelDeletionRequest: (requestId: string) =>
    apiFetch(`/deletion/cancel/${requestId}`, { method: "PUT" }),
};

export const HealthAPI = {
  // Check API health
  checkHealth: () => apiFetch("/health", { method: "GET" }),

  // Check database health
  checkDatabaseHealth: () => apiFetch("/health/database", { method: "GET" }),

  // Check external services health
  checkExternalServicesHealth: () =>
    apiFetch("/health/external", { method: "GET" }),
};

export const getResourceUrl = (path: string): string => {
  if (!path) return "";

  // Normalize path for all OS (especially Windows backslashes)
  const normalizedPath = path.replace(/\\/g, "/");

  if (path.includes("http") || !normalizedPath.includes("uploads/")) {
    return path;
  }

  return `${API_BASE}/resources/${normalizedPath}`;
};
