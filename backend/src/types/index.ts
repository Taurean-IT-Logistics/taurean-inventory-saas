import { Types } from "mongoose";

export interface TokenPayload {
  id: Types.ObjectId;
  role: string;
  username: string;
  email: string;
}

export interface User {
  name: string;
  username: string;
  email: string;
  id: string;
  role: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
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
