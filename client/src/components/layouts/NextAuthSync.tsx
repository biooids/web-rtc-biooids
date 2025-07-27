// src/components/auth/NextAuthSync.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/lib/hooks/hooks";
// 1. Import actions from our NEW, UNIFIED authSlice
import {
  setCredentials,
  clearCredentials,
} from "@/lib/features/auth/authSlice";

export function NextAuthSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This effect runs whenever the user's session status changes
    if (status === "authenticated") {
      console.log(
        "[NextAuthSync] Session is AUTHENTICATED. Syncing token to Redux store."
      );
      // 2. Dispatch the token to our 'auth' slice
      dispatch(setCredentials({ token: session.backendAccessToken ?? null }));
    } else if (status === "unauthenticated") {
      console.log(
        "[NextAuthSync] Session is UNAUTHENTICATED. Clearing token from Redux."
      );
      // 3. Clear the token on logout
      dispatch(clearCredentials());
    }
  }, [session, status, dispatch]);

  return null; // This component renders nothing
}
