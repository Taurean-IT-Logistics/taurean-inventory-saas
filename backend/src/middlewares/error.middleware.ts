import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils";
import { Logger } from "../utils";

export function ErrorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  Logger("Unhandled error occurred", req, "error-middleware", "error", error);

  if (res.headersSent) {
    return next(error);
  }

  // Handle specific error types
  if (error.name === "ValidationError") {
    sendError(res, "Validation Error", error.message, 400);
    return;
  }

  if (error.name === "CastError") {
    sendError(res, "Invalid ID format", null, 400);
    return;
  }

  if (error.code === 11000) {
    sendError(res, "Duplicate entry", null, 409);
    return;
  }

  if (error.name === "JsonWebTokenError") {
    sendError(res, "Invalid token", null, 401);
    return;
  }

  if (error.name === "TokenExpiredError") {
    sendError(res, "Token expired", null, 401);
    return;
  }

  // Default error response
  sendError(res, "Internal server error", null, 500);
}
