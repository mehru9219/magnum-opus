import { Logger } from "next-axiom";

/**
 * Create Axiom logger instance
 * Use this for structured logging throughout the application
 */
export const logger = new Logger();

/**
 * Log info message
 */
export function logInfo(message: string, metadata?: Record<string, unknown>) {
  logger.info(message, metadata);
}

/**
 * Log error
 */
export function logError(message: string, error?: Error, metadata?: Record<string, unknown>) {
  logger.error(message, {
    ...metadata,
    error: error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : undefined,
  });
}

/**
 * Log warning
 */
export function logWarn(message: string, metadata?: Record<string, unknown>) {
  logger.warn(message, metadata);
}

/**
 * Log debug (only in development)
 */
export function logDebug(message: string, metadata?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    logger.debug(message, metadata);
  }
}
