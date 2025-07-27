// src/types/auth.types.ts

import { JwtPayload as OriginalJwtPayload } from "jsonwebtoken";
import { SystemRole } from "@/prisma-client";

// --- JWT Payloads ---

// This payload is now leaner, containing only essential, non-volatile info.
export interface DecodedAccessTokenPayload {
  id: string;
  systemRole: SystemRole;
  type: "access";
  iat: number;
  exp: number;
}

export interface DecodedRefreshTokenPayload extends OriginalJwtPayload {
  id: string;
  jti: string;
  type: "refresh";
}

// --- Service Input DTOs (Data Transfer Objects) ---

export interface SignUpInputDto {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface LoginInputDto {
  email: string;
  password: string;
}

export interface RefreshTokenInputDto {
  incomingRefreshToken: string;
}

export interface LogoutInputDto {
  userId?: string | undefined;
  incomingRefreshToken?: string | undefined;
}

export interface ChangePasswordInputDto {
  currentPassword: string;
  newPassword: string;
}

// --- Service Output DTOs ---

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}
