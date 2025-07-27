//src/components/layouts/AuthInitializer.tsx
"use client";

import { useSession } from "next-auth/react";
import { useGetMeQuery } from "@/lib/features/user/userApiSlice";
import { Loader2 } from "lucide-react";

/**
 * This component handles the initial authentication state of the application.
 * It ensures that the user's profile data is fetched and loaded into the Redux store
 * as soon as a valid session is detected.
 */
export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Conditionally call the getMe query ONLY when there is an active session.
  const { isLoading } = useGetMeQuery(undefined, {
    skip: status !== "authenticated",
  });

  // While next-auth is checking the session or we are fetching the user,
  // show a global loading indicator.
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Once the session check is complete and any necessary user fetching is done,
  // render the rest of the application.
  return <>{children}</>;
}
