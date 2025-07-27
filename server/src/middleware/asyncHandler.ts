// src/middleware/asyncHandler.ts
import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps an async Express request handler to catch errors and pass them to next().
 * @param fn - The async request handler function.
 * @returns A standard Express request handler.
 */
export const asyncHandler =
  (fn: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
