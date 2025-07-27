// src/db/prisma.ts

import { PrismaClient, Prisma } from "@/prisma-client";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

// Make SystemRole available as an export if needed elsewhere
export { SystemRole } from "@/prisma-client";

// 1. Create the base Prisma Client instance
// The 'log' property here will still print to console in development,
// which can be useful for quick debugging alongside our structured logs.
const prismaClient = new PrismaClient({
  log:
    config.nodeEnv === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// --- Constants for Retry Logic ---
const MAX_QUERY_RETRIES = 3;
const QUERY_RETRY_BASE_DELAY_MS = 1000;
const RETRIABLE_PRISMA_ERROR_CODES: string[] = [
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1008",
  "P1017",
  "P2024",
  "P3006",
];

// 2. Create an "extended" client that includes our query retry logic
const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      $allOperations: async ({ model, operation, args, query }) => {
        let attempts = 0;
        while (attempts <= MAX_QUERY_RETRIES) {
          try {
            return await query(args);
          } catch (error: any) {
            attempts++;
            let errorCode: string | undefined;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              errorCode = error.code;
              if (
                !RETRIABLE_PRISMA_ERROR_CODES.includes(error.code) ||
                attempts > MAX_QUERY_RETRIES
              ) {
                throw error;
              }
            } else {
              throw error;
            }

            const delayMs =
              QUERY_RETRY_BASE_DELAY_MS * Math.pow(2, attempts - 1);

            // Replaced console.warn with a structured log
            logger.warn(
              {
                err: error,
                model,
                operation,
                attempt: attempts,
                maxRetries: MAX_QUERY_RETRIES,
                code: errorCode,
              },
              `Prisma query failed. Retrying in ${delayMs / 1000}s...`
            );

            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
        // This should not be reached but satisfies TypeScript.
        throw new Error(
          `Query (${model}.${operation}) failed after ${MAX_QUERY_RETRIES} retries.`
        );
      },
    },
  },
});

// --- Connection Logic ---
const MAX_CONNECT_RETRIES = 5;
const CONNECT_RETRY_DELAY_MS = 5000;

export async function connectPrisma(
  retriesLeft: number = MAX_CONNECT_RETRIES
): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("✅ Successfully connected to the database via Prisma.");
  } catch (error: any) {
    const currentAttempt = MAX_CONNECT_RETRIES - retriesLeft + 1;

    // Replaced console.error with a structured log
    logger.error(
      { err: error, attempt: currentAttempt, maxRetries: MAX_CONNECT_RETRIES },
      `❌ Prisma Connection Error`
    );

    if (retriesLeft > 0) {
      logger.info(
        `Retrying connection in ${CONNECT_RETRY_DELAY_MS / 1000} seconds...`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, CONNECT_RETRY_DELAY_MS)
      );
      return connectPrisma(retriesLeft - 1);
    } else {
      // Replaced console.error with a fatal log, as this will exit the process.
      logger.fatal(
        "❌ Exhausted all retries. Failed to connect to the database. Exiting."
      );
      process.exit(1);
    }
  }
}

// 3. Export the extended client as the default export
export default prisma;

/**
 * Disconnects the Prisma client from the database.
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info("🔌 Prisma disconnected successfully.");
  } catch (error) {
    logger.error({ err: error }, "❌ Error during Prisma disconnect");
  }
}
