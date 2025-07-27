// src/middleware/authenticate.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import prisma from "../db/prisma.js";
import { config } from "../config/index.js";
import { asyncHandler } from "./asyncHandler.js";
import { createHttpError } from "../utils/error.factory.js";
import { DecodedAccessTokenPayload } from "../types/auth.types.js";

interface AuthOptions {
  required?: boolean;
}

/**
 * A flexible authentication middleware.
 * - If `required: true`, it will throw a 401 error for invalid/missing tokens.
 * - If `required: false` (or undefined), it will attach the user if found, or null, and continue.
 * @param options - Configuration for the middleware.
 */
export const authenticate = (options: AuthOptions = {}) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const { required = false } = options;
    let token: string | undefined;

    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Handle missing token
    if (!token) {
      if (required) {
        return next(
          createHttpError(401, "Authentication required. No token provided.")
        );
      }
      // If not required, just proceed without a user
      req.user = null;
      return next();
    }

    try {
      // 3. Verify token signature
      const decoded = jwt.verify(
        token,
        config.jwt.accessSecret
      ) as DecodedAccessTokenPayload;

      if (!decoded.id || decoded.type !== "access") {
        throw new JsonWebTokenError("Invalid token payload.");
      }

      // 4. Fetch fresh user data from the database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          profileImage: true,
          bannerImage: true,
          systemRole: true,
        },
      });

      // 5. Handle user not found in DB
      if (!user) {
        if (required) {
          return next(createHttpError(401, "User not found."));
        }
        req.user = null;
        return next();
      }

      // 6. Attach user to request and proceed
      req.user = user;
      next();
    } catch (error) {
      // For any JWT error (expired, invalid signature), treat as unauthorized
      if (required) {
        return next(
          createHttpError(401, "Invalid or expired token. Please log in again.")
        );
      }
      // If not required, just clear the user and proceed
      req.user = null;
      next();
    }
  });
