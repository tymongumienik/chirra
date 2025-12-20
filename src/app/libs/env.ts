import "server-only";

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? defaultValue ?? "";
}

function getEnvVarOptional(
  key: string,
  defaultValue?: string,
): string | undefined {
  return process.env[key] || defaultValue;
}

function getEnvVarNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(
      `Environment variable ${key} must be a number, got: ${value}`,
    );
  }
  return parsed;
}

export const env = {
  // Database
  DATABASE_URL: getEnvVar("DATABASE_URL"),

  // Email
  EMAIL_HOST: getEnvVar("EMAIL_HOST"),
  EMAIL_PORT: getEnvVarNumber("EMAIL_PORT"),
  EMAIL_USER: getEnvVar("EMAIL_USER"),
  EMAIL_PASS: getEnvVar("EMAIL_PASS"),
  EMAIL_APP_URL: getEnvVar("EMAIL_APP_URL"),
  EMAIL_SECURE:
    getEnvVarOptional("EMAIL_SECURE") === "true" ||
    process.env.EMAIL_PORT === "465",

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: getEnvVarNumber("RATE_LIMIT_MAX_REQUESTS", 5),
  RATE_LIMIT_WINDOW_MS: getEnvVarNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",

  // Optional
  ALLOWED_ORIGINS: getEnvVarOptional("ALLOWED_ORIGINS"),
} as const;

try {
  env.DATABASE_URL;
  env.EMAIL_HOST;
  env.EMAIL_PORT;
  env.EMAIL_USER;
  env.EMAIL_PASS;
  env.EMAIL_APP_URL;
} catch (error) {
  console.error("Environment validation failed:", error);
  throw error;
}
