import { Response } from "express";
import { STATUS_CODES } from "../config";

interface APIResponse {
  success: boolean;
  message: string;
  data?: any;
  statusCode: number;
  timestamp: string;
}

/**
 * Send success response
 */
export function sendSuccess(
  res: Response,
  message: string,
  data?: any,
  statusCode: number = STATUS_CODES.OK
): Response {
  const response: APIResponse = {
    success: true,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  message: string,
  data?: any,
  statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR
): Response {
  const response: APIResponse = {
    success: false,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 */
export function sendValidationError(
  res: Response,
  message: string = "Validation failed",
  data?: any
): Response {
  return sendError(res, message, data, STATUS_CODES.BAD_REQUEST);
}

/**
 * Send not found response
 */
export function sendNotFound(
  res: Response,
  message: string = "Resource not found"
): Response {
  return sendError(res, message, null, STATUS_CODES.NOT_FOUND);
}

/**
 * Send unauthorized response
 */
export function sendUnauthorized(
  res: Response,
  message: string = "Unauthorized access"
): Response {
  return sendError(res, message, null, STATUS_CODES.UNAUTHORIZED);
}

/**
 * Send forbidden response
 */
export function sendForbidden(
  res: Response,
  message: string = "Access forbidden"
): Response {
  return sendError(res, message, null, STATUS_CODES.FORBIDDEN);
}

/**
 * Send conflict response
 */
export function sendConflict(
  res: Response,
  message: string = "Resource conflict"
): Response {
  return sendError(res, message, null, STATUS_CODES.CONFLICT);
}
