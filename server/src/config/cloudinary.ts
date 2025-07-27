//src/config/cloudinary.ts

import {
  v2 as cloudinaryV2,
  UploadApiResponse,
  UploadApiOptions,
  DeleteApiResponse,
} from "cloudinary";
import fs from "fs/promises";
import { config } from "./index.js";
import { logger } from "./logger.js";

cloudinaryV2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

logger.info("✅ Cloudinary configured successfully.");

export const uploadToCloudinary = async (
  filePath: string,
  folder: string,
  publicId?: string
): Promise<UploadApiResponse> => {
  const uploadOptions: UploadApiOptions = {
    folder: folder,
    resource_type: "auto",
    // By setting a public_id and overwrite, we ensure users don't have multiple
    // old profile pictures stored, saving space.
    ...(publicId && { public_id: publicId, overwrite: true }),
  };

  try {
    const result = await cloudinaryV2.uploader.upload(filePath, uploadOptions);
    logger.info(
      { public_id: result.public_id },
      "File successfully uploaded to Cloudinary"
    );
    return result;
  } catch (error) {
    logger.error({ err: error }, "Cloudinary Upload Error");
    throw error;
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (unlinkErr) {
      logger.warn(
        { err: unlinkErr, filePath },
        "Failed to delete temporary local file"
      );
    }
  }
};

/**
 * --- ADDED: Deletes an asset from Cloudinary using its public_id. ---
 * @param publicId The unique public ID of the asset to delete.
 * @returns Promise<DeleteApiResponse>
 */
export const deleteFromCloudinary = async (
  publicId: string
): Promise<DeleteApiResponse> => {
  try {
    // We specify `resource_type: "image"` because we know we are deleting images.
    const result = await cloudinaryV2.uploader.destroy(publicId, {
      resource_type: "image",
    });
    logger.info(
      { publicId, result: result.result },
      "Asset successfully deleted from Cloudinary"
    );
    return result;
  } catch (error) {
    logger.error({ err: error, publicId }, "Cloudinary Deletion Error");
    throw error;
  }
};

export { cloudinaryV2 as cloudinary };
