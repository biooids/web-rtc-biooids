// src/middleware/admin.middleware.ts
import { Request, Response, NextFunction } from "express";
import { SystemRole } from "@/prisma-client";
import { createHttpError } from "@/utils/error.factory";

/**
 * Creates an Express middleware that checks if the authenticated user has at least one of the specified roles.
 * Throws a 403 Forbidden error if the user is not authenticated or does not have the required role.
 *
 * @param requiredRoles An array of SystemRole enums that are permitted to access the route.
 * @returns An Express middleware function.
 */
export const requireRole = (requiredRoles: SystemRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Ensure there is a user object attached to the request (from verifyToken middleware)
    if (!req.user) {
      // This case should ideally be caught by `verifyToken` first, but it's a good safeguard.
      return next(createHttpError(401, "Authentication required."));
    }

    const userRole = req.user.systemRole;

    // Check if the user's role is included in the list of required roles.
    if (requiredRoles.includes(userRole)) {
      // User has the required role, proceed to the next middleware or route handler.
      return next();
    } else {
      // User does not have the required role, send a Forbidden error.
      return next(
        createHttpError(
          403,
          "Forbidden: You do not have permission to access this resource."
        )
      );
    }
  };
};
