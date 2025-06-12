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
