// src/features/user/user.controller.ts

import { Request, Response } from "express";
import { SystemRole, User } from "@/prisma-client";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createHttpError } from "../../utils/error.factory.js";
import { userService } from "./user.service.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";
import { logger } from "../../config/logger.js";
import { config } from "../../config/index.js";

// This helper is used for responses where the full user object is fetched from the DB,
// like when getting another user's profile.
const sanitizeUserForResponse = (user: User): Omit<User, "hashedPassword"> => {
  const { hashedPassword, ...sanitizedUser } = user;
  return sanitizedUser;
};

class UserController {
  getMe = asyncHandler(async (req: Request, res: Response) => {
    // **OPTIMIZED**: We directly use the `req.user` object.
    // The `authenticate` middleware has already fetched this fresh, sanitized user data.
    const user = req.user;

    if (!user) {
      // This is a safeguard; `authenticate({ required: true })` should prevent this.
      throw createHttpError(401, "Authenticated user not found.");
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  });

  getUserByUsername = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const currentUserId = req.user?.id; // The user making the request (or null if guest)

    const user = await userService.findUserByUsername(username, currentUserId);

    if (!user) {
      throw createHttpError(404, `User profile for @${username} not found.`);
    }

    // The user object from this service is a custom shape and doesn't need sanitizing.
    res.status(200).json({
      status: "success",
      data: user,
    });
  });

  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const updateData = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.profileImage?.[0]) {
      logger.info({ userId }, "New profile image received. Uploading...");
      const result = await uploadToCloudinary(
        files.profileImage[0].path,
        "user_assets",
        `profile_${userId}`
      );
      updateData.profileImage = result.secure_url;
    }

    if (files?.bannerImage?.[0]) {
      logger.info({ userId }, "New banner image received. Uploading...");
      const result = await uploadToCloudinary(
        files.bannerImage[0].path,
        "user_assets",
        `banner_${userId}`
      );
      updateData.bannerImage = result.secure_url;
    }

    if (Object.keys(updateData).length === 0 && !req.files) {
      throw createHttpError(400, "No update data provided.");
    }

    const updatedUser = await userService.updateUserProfile(userId, updateData);

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully.",
      data: { user: sanitizeUserForResponse(updatedUser) },
    });
  });

  deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await userService.deleteUserAccount(userId);

    res.clearCookie(config.cookies.refreshTokenName);
    res.status(204).send();
  });

  // --- Admin-level or specific ID lookups ---

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id: targetUserId } = req.params;
    const user = await userService.findUserById(targetUserId);

    if (!user) {
      throw createHttpError(404, `User with ID ${targetUserId} not found.`);
    }

    res.status(200).json({
      status: "success",
      data: { user: sanitizeUserForResponse(user) },
    });
  });

  deleteUserById = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.systemRole !== SystemRole.SUPER_ADMIN) {
      throw createHttpError(
        403,
        "Forbidden: You do not have permission for this action."
      );
    }

    const { id: targetUserId } = req.params;
    if (req.user.id === targetUserId) {
      throw createHttpError(
        400,
        "Cannot delete your own account via this admin route."
      );
    }

    await userService.deleteUserAccount(targetUserId);
    res.status(204).send();
  });
}

export const userController = new UserController();
