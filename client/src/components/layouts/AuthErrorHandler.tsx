//src/components/layouts/AuthErrorHandler.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

/**
 * A client-side component that monitors the NextAuth session for critical errors
 * and logs the user out if one is detected. This should be placed in your root layout.
 */
function AuthErrorHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    // Check if the session exists and has our specific error flag from authOptions.ts
    if (session?.error === "RefreshAccessTokenError") {
      toast.error("Your session has expired. Please log in again.");
      // This is an unrecoverable error, so we sign the user out and redirect them.
      signOut({ callbackUrl: "/auth/login" });
    }
  }, [session]); // Rerun this check whenever the session object changes

  // This component doesn't render anything to the DOM.
  return null;
}

export default AuthErrorHandler;
