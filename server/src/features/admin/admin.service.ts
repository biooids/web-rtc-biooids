// src/features/admin/admin.service.ts

import prisma from "@/db/prisma.js";
import { User, Prisma, SystemRole } from "@/prisma-client";
import {
  AdminDashboardStats,
  AdminUserRow,
  AdminApiQuery,
} from "./admin.types";

class AdminService {
  /**
   * Fetches key statistics for the admin dashboard.
   */
  public async getDashboardStats(): Promise<AdminDashboardStats> {
    const totalUsers = await prisma.user.count();
    return { totalUsers };
  }

  /**
   * Fetches a paginated, searchable, and filterable list of all users.
   */
  public async getAllUsers(
    query: AdminApiQuery
  ): Promise<{ users: AdminUserRow[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      q,
      sortBy = "joinedAt",
      order = "desc",
      filterByRole,
    } = query;
    const where: Prisma.UserWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    if (filterByRole) {
      where.systemRole = filterByRole;
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        // Add this 'include' clause to fetch the _count object, satisfying the type.
        include: {
          _count: {},
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { users: users as AdminUserRow[], total };
  }

  /**
   * Updates a user's system role.
   */
  public async updateUserRole(
    userId: string,
    newRole: SystemRole
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { systemRole: newRole },
    });
  }

  /**
   * Deletes a user by their ID.
   */
  public async deleteUser(userId: string): Promise<void> {
    // This will cascade and delete associated RefreshTokens and UserSettings
    await prisma.user.delete({ where: { id: userId } });
  }
}

export const adminService = new AdminService();
