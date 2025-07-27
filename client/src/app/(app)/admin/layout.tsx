// src/app/(app)/admin/layout.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SystemRole } from "@/lib/features/user/userTypes";
import AdminSidebar from "@/components/pages/admin/layouts/AdminSidebar";
import { authOptions } from "@/lib/authOptions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch the user's session on the server.
  const session = await getServerSession(authOptions);

  // --- DEBUGGING LOGS ---
  // This will print to your server-side terminal (e.g., in VS Code or your deployment logs)
  console.log("--- ADMIN LAYOUT SECURITY CHECK ---");
  console.log("Full session object:", JSON.stringify(session, null, 2));
  if (session?.user) {
    console.log("User's systemRole from session:", session.user.systemRole);
  } else {
    console.log("No user found in session.");
  }
  // --- END DEBUGGING LOGS ---

  // 2. Check for permissions.
  const isAuthorized =
    session?.user?.systemRole && session.user.systemRole !== SystemRole.USER;

  console.log(`Is user authorized to view admin page? -> ${isAuthorized}`);

  if (!isAuthorized) {
    console.log("Redirecting user to homepage...");
    redirect("/"); // Redirect to the homepage if not authorized.
  }

  // 3. If the user is authorized, render the admin layout.
  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar userRole={session.user.systemRole as SystemRole} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
