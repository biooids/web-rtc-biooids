// FILE: src/lib/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { SystemRole } from "../features/user/userTypes";

// Extend the default session to include your custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      systemRole: SystemRole | null;
      username: string | null;
    } & DefaultSession["user"];

    backendAccessToken?: string;
    error?: string;
  }

  interface User extends DefaultUser {
    systemRole: SystemRole;
    username: string;
    backendAccessToken: string;
    backendRefreshToken: string;
    backendAccessTokenExpiresAt: number;
  }
}

// Extend the default JWT to include your custom properties
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    systemRole: SystemRole;
    username: string;
    backendAccessToken: string;
    backendRefreshToken: string;
    backendAccessTokenExpiresAt: number;
    error?: string;
  }
}
