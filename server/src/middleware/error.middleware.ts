import { env } from "@/config/env.js";
import { ApiError } from "@/utils/api-error.js";
import { logger } from "@/utils/logger.js";
import type { ErrorRequestHandler } from "express";
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error(error instanceof Error ? error.message : "Unhandled error", {
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      data: error.data,
      message: error.message,
      errors: error.errors,
    });
  }

  return res.status(500).json({
    success: false,
    statusCode: 500,
    data: null,
    message: "Internal server error",
    errors:
      env.NODE_ENV === "development"
        ? [error instanceof Error ? error.message : String(error)]
        : [],
  });
};
