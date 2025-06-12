import { logger } from "../middlewares";
import { Request } from "express";

function Logger(
  message: string,
  req: Request | null,
  component = "unknown",
  level = "info",
  error: Error | any = null
): void {
  const correlationId =
    req?.headers["x-correlation-id"] ||
    req?.headers["x-request-id"] ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userId = req?.user?.id || "anonymous";
  const ip = req?.ip || "unknown";
  const userAgent = req?.headers["user-agent"] || "Unknown";

  if (level === "error" && error) {
    logger.error(message, {
      requestId: correlationId,
      userId: userId,
      ip: ip,
      error: error.message,
      stack: error.stack,
      component: component,
      userAgent: userAgent,
    });
  } else {
    logger.info(message, {
      requestId: correlationId,
      userId: userId,
      ip: ip,
      component: component,
      userAgent: userAgent,
    });
  }
}

export default Logger;
