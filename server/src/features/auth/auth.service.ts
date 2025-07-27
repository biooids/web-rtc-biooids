// src/features/auth/auth.service.ts

import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../../db/prisma.js";
import { User } from "@/prisma-client";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";
import {
  generateAccessToken,
  generateAndStoreRefreshToken,
  verifyAndValidateRefreshToken,
} from "../../utils/jwt.utils.js";
import {
  SignUpInputDto,
  LoginInputDto,
  RefreshTokenInputDto,
  AuthTokens,
  LogoutInputDto,
  ChangePasswordInputDto,
} from "../../types/auth.types.js";
import { userService } from "../user/user.service.js";

// Helper to remove password hash before returning user object
const sanitizeUser = (user: User): Omit<User, "hashedPassword"> => {
  const { hashedPassword, ...sanitized } = user;
  return sanitized;
};

export class AuthService {
  public async registerUser(input: SignUpInputDto): Promise<{
    user: Omit<User, "hashedPassword">;
    tokens: AuthTokens;
  }> {
    const { email, username } = input;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw createHttpError(
          409,
          "An account with this email already exists."
        );
      }
      if (existingUser.username === username) {
        throw createHttpError(409, "This username is already taken.");
      }
    }

    const user = await userService.createUser(input);
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt } =
      await generateAndStoreRefreshToken(user.id);

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt },
    };
  }

  public async loginUser(input: LoginInputDto): Promise<{
    user: Omit<User, "hashedPassword">;
    tokens: AuthTokens;
  }> {
    const { email, password } = input;
    const user = await userService.findUserByEmail(email);

    if (!user) {
      throw createHttpError(404, "No account found with this email address.");
    }
    if (!user.hashedPassword) {
      throw createHttpError(
        400,
        "This account was created using a social provider. Please log in with Google or GitHub."
      );
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.hashedPassword
    );
    if (!isPasswordCorrect) {
      throw createHttpError(401, "The password you entered is incorrect.");
    }

    logger.info(
      { userId: user.id },
      "User login successful, revoking old sessions."
    );
    await this.revokeAllRefreshTokensForUser(user.id);

    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt } =
      await generateAndStoreRefreshToken(user.id);

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt },
    };
  }

  public async changeUserPassword(
    userId: string,
    input: ChangePasswordInputDto
  ): Promise<void> {
    const { currentPassword, newPassword } = input;
    const user = await userService.findUserById(userId);

    if (!user || !user.hashedPassword) {
      throw createHttpError(401, "User not found or has no password set.");
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );
    if (!isPasswordCorrect) {
      throw createHttpError(
        401,
        "The current password you entered is incorrect."
      );
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword: newHashedPassword },
    });

    logger.info(
      { userId },
      "User password changed successfully. Revoking all sessions."
    );
    await this.revokeAllRefreshTokensForUser(userId);
  }

  public async handleRefreshTokenRotation(
    input: RefreshTokenInputDto
  ): Promise<{
    newAccessToken: string;
    newRefreshToken: string;
    newRefreshTokenExpiresAt: Date;
  }> {
    if (!input.incomingRefreshToken) {
      throw createHttpError(401, "Refresh token is required.");
    }
    const decodedOldToken = await verifyAndValidateRefreshToken(
      input.incomingRefreshToken
    );
    const user = await userService.findUserById(decodedOldToken.id);

    if (!user) {
      await this.revokeTokenByJti(decodedOldToken.jti);
      throw createHttpError(403, "Forbidden: User account not found.");
    }

    await this.revokeTokenByJti(decodedOldToken.jti);
    const newAccessToken = generateAccessToken(user);
    const { token: newRefreshToken, expiresAt: newRefreshTokenExpiresAt } =
      await generateAndStoreRefreshToken(user.id);

    return { newAccessToken, newRefreshToken, newRefreshTokenExpiresAt };
  }

  public async handleUserLogout(input: LogoutInputDto): Promise<void> {
    if (!input.incomingRefreshToken) {
      logger.warn("Logout attempt without a refresh token.");
      return;
    }
    try {
      const decoded = await verifyAndValidateRefreshToken(
        input.incomingRefreshToken
      );
      await this.revokeTokenByJti(decoded.jti);
      logger.info(
        { userId: decoded.id, jti: decoded.jti },
        "User logged out, token revoked."
      );
    } catch (error) {
      logger.warn(
        { err: error },
        "Logout failed: could not verify or revoke token."
      );
    }
  }

  public async findOrCreateOAuthUser(profile: {
    email: string;
    name?: string | null;
    image?: string | null;
  }): Promise<{ user: Omit<User, "hashedPassword">; tokens: AuthTokens }> {
    let user = await userService.findUserByEmail(profile.email);
    if (user) {
      logger.info(
        { email: profile.email },
        "Found existing user for OAuth login."
      );
      user = await prisma.user.update({
        where: { email: profile.email },
        data: {
          name: user.name ?? profile.name ?? "New User",
          profileImage: user.profileImage ?? profile.image ?? null,
        },
      });
    } else {
      logger.info(
        { email: profile.email },
        "Creating new user from OAuth profile."
      );
      // **IMPROVED**: Generate a more unique username to avoid collisions.
      const baseUsername = profile.email
        .split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, "");
      const uniqueSuffix = crypto.randomBytes(4).toString("hex");
      const username = `${baseUsername}_${uniqueSuffix}`;

      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name ?? "New User",
          username: username,
          ...(profile.image && { profileImage: profile.image }),
        },
      });
    }

    await this.revokeAllRefreshTokensForUser(user.id);
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt } =
      await generateAndStoreRefreshToken(user.id);

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt },
    };
  }

  private async revokeTokenByJti(jti: string): Promise<void> {
    await prisma.refreshToken
      .update({
        where: { jti },
        data: { revoked: true },
      })
      .catch((err) =>
        logger.warn(
          { err, jti },
          "Failed to revoke single token, it might already be gone."
        )
      );
  }

  public async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    const { count } = await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    logger.info({ count, userId }, `Revoked all active sessions.`);
  }
}

export const authService = new AuthService();
