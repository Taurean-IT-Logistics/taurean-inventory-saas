import { Schema, model, Document } from "mongoose";

interface UserDocument extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

const baseOptions = {
  discriminatorKey: "role",
  timestamps: true,
};

const ROLE_ENUMS = ["user", "admin", "superadmin"];

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLE_ENUMS, default: "user" },
    isDeleted: { type: Boolean, default: false },
  },
  baseOptions
);

const UserModel = model<UserDocument>("User", UserSchema);

export { UserDocument, UserModel };
