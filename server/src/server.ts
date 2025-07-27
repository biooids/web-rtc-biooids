//src/server.ts
import http from "http";
import app from "./app.js";
import { config } from "./config/index.js";
import { disconnectPrisma, connectPrisma } from "./db/prisma.js";
import { logger } from "./config/logger.js";
import { initSignalingServer } from "./features/webrtc/signaling.server.js";

const PORT = config.port;
const server = http.createServer(app);

let isShuttingDown = false;

/**
 * Starts the application server after establishing a database connection.
 */
async function startServer() {
  try {
    // connectPrisma will log its own success/error messages
    await connectPrisma();
    initSignalingServer(server);

    server.listen(PORT, () => {
      logger.info(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    // If the initial DB connection fails, it's a fatal error.
    logger.fatal(
      { err: error },
      "❌ Failed to connect to database during startup. Server not started."
    );
    process.exit(1);
  }
}

/**
 * Handles the graceful shutdown of the server and its resources.
 * @param signalSource The signal or event that triggered the shutdown.
 */
const performGracefulShutdown = async (signalSource: string) => {
  if (isShuttingDown) {
    logger.warn(
      `[Shutdown] Already in progress (triggered by ${signalSource})...`
    );
    return;
  }
  isShuttingDown = true;
  logger.info(`👋 Received ${signalSource}, shutting down gracefully...`);

  // Force exit after a timeout to prevent hanging.
  const shutdownTimeout = setTimeout(() => {
    logger.error("⚠️ Graceful shutdown timed out (10s), forcing exit.");
    process.exit(1);
  }, 10000);

  try {
    // 1. Close the HTTP server
    logger.info("🔌 Attempting to close HTTP server...");
    await new Promise<void>((resolve) => {
      server.close((err?: Error & { code?: string }) => {
        if (err) {
          if (err.code === "ERR_SERVER_NOT_RUNNING") {
            logger.warn("⚠️ HTTP server was already not running or closed.");
          } else {
            logger.error({ err }, "❌ Error closing HTTP server");
          }
        } else {
          logger.info("✅ HTTP server closed.");
        }
        resolve();
      });
    });

    // 2. Disconnect from the database (disconnectPrisma logs its own status)
    await disconnectPrisma();

    // 3. Clear the timeout and exit successfully
    clearTimeout(shutdownTimeout);
    logger.info("🚪 All services closed successfully. Exiting process...");
    process.exit(0);
  } catch (error: any) {
    clearTimeout(shutdownTimeout);
    logger.fatal({ err: error }, "❌ Error during graceful shutdown sequence");
    process.exit(1);
  }
};

/**
 * Handles critical, unrecoverable errors by initiating a graceful shutdown.
 * @param errorType A string describing the type of error (e.g., 'UNHANDLED REJECTION').
 * @param error The actual error object.
 */
const criticalErrorHandler = (errorType: string, error: Error | any) => {
  // Log the catastrophic error with the full error object
  logger.fatal(
    { err: error },
    `💥 ${errorType}! Attempting graceful shutdown...`
  );

  if (!isShuttingDown) {
    performGracefulShutdown(errorType).catch(() => {
      // This catch is a last resort if the shutdown itself fails.
      logger.fatal(
        "Force exiting after critical error and failed graceful shutdown."
      );
      process.exit(1);
    });

    // Another safety net to force exit if graceful shutdown hangs after a critical error.
    setTimeout(() => {
      logger.error(`Force exiting after ${errorType} (7s timeout).`);
      process.exit(1);
    }, 7000);
  } else {
    logger.warn(
      "Shutdown already initiated, but a critical error occurred during the process."
    );
  }
};

// --- Process Signal and Error Handling ---

// Listen for standard termination signals
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, () => performGracefulShutdown(signal));
});

// Listen for errors that were not caught anywhere else
process.on("unhandledRejection", (reason, _promise) => {
  criticalErrorHandler("UNHANDLED REJECTION", reason);
});

process.on("uncaughtException", (err) => {
  criticalErrorHandler("UNCAUGHT EXCEPTION", err);
});

// Finally, start the server
startServer();
