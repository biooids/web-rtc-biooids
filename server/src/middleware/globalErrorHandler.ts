//src/middleware/globalErrorHandler.ts

import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Prisma } from "@/prisma-client";
import { config } from "../config/index.js";
import { HttpError } from "../utils/HttpError.js";
import { logger } from "../config/logger.js";
import { MulterError } from "multer";

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "An internal server error occurred.";
  let status = "error";

  logger.error({ err }, "💥 Global Error Handler Caught");

  // --- Specific Error Type Handling ---

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // ... Prisma error handling is unchanged ...
    switch (err.code) {
      case "P2002":
        const fields = (err.meta as { target?: string[] })?.target?.join(", ");
        statusCode = 409; // Conflict
        message = `A record with this ${fields || "value"} already exists.`;
        status = "fail";
        break;
      case "P2025":
        statusCode = 404; // Not Found
        message = `The requested resource was not found.`;
        status = "fail";
        break;
      default:
        message = "A database error occurred.";
        break;
    }

    // === NEW: Add a specific block to handle Multer (file upload) errors ===
  } else if (err instanceof MulterError) {
    statusCode = 400; // Bad Request
    status = "fail";
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File is too large. The maximum allowed size is 5MB.";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files uploaded. Please check the limit.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = `An unexpected file was uploaded for the '${err.field}' field.`;
        break;
      default:
        message = "A file upload error occurred.";
        break;
    }
    // ======================================================================
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Unauthorized: Your session has expired. Please log in again.";
    status = "fail";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Unauthorized: Invalid session token.";
    status = "fail";
  }

  // --- Final JSON Response (unchanged) ---
  const responsePayload: { status: string; message: string; stack?: string } = {
    status,
    message,
  };

  if (config.nodeEnv === "development" && err instanceof Error && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};
