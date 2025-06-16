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
