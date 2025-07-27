// FILE: src/lib/features/user/userTypes.ts

export enum SystemRole {
  USER = "USER",
  SYSTEM_CONTENT_CREATOR = "SYSTEM_CONTENT_CREATOR",
  DEVELOPER = "DEVELOPER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export type SanitizedUserDto = {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string | null;
  bannerImage: string | null;
  bio: string | null;
  title: string | null;
  location: string | null;
  joinedAt: string;
  updatedAt: string;
  systemRole: SystemRole;
  twitterUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
};

// This type now accurately reflects what the backend provides for a user profile.
export type UserProfile = SanitizedUserDto;

export type CurrentUser = SanitizedUserDto;

export interface UsersState {
  currentUser: CurrentUser | null;
}

// API Response Shapes
export interface GetMeApiResponse {
  status: string;
  data: { user: SanitizedUserDto };
}

export interface UpdateProfileApiResponse {
  status: string;
  message: string;
  data?: { user: SanitizedUserDto };
}

export interface DeleteAccountApiResponse {
  status: string;
  message: string;
}

export interface GetUserApiResponse {
  status: string;
  data: UserProfile;
}
