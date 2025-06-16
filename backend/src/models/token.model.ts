import { Schema, model, Model, Document } from "mongoose";
import { Token } from "../types";

interface TokenDocument extends Document, Token {}

const TokenSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accessToken: { type: String },
  refreshToken: { type: String },
  passwordResetToken: { type: String },
  emailVerificationToken: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

const TokenModel: Model<TokenDocument> = model<TokenDocument>(
  "Token",
  TokenSchema
);

export { TokenModel, TokenDocument };
