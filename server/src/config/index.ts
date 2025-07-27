//src/config/index.ts

/**
 * Helper to get and validate environment variables.
 * Throws an error if a required variable is missing.
 */
const getEnvVariable = (key: string, required: boolean = true): string => {
  const value = process.env[key];
  if (!value && required) {
    // Throw an error instead of logging and exiting.
    // This allows the global uncaughtException handler to catch and log it properly.
    throw new Error(
      `❌ Fatal Error: Missing required environment variable ${key}. Check your .env file or platform settings.`
    );
  }
  return value || "";
};

/**
 * Helper to get and validate environment variables as integers.
 * Throws an error for missing or invalid values.
 */
const getEnvVariableAsInt = (
  key: string,
  required: boolean = true,
  defaultValue?: number
): number => {
  const valueStr = process.env[key];

  if (!valueStr) {
    if (required && defaultValue === undefined) {
      throw new Error(
        `❌ Fatal Error: Missing required environment variable ${key}.`
      );
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    // This case should ideally not be hit if logic is correct
    return NaN;
  }

  const intValue = parseInt(valueStr, 10);

  if (isNaN(intValue)) {
    throw new Error(
      `❌ Fatal Error: Invalid integer format for environment variable ${key}. Value: "${valueStr}"`
    );
  }
  return intValue;
};

// Define the structure of your configuration
interface Config {
  nodeEnv: "development" | "production" | "test";
  port: number;
  databaseUrl: string;
  corsOrigin: string;
  jwt: {
    accessSecret: string;
    accessExpiresInSeconds: number;
    refreshSecret: string;
    refreshExpiresInDays: number;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  cookies: {
    refreshTokenName: string;
  };
  logLevel: string;
}

// Build the config object
// The try/catch block ensures that if config validation fails,
// it's logged before the process exits.
let config: Config;

try {
  config = {
    nodeEnv: getEnvVariable("NODE_ENV", true) as
      | "development"
      | "production"
      | "test",
    port: getEnvVariableAsInt("PORT", true),
    databaseUrl: getEnvVariable("DATABASE_URL", true),
    corsOrigin: getEnvVariable("CORS_ORIGIN", true),

    jwt: {
      accessSecret: getEnvVariable("ACCESS_TOKEN_SECRET", true),
      accessExpiresInSeconds: getEnvVariableAsInt(
        "ACCESS_TOKEN_EXPIRES_IN_SECONDS",
        true
      ),
      refreshSecret: getEnvVariable("REFRESH_TOKEN_SECRET", true),
      refreshExpiresInDays: getEnvVariableAsInt(
        "REFRESH_TOKEN_EXPIRES_IN_DAYS",
        true
      ),
    },

    cloudinary: {
      cloudName: getEnvVariable("CLOUDINARY_CLOUD_NAME", true),
      apiKey: getEnvVariable("CLOUDINARY_API_KEY", true),
      apiSecret: getEnvVariable("CLOUDINARY_API_SECRET", true),
    },

    cookies: {
      refreshTokenName: "jid", // Often good to keep constants like this here too
    },
    logLevel: getEnvVariable("LOG_LEVEL", false) || "info",
  };
} catch (error) {
  // At this early stage, the logger is not initialized.
  // A direct console.error is the most reliable way to show a fatal config error.
  console.error(
    "❌ Critical error during application configuration setup:",
    error
  );
  process.exit(1);
}

export { config };
