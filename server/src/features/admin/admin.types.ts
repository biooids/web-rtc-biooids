// src/features/admin/admin.types.ts

import { User, SystemRole } from "@/prisma-client";

// Data shape for the main dashboard statistics card
export interface AdminDashboardStats {
  totalUsers: number;
}

// Data shape for a user row in the admin user management table
export type AdminUserRow = Omit<User, "hashedPassword"> & {
  _count: {
    // We are removing post/comment counts as they don't exist in the schema.
    // This can be extended later if you add those models.
  };
};

// Type for the API query parameters for user filtering
export interface AdminApiQuery {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: "name" | "username" | "email" | "joinedAt";
  order?: "asc" | "desc";
  filterByRole?: SystemRole;
}
