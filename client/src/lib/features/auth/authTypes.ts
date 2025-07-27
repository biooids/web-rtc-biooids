// =================================================================
// FILE: src/lib/features/auth/authTypes.ts
// =================================================================
import { SanitizedUserDto } from "../user/userTypes";

// --- DTOs for API requests ---
export interface LoginInputDto {
  email?: string;
  password?: string;
}

export interface SignUpInputDto extends LoginInputDto {
  username?: string;
  name?: string;
}

export interface ChangePasswordInputDto {
  currentPassword?: string;
  newPassword?: string;
}

// --- API Response Shapes ---
export interface LoginApiResponse {
  status: string;
  message: string;
  data: {
    user: SanitizedUserDto;
    tokens: {
      accessToken: string;
      refreshToken: string;
      refreshTokenExpiresAt: string;
    };
  };
}
