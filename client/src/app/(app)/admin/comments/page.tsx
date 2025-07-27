// src/app/(app)/admin/comments/page.tsx

import CommentManagement from "@/components/pages/admin/comments/CommentManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin: Comment Management",
};

export default function AdminCommentsPage() {
  return <CommentManagement />;
}
