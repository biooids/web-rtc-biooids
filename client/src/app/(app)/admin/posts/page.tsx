// src/app/(app)/admin/posts/page.tsx

import PostManagement from "@/components/pages/admin/posts/PostsManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin: Post Management",
};

export default function AdminPostsPage() {
  return <PostManagement />;
}
