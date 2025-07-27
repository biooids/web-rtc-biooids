// src/utils/jwt.utils.ts

import jwt, {
  SignOptions,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import crypto from "crypto";
import { SystemRole, User } from "@/prisma-client";
import { config } from "../config/index.js";
import prisma from "../db/prisma.js";
import {
  DecodedAccessTokenPayload,
  DecodedRefreshTokenPayload,
} from "../types/auth.types.js";
import { createHttpError } from "./error.factory.js";
import { HttpError } from "./HttpError.js";
import { logger } from "../config/logger.js";

/**
 * Generates a lean Access JWT token for a user.
 */
export const generateAccessToken = (user: {
  id: string;
  systemRole: SystemRole;
}): string => {
  // **IMPROVED**: Payload is now leaner, containing only essential, non-volatile info.
  const payload: Omit<DecodedAccessTokenPayload, "iat" | "exp"> = {
    id: user.id,
    systemRole: user.systemRole,
    type: "access",
  };

  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresInSeconds,
  };

  const token = jwt.sign(payload, config.jwt.accessSecret, options);
  logger.info({ userId: user.id }, "[JWT Utils] Generated Access Token");
  return token;
};

/**
 * Generates a Refresh JWT token, stores its JTI in the DB, and returns the token details.
 */
export const generateAndStoreRefreshToken = async (
  userId: string
): Promise<{ token: string; expiresAt: Date }> => {
  const jti = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

  const payload = { id: userId, type: "refresh" as const };

  try {
    await prisma.refreshToken.create({
      data: { jti, userId, expiresAt },
    });
    logger.info({ jti, userId }, "[JWT Utils] Refresh token JTI stored in DB");
  } catch (dbError) {
    logger.error(
      { err: dbError },
      "[JWT Utils] Failed to store refresh token in DB"
    );
    throw createHttpError(500, "Could not save session information.");
  }

  const token = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: `${config.jwt.refreshExpiresInDays}d`,
    jwtid: jti,
  });

  return { token, expiresAt };
};

/**
 * Verifies a refresh token's signature and validity against the database store.
 */
export const verifyAndValidateRefreshToken = async (
  token: string
): Promise<DecodedRefreshTokenPayload> => {
  try {
    const decoded = jwt.verify(
      token,
      config.jwt.refreshSecret
    ) as DecodedRefreshTokenPayload;

    if (!decoded.jti || !decoded.id || decoded.type !== "refresh") {
      throw createHttpError(401, "Invalid refresh token payload structure.");
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { jti: decoded.jti },
    });

    if (!storedToken) {
      throw createHttpError(403, "Session not found. Please log in again.");
    }
    if (storedToken.revoked) {
      throw createHttpError(
        403,
        "Session has been revoked. Please log in again."
      );
    }
    if (new Date() > storedToken.expiresAt) {
      throw createHttpError(403, "Session has expired. Please log in again.");
    }
    if (storedToken.userId !== decoded.id) {
      await prisma.refreshToken.update({
        where: { jti: decoded.jti },
        data: { revoked: true },
      });
      logger.fatal(
        {
          jti: decoded.jti,
          expectedUserId: storedToken.userId,
          actualUserId: decoded.id,
        },
        "CRITICAL: Refresh token user mismatch. Token voided."
      );
      throw createHttpError(403, "Session invalid; token has been voided.");
    }

    logger.info(
      { jti: decoded.jti },
      "[JWT Utils] Refresh token successfully validated."
    );
    return decoded;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (
      error instanceof TokenExpiredError ||
      error instanceof JsonWebTokenError
    ) {
      logger.warn(
        { err: error },
        "[JWT Utils] Session token is invalid or expired"
      );
      throw createHttpError(
        403,
        "Your session is invalid or expired. Please log in again."
      );
    }
    logger.error(
      { err: error },
      "[JWT Utils] Unexpected error during refresh token verification"
    );
    throw createHttpError(
      500,
      "Could not verify session due to a server issue."
    );
  }
};
