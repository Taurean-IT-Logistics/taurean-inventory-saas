import mongoose from "mongoose";

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
  _id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: "user" | "staff" | "admin";
  isSuperAdmin?: boolean; // Only for Taurean IT users
  company?: string | Company;
  companyRole?: string | CompanyRole;
  cart?: CartItem[];
  loyaltyProfile?: any;
  status: "active" | "inactive" | "suspended";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  company: any;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  user: User;
  facility: Facility;
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
  company: Company;
  internalNotes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  booking?: Booking;
  user: mongoose.Types.ObjectId | string;
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
  isPaystack?: boolean;
  isCheque?: boolean;
  cheque?: Cheque;
  isSplitPayment?: boolean;
  splitPayment?: SplitPayment;
  isCash?: boolean;
  cash: Cash;
  taxes: mongoose.Types.ObjectId | string;
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
  company?: mongoose.Types.ObjectId | string;
  isPlatformRevenue?: boolean;
}

export interface InventoryItem {
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
  associatedFacility?: Facility;
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
  company: any;
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
  name: string;
  rate: number;
  type: string;
  appliesTo: "inventory_item" | "facility" | "both";
  isSuperAdminTax?: boolean;
  company?: Company;
  active: boolean;
}

export interface Company {
  name: string;
  logo?: {
    path: string;
    originalName: string;
    mimetype: string;
    size: number;
  };
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
  owner: User;
  paystackSubaccountCode?: string;
  paystackRecipientCode?: string;
  feePercent?: number;
  createdAt: Date;
  updatedAt: Date;
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
  company: string; // Company ObjectId string
  name: string; // e.g., Admin, Staff, User
  permissions: {
    viewInvoices?: boolean;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  company?: mongoose.Types.ObjectId | string;
  user?: mongoose.Types.ObjectId | string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  category: "booking" | "payment" | "invoice" | "system" | "support";
  data?: any;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

export type TransactionSplit = {
  transaction: Transaction;
  splitType: "fixed" | "percentage";
  splitAmount?: number;
  splitPercentage?: number;
  dueDate: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export interface SplitPayment {
  amount: number;
  currency: string;
  transactions: TransactionSplit[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cheque {
  number: string;
  bank: string;
  accountNumber: string;
  amount: number;
  issuedDate: Date;
  expiryDate: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type CashDenomination = {
  denomination: number;
  quantity: number;
};
export interface Cash {
  amount: number;
  denominations: CashDenomination[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rental {
  item: InventoryItem;
  quantity: number;
  startDate: Date;
  endDate: Date;
  amount: number;
  transaction: Transaction;
  notes?: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
