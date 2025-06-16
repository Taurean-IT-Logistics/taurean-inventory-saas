import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Request, Response, NextFunction } from "express";
import { CONFIG } from "../config";

const customFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

export const logger = createLogger({
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

export function LoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const correlationId =
      req.headers["x-correlation-id"] || `req-${Date.now()}`;

    logger.info("HTTP Request", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      correlationId,
    });
  });

  next();
}
