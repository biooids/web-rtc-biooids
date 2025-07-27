// src/features/user/user.service.ts
import bcrypt from "bcryptjs";
import { Prisma, User } from "@/prisma-client";
import prisma from "../../db/prisma.js";
import { SignUpInputDto } from "../../types/auth.types.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";
import { deleteFromCloudinary } from "../../config/cloudinary";

interface UserProfileUpdateData {
  name?: string;
  username?: string;
  bio?: string;
  title?: string;
  location?: string;
  profileImage?: string;
  bannerImage?: string;
}

export class UserService {
  public async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
  public async findUserByUsername(username: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return null;

    return {
      ...user,
    };
  }

  public async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  public async createUser(input: SignUpInputDto): Promise<User> {
    const { email, username, password, name } = input;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          username,
          hashedPassword: hashedPassword, // Using correct schema field name
          name: name, // Using correct schema field name
        },
      });
      logger.info(
        { userId: user.id, email: user.email },
        "New user created successfully."
      );
      return user;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        const field = (e.meta?.target as string[])?.[0] || "details";
        logger.warn(
          { field, email, username },
          "Prisma unique constraint violation during user creation."
        );
        throw createHttpError(
          409,
          `An account with this ${field} already exists.`
        );
      }
      logger.error({ err: e }, "Unexpected error during user creation");
      throw createHttpError(500, "Could not create user account.");
    }
  }

  public async deleteUserAccount(userId: string): Promise<void> {
    logger.info({ userId }, "Initiating account deletion process.");

    // --- 2. ENHANCED LOGIC: Find user first to get asset URLs ---
    const user = await this.findUserById(userId);
    if (!user) {
      logger.warn({ userId }, "Account deletion skipped: User not found.");
      // No need to throw an error, the desired state (user gone) is already achieved.
      return;
    }

    // --- 3. DELETE CLOUDINARY ASSETS ---
    // We create an array of deletion promises to run them in parallel.
    const deletionPromises: Promise<any>[] = [];

    if (user.profileImage) {
      // The public_id is the unique part of the URL, which we constructed.
      const publicId = `user_assets/profile_${userId}`;
      deletionPromises.push(deleteFromCloudinary(publicId));
    }
    if (user.bannerImage) {
      const publicId = `user_assets/banner_${userId}`;
      deletionPromises.push(deleteFromCloudinary(publicId));
    }

    // Run all deletion tasks. We use Promise.allSettled to ensure that even
    // if one asset deletion fails, we still proceed to delete the user record.
    if (deletionPromises.length > 0) {
      logger.info(
        { userId },
        `Deleting ${deletionPromises.length} assets from Cloudinary.`
      );
      await Promise.allSettled(deletionPromises);
    }

    // --- 4. DELETE USER FROM DATABASE ---
    try {
      await prisma.user.delete({ where: { id: userId } });
      logger.info({ userId }, "User record and assets deleted successfully.");
    } catch (error) {
      // This catch is a fallback, but the initial check should prevent P2025.
      logger.error(
        { err: error, userId },
        "Error deleting user record from database"
      );
      throw createHttpError(500, "Could not delete user account at this time.");
    }
  }

  public async updateUserProfile(
    userId: string,
    data: UserProfileUpdateData
  ): Promise<User> {
    // --- FIX: First, check if the user actually exists ---
    const existingUser = await this.findUserById(userId);
    if (!existingUser) {
      throw createHttpError(404, "User profile not found.");
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: data, // Prisma handles ignoring undefined fields
      });
      logger.info({ userId }, "User profile updated successfully.");
      return user;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        logger.warn(
          { userId, username: data.username },
          "Username conflict during profile update."
        );
        throw createHttpError(409, "This username is already taken.");
      }
      logger.error({ err: e, userId }, "Error updating user profile");
      throw createHttpError(500, "Could not update user profile.");
    }
  }
}

export const userService = new UserService();
