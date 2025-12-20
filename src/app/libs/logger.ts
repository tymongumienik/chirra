import "server-only";
import { sanitizeError } from "./errors";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    };

    // TODO: move logging from console to smth else
    switch (level) {
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(JSON.stringify(logData));
        }
        break;
      case "info":
        console.info(JSON.stringify(logData));
        break;
      case "warn":
        console.warn(JSON.stringify(logData));
        break;
      case "error":
        console.error(JSON.stringify(logData));
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    this.log("error", message, {
      ...context,
      error: error ? sanitizeError(error) : undefined,
    });
  }
}

export const logger = new Logger();
