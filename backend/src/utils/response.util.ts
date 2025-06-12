import { Response } from "express";
import { STATUS_CODES } from "../config";
import { APIResponse, PaginationData } from "../types";

function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = STATUS_CODES.OK,
  pagination?: PaginationData
): Response {
  const response: APIResponse<T> = {
    success: true,
    message,
    data,
    pagination,
    statusCode,
  };

  if (pagination) {
    response.pagination = {
      ...pagination,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1,
    };
  }

  return res.status(statusCode).json(response);
}

/**
 * Send Error response
 */

function sendError(
  res: Response,
  message: string,
  errors?: any,
  statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR
): Response {
  const response: APIResponse = {
    success: false,
    message,
    errors,
  };

  return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 */
function sendValidationError(
  res: Response,
  errors: any,
  message: string = "Validation failed"
): Response {
  return sendError(res, message, errors, STATUS_CODES.BAD_REQUEST);
}

/**
 * Send not found response
 */
function sendNotFound(
  res: Response,
  message: string = "Resource not found"
): Response {
  return sendError(res, message, null, STATUS_CODES.NOT_FOUND);
}

/**
 * Send unauthorized response
 */
function sendUnauthorized(
  res: Response,
  message: string = "Unauthorized access"
): Response {
  return sendError(res, message, null, STATUS_CODES.UNAUTHORIZED);
}

/**
 * Send forbidden response
 */
function sendForbidden(
  res: Response,
  message: string = "Access forbidden"
): Response {
  return sendError(res, message, null, STATUS_CODES.FORBIDDEN);
}

/**
 * Send conflict response
 */
function sendConflict(
  res: Response,
  message: string = "Resource conflict"
): Response {
  return sendError(res, message, null, STATUS_CODES.CONFLICT);
}

export {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
};
