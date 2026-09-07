import { env } from "@/config/env.js";
import winston from "winston";

const { combine, timestamp, errors, json, colorize } = winston.format;

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(errors({ stack: true }), timestamp(), json(), colorize()),
  transports: [new winston.transports.Console()],
});
