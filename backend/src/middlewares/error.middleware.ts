import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { STATUS_CODES } from "../config";
import { sendError } from "../utils/response.utils";
import { logger } from "./logger.middleware";

function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(error);
  }

  const correlationId =
    req.headers["x-correlation-id"] ||
    req.headers["x-request-id"] ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userId = req.user?.id || "anonymous";

  logger.error(
    `Request failed | URL: ${req.originalUrl} | Method: ${req.method}`,
    {
      error: error.message,
      stack: error.stack,
      statusCode: error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR,
      requestId: correlationId,
      userId: userId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      component: "error-handler",
    }
  );

  sendError(
    res,
    `An error occurred: ${error.message || "Internal Server Error"}`,
    error,
    error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR
  );
}

const ErrorMiddleware: ErrorRequestHandler = errorHandler;

export default ErrorMiddleware;
