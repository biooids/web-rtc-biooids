// src/config/index.ts

import { z } from "zod";

// Define the schema for environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string(),

  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().int().positive(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive(),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .default("info"),
});

// A single object to hold all configuration
export const config = (function () {
  try {
    const validatedEnv = envSchema.parse(process.env);
    return {
      nodeEnv: validatedEnv.NODE_ENV,
      port: validatedEnv.PORT,
      databaseUrl: validatedEnv.DATABASE_URL,
      corsOrigin: validatedEnv.CORS_ORIGIN,
      logLevel: validatedEnv.LOG_LEVEL,
      jwt: {
        accessSecret: validatedEnv.ACCESS_TOKEN_SECRET,
        accessExpiresInSeconds: validatedEnv.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        refreshSecret: validatedEnv.REFRESH_TOKEN_SECRET,
        refreshExpiresInDays: validatedEnv.REFRESH_TOKEN_EXPIRES_IN_DAYS,
      },
      cloudinary: {
        cloudName: validatedEnv.CLOUDINARY_CLOUD_NAME,
        apiKey: validatedEnv.CLOUDINARY_API_KEY,
        apiSecret: validatedEnv.CLOUDINARY_API_SECRET,
      },
      cookies: {
        refreshTokenName: "jid",
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "❌ Invalid environment variables:",
        error.flatten().fieldErrors
      );
    } else {
      console.error(
        "❌ An unexpected error occurred during configuration:",
        error
      );
    }
    process.exit(1);
  }
})();
