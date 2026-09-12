import { env } from "@/config/env.js";
import winston from "winston";

const { combine, timestamp, errors, colorize, printf, splat } = winston.format;

const developmentConsoleFormat = printf(
  ({ level, message, timestamp, stack }) => {
    const logMessage = stack ? stack : message;
    return `[${timestamp}] ${level}: ${logMessage}\n`;
  },
);

const logFormat =
  env.NODE_ENV === "production"
    ? combine(errors({ stack: true }), timestamp(), winston.format.json())
    : combine(
        errors({ stack: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        splat(),
        colorize({ all: true }),
        developmentConsoleFormat,
      );

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});
