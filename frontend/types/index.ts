export interface CartItem {
  type: string;
  itemId: string;
  quantity?: number;
  name?: string;
  price?: number;
  imageUrl?: string;
  notes?: string;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: "user" | "staff" | "admin" | "superAdmin";
  loyaltyProfile?: {
    totalBookings: number;
    totalSpent: number;
    preferredFacilities: Facility[];
    lastBookingDate?: Date;
    loyaltyTier?: "bronze" | "silver" | "gold" | "platinum";
  };
  cart: CartItem[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  company?: string; // Company ObjectId string
  companyRole?: string; // CompanyRole ObjectId string
  isSuperAdmin?: boolean;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  companyId?: string;
  isSuperAdmin?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  pagination?: PaginationData;
  statusCode?: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface Facility {
  _id: string;
  name: string;
  description?: string;
  images: {
    path: string;
    originalName: string;
    mimetype: string;
    size: number;
  }[];
  terms?: string;
  availability: {
    day:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  blockedDates: {
    startDate: Date;
    endDate: Date;
    reason?: string;
    createdBy: User;
    createdAt: Date;
  }[];
  pricing: {
    unit: "hour" | "day" | "week" | "month";
    amount: number;
    isDefault: boolean;
  }[];
  rating: {
    average: number;
    totalReviews: number;
  };
  reviews: {
    user: User;
    booking: Booking;
    rating: number;
    comment: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  capacity: {
    maximum: number;
    recommended: number;
  };
  amenities: string[];
  location: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  operationalHours: {
    opening: string;
    closing: string;
  };
  isActive: boolean;
  isTaxable: boolean;
  isDeleted: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  _id: string;
  user: User;
  facility: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  paymentStatus:
    | "pending"
    | "completed"
    | "failed"
    | "refunded"
    | "partial_refund";
  totalPrice: number;
  items?: { inventoryItem: InventoryItem; quantity: number }[];
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    reason: string;
    appliedBy: User;
  };
  paymentDetails: Transaction;
  checkIn?: {
    time: Date;
    verifiedBy: User;
    notes?: string;
  };
  checkOut?: {
    time: Date;
    verifiedBy: User;
    condition: "good" | "fair" | "damaged";
    notes?: string;
    damageReport?: string;
  };
  cancellation?: {
    reason: string;
    cancelledBy: User;
    cancelledAt: Date;
    refundAmount?: number;
  };
  notes?: string;
  internalNotes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id: string;
  booking?: Booking;
  user: User;
  account?: Account;
  type: string;
  category: string;
  amount: number;
  method: string;
  paymentDetails: {
    paystackReference?: string;
    chequeNumber?: string;
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      sortCode?: string;
    };
    mobileMoneyDetails?: {
      provider: string;
      phoneNumber: string;
      transactionId: string;
    };
  };
  ref?: string;
  accessCode?: string;
  receiptUrl?: string;
  approvedBy?: User;
  reconciled: boolean;
  reconciledAt?: Date;
  facility?: Facility;
  inventoryItem?: InventoryItem;
  description?: string;
  attachments: string[];
  tags: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: string; // Company owning this transaction
  isPlatformRevenue?: boolean;
}

export interface InventoryItem {
  _id: string;
  name: string;
  description?: string;
  sku?: string;
  quantity: number;
  status: "in_stock" | "rented" | "unavailable" | "maintenance" | "retired";
  images: {
    path: string;
    originalName: string;
    mimetype: string;
    size: number;
  }[];
  associatedFacility?: string;
  category: string;
  purchaseInfo: {
    purchaseDate?: Date;
    purchasePrice?: number;
    supplier?: string;
    warrantyExpiry?: Date;
  };
  pricing: {
    unit: "hour" | "day" | "week" | "month";
    amount: number;
    isDefault: boolean;
  }[];
  history: {
    date: Date;
    change: number;
    reason: string;
    user: User;
    notes?: string;
  }[];
  returns?: {
    date: Date;
    returnedBy?: User;
    condition?: "good" | "fair" | "damaged";
    quantity?: number;
    notes?: string;
  }[];
  maintenanceSchedule: {
    scheduledDate: Date;
    type: "cleaning" | "repair" | "inspection" | "calibration";
    completed: boolean;
    completedDate?: Date;
    cost?: number;
    notes?: string;
    performedBy?: User;
  }[];
  currentBookings: Booking[];
  specifications: Map<string, any>;
  alerts: {
    lowStock: boolean;
    maintenanceDue: boolean;
    warrantyExpiring: boolean;
  };
  isTaxable: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  user: User;
  name: string;
  usage: number;
  currency: string;
  transactionHistory: {
    transactionId: Transaction;
    type: "credit" | "debit";
    amount: number;
    usageAfter: number;
    date: Date;
    description?: string;
  }[];
  reconciliation: {
    lastReconciledDate?: Date;
    lastReconciledBy?: User;
    discrepancies: {
      amount: number;
      reason: string;
      resolvedBy?: User;
      resolvedAt?: Date;
    }[];
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAnalytics {
  user: User;
  behaviorPattern: {
    preferredTimeSlots: string[];
    preferredDays: string[];
    averageBookingDuration: number;
    preferredFacilities: Facility[];
    bookingFrequency: "daily" | "weekly" | "monthly" | "occasional";
  };
  financialProfile: {
    totalSpent: number;
    averageBookingValue: number;
    paymentPreference: "cash" | "mobile_money" | "bank" | "card";
    creditScore: number;
  };
  loyaltyMetrics: {
    totalBookings: number;
    cancellationRate: number;
    noShowRate: number;
    lastBookingDate?: Date;
    loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
    pointsEarned: number;
    pointsRedeemed: number;
  };
  recommendations: {
    suggestedFacilities: Facility[];
    suggestedTimeSlots: string[];
    personalizedOffers: {
      type: string;
      discount: number;
      validUntil: Date;
      used: boolean;
    }[];
  };
  insights: {
    isHighValueCustomer: boolean;
    churnRisk: "low" | "medium" | "high";
    nextBookingPrediction?: Date;
    lifetimeValue: number;
  };
  updatedAt: Date;
}

export interface SystemAlert {
  type:
    | "overbooking"
    | "maintenance_due"
    | "low_inventory"
    | "payment_failed"
    | "high_churn_risk";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  relatedEntity: {
    type: "facility" | "booking" | "user" | "inventory" | "transaction";
    id: string;
  };
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: User;
  resolvedAt?: Date;
  actionTaken?: string;
  createdAt: Date;
}

export interface Token {
  user: string;
  accessToken?: string;
  refreshToken?: string;
  passwordResetToken?: string;
  emailVerificationToken?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentFormData {
  metadata: {
    full_name: string;
  };
  email: string;
  currency: string;
  amount: number;
}

export interface Tax {
  _id: string;
  name: string;
  rate: number;
  type: string;
  appliesTo: "inventory_item" | "facitlity" | "both";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  _id: string;
  name: string;
  logoUrl?: string;
  registrationDocs?: string[];
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  invoiceFormat?: {
    type: "auto" | "prefix" | "paystack";
    prefix?: string; // e.g., TIL-
    nextNumber?: number; // auto-increment counter
    padding?: number; // e.g., 4 -> 0001
  };
  currency?: string; // GHS, USD, etc.
  isActive: boolean;
  subscription?: {
    plan: "free_trial" | "monthly" | "biannual" | "annual" | "triannual";
    expiresAt: Date;
    licenseKey: string;
    paymentReference?: string;
    activatedAt?: Date;
    status?: "active" | "expired" | "cancelled";
    updatedAt?: Date;
    hasUsedTrial?: boolean;
    isTrial?: boolean;
  };
  paystackSubaccountCode?: string;
  paystackRecipientCode?: string;
  feePercent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  label: string;
  durationDays: number;
  price: number;
  features: {
    maxFacilities: number;
    maxUsers: number;
    maxInventoryItems: number;
    maxBookings: number;
    support: string;
    analytics: string;
    apiAccess: boolean;
    customBranding: boolean;
    whiteLabel: boolean;
    dedicatedSupport: boolean;
    customIntegrations: boolean;
    slaGuarantee: boolean;
    training: boolean;
  };
  description: string;
  popular: boolean;
  isTrial: boolean;
}

export interface SubscriptionStatus {
  hasSubscription: boolean;
  isActive: boolean;
  expiresAt: Date | null;
  plan: SubscriptionPlan | null;
  features: SubscriptionPlan['features'] | null;
  daysRemaining: number;
  canStartTrial: boolean;
  isTrial: boolean;
  hasUsedTrial: boolean;
}

export interface UsageStats {
  facilities: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  users: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  inventory: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  bookings: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
}

export interface Payout {
  company?: string; // null for platform payout
  isPlatform?: boolean;
  amount: number;
  currency: string;
  recipientCode?: string;
  status:
    | "pending"
    | "approved"
    | "processing"
    | "paid"
    | "failed"
    | "rejected";
  requestedBy: string;
  processedBy?: string;
  paystackTransferCode?: string;
  paystackTransferId?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyRole {
  _id: string;
  company: string; // Company ObjectId string
  name: string; // e.g., Admin, Staff, User
  permissions: {
    viewInvoices: boolean;
    accessFinancials: boolean;
    viewBookings: boolean;
    viewInventory: boolean;
    createRecords: boolean;
    editRecords: boolean;
    manageUsers: boolean;
    manageFacilities: boolean;
    manageInventory: boolean;
    manageTransactions: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "booking"
    | "payment"
    | "system";
  isRead: boolean;
  data?: {
    bookingId?: string;
    transactionId?: string;
    facilityId?: string;
    amount?: number;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  _id: string;
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  bookingNotifications: boolean;
  paymentNotifications: boolean;
  systemNotifications: boolean;
  marketingNotifications: boolean;
  updatedAt: Date;
}

export interface CompanyJoinRequest {
  _id: string;
  user: string | User;
  company: string | Company;
  status: "pending" | "approved" | "rejected";
  requestedBy: string | User;
  approvedBy?: string | User;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}



export interface BookingEvent {
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    booking: Partial<Booking>;
    facility: string | Facility;
  };
}

export interface BookingCalendarProps {
  bookings: Booking[];
  facilities: Facility[];
  onRefresh?: () => void;
  onUpdateBooking?: (booking: Booking) => Promise<void>;
  onDeleteBooking?: (bookingId: string) => Promise<void>;
  onCreateBooking?: (booking: Partial<Booking>) => Promise<void>;
}
