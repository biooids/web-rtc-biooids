// src/app/(app)/admin/users/page.tsx

import UserManagement from "@/components/pages/admin/users/UserManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin: User Management",
};

export default function AdminUsersPage() {
  return <UserManagement />;
}
