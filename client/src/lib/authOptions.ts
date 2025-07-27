// src/lib/authOptions.ts

import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { jwtDecode } from "jwt-decode";
import { SystemRole, SanitizedUserDto } from "@/lib/features/user/userTypes";

// --- Internal Types for Clarity ---
type ApiUser = SanitizedUserDto;
interface BackendAuthResponse {
  data: {
    user: ApiUser;
    tokens: { accessToken: string; refreshToken: string };
  };
  message?: string;
}
interface RefreshedTokenResponse {
  data: { accessToken: string; refreshToken: string };
}

// --- Helper Functions ---

/**
 * Decodes a JWT to get its expiry timestamp.
 * @returns Expiry timestamp in milliseconds, or 0 if invalid.
 */
function getExpiryFromToken(token?: string): number {
  if (!token) return 0;
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    return decoded.exp ? decoded.exp * 1000 : 0;
  } catch {
    console.error("[NextAuth] ERROR: Failed to decode token.");
    return 0;
  }
}

/**
 * Processes the backend response to create a NextAuth user object.
 * This removes duplication between Credentials and OAuth providers.
 */
function processBackendResponse(
  backendData: BackendAuthResponse["data"]
): NextAuthUser {
  const { user, tokens } = backendData;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.profileImage,
    systemRole: user.systemRole,
    username: user.username,
    backendAccessToken: tokens.accessToken,
    backendRefreshToken: tokens.refreshToken,
    backendAccessTokenExpiresAt: getExpiryFromToken(tokens.accessToken),
  };
}

/**
 * Refreshes the access token using the refresh token.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh`,
      {
        method: "POST",
        // The cookie-based refresh is more secure
        headers: { Cookie: `jid=${token.backendRefreshToken}` },
      }
    );

    const refreshed: RefreshedTokenResponse = await response.json();
    if (!response.ok) throw refreshed;

    console.log("[NextAuth] INFO: Token refresh successful.");
    return {
      ...token,
      backendAccessToken: refreshed.data.accessToken,
      backendAccessTokenExpiresAt: getExpiryFromToken(
        refreshed.data.accessToken
      ),
      // Only update the refresh token if the backend sends a new one (for rotation)
      backendRefreshToken:
        refreshed.data.refreshToken ?? token.backendRefreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("[NextAuth] CATCH: Error during token refresh.", error);
    return {
      ...token,
      error: "RefreshAccessTokenError", // This will cause the session to be invalidated
    };
  }
}

// --- Main NextAuth Configuration ---

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        action: { label: "Action", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        name: { label: "Display Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const endpoint =
          credentials.action === "signup" ? "/auth/register" : "/auth/login";
        const payload =
          credentials.action === "signup"
            ? {
                email: credentials.email,
                password: credentials.password,
                username: credentials.username,
                name: credentials.name,
              }
            : { email: credentials.email, password: credentials.password };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${endpoint}`,
          {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
          }
        );

        const responseData: BackendAuthResponse = await res.json();

        if (!res.ok || !responseData.data) {
          throw new Error(responseData.message || "Authentication failed.");
        }

        // Use the refactored helper function
        return processBackendResponse(responseData.data);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // On initial sign-in
      if (user && account) {
        // For credentials, the `user` object from authorize is complete.
        if (account.provider === "credentials") {
          return { ...token, ...user };
        }

        // For OAuth providers, call our backend to get user/token info.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/oauth`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile!.email!,
              name: profile!.name,
            }),
          }
        );

        if (response.ok) {
          const resData: BackendAuthResponse = await response.json();
          // Use the refactored helper function
          const nextAuthUser = processBackendResponse(resData.data);
          return { ...token, ...nextAuthUser };
        }
        return { ...token, error: "OAuthUserProcessingError" };
      }

      // Return previous token if it has not expired yet
      if (Date.now() < token.backendAccessTokenExpiresAt) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Populate the session object from the JWT token
      session.user.id = token.id;
      session.user.systemRole = token.systemRole;
      session.user.username = token.username;
      session.backendAccessToken = token.backendAccessToken;
      session.error = token.error;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
