import { Request, Response, NextFunction } from "express";
import { createLogger, format, transports } from "winston";
import { CONFIG } from "../config";
import DailyRotateFile from "winston-daily-rotate-file";

const customFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  format.errors({ stack: true }),
  format.metadata({ fillExcept: ["timestamp", "level", "message", "stack"] }),
  format.printf((info: any) => {
    const requestId =
      info.metadata.requestId ||
      info.metadata.correlationId ||
      info.metadata.traceId ||
      "-";
    const userId = info.metadata.userId || "-";
    const service = info.metadata.service || "api-service";
    const component = info.metadata.component || "-";
    const env = process.env.NODE_ENV || "development";

    // Format the log with structured fields and consistent separators
    return `${info.timestamp} | ${env} | ${
      info.message
    } | ${service}:${component} | ${
      info.level
    } | reqId=${requestId} | userId=${userId}${
      info.stack ? "\n" + info.stack : ""
    }`;
  })
);

const logger = createLogger({
  level: CONFIG.IS_PRODUCTION ? "info" : "debug",
  defaultMeta: {
    service: "api-service",
    version: require("../../package.json").version,
    component: "logger",
  },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), customFormat),
    }),
    new DailyRotateFile({
      filename: "logs/%DATE%-results.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: CONFIG.IS_PRODUCTION ? "info" : "debug",
      format: customFormat,
    }),
  ],
});

function LoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const correlationId =
      req.headers["x-correlation-id"] ||
      req.headers["x-request-id"] ||
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.headers["user-agent"] || "unknown";
    const userId = req.user?.id || "Anonymous";

    logger.info(`Incoming request | ${method} ${originalUrl}`, {
      requestId: correlationId,
      userId: userId,
      ip: ip,
      userAgent: userAgent,
      component: "request-logger",
    });

    // Log response when finished
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? "warn" : "info";

      logger[level](
        `Request completed | ${method} ${originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`,
        {
          requestId: correlationId,
          userId: userId,
          statusCode: res.statusCode,
          responseTime: duration,
          component: "request-logger",
        }
      );
    });

    next();
  } catch (error: any) {
    logger.error("Error in logger middleware", {
      error: error.message,
      stack: error.stack,
      component: "request-logger",
    });
    next(error);
  }
}

export { logger, LoggerMiddleware };
