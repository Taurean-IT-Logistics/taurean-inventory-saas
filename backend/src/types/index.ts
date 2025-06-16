export interface User {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "staff" | "admin";
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
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
  images: string[];
  terms?: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  pricing: {
    unit: "hour" | "day" | "week" | "month";
    amount: number;
  }[];
  rating: {
    average: number;
    totalReviews: number;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  user: User;
  facility: Facility;
  startDate: Date;
  endDate: Date;
  duration: string;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  totalPrice: number;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  booking?: Booking;
  user: User;
  type: "income" | "expense";
  category: string;
  amount: number;
  method: "cash" | "mobile_money" | "bank" | "cheque";
  ref?: string;
  facility?: Facility;
  account?: Account;
  description?: string;
  attachments?: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  name: string;
  quantity: number;
  status: "in_stock" | "rented" | "unavailable";
  associatedFacility: Facility;
  history: {
    date: Date;
    change: number;
    reason: string;
    user: User;
  }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  user: User;
  name: string;
  type: "cash" | "bank" | "mobile_money";
  balance: number;
  transactionHistory: {
    type: "credit" | "debit";
    amount: number;
    date: Date;
  }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
