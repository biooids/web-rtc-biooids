// src/components/pages/admin/layouts/AdminSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SystemRole } from "@/lib/features/user/userTypes";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Briefcase,
  Book,
  ShieldCheck,
} from "lucide-react";

const navLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    requiredRole: [SystemRole.SUPER_ADMIN, SystemRole.SYSTEM_CONTENT_CREATOR],
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    requiredRole: [SystemRole.SUPER_ADMIN],
  },
  {
    href: "/admin/posts",
    label: "Posts",
    icon: FileText,
    requiredRole: [SystemRole.SUPER_ADMIN],
  },
  {
    href: "/admin/comments",
    label: "Comments",
    icon: MessageSquare,
    requiredRole: [SystemRole.SUPER_ADMIN],
  },
  {
    href: "/admin/content/opportunities",
    label: "Opportunities",
    icon: Briefcase,
    requiredRole: [SystemRole.SYSTEM_CONTENT_CREATOR, SystemRole.SUPER_ADMIN],
  },
  {
    href: "/admin/content/updates",
    label: "Updates",
    icon: Book,
    requiredRole: [SystemRole.SYSTEM_CONTENT_CREATOR, SystemRole.SUPER_ADMIN],
  },
];

interface AdminSidebarProps {
  userRole: SystemRole;
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background lg:flex sticky top-0 h-screen">
      <div className="flex h-16 shrink-0 items-center justify-center border-b px-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navLinks.map((link) => {
          if (!link.requiredRole.includes(userRole)) {
            return null;
          }

          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
                isActive && "bg-accent font-semibold text-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
