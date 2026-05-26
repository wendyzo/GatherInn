type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = {
  route?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
};

function buildEntry(level: LogLevel, message: string, context?: LogContext) {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: typeof window === "undefined" ? "server" : "browser",
    ...context,
  };
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (import.meta.env.PROD) return;
    console.debug(JSON.stringify(buildEntry("debug", message, context)));
  },

  info(message: string, context?: LogContext) {
    console.info(JSON.stringify(buildEntry("info", message, context)));
  },

  warn(message: string, context?: LogContext) {
    console.warn(JSON.stringify(buildEntry("warn", message, context)));
  },

  error(message: string, error?: unknown, context?: LogContext) {
    const entry = buildEntry("error", message, context);
    const err = error instanceof Error ? error : undefined;
    console.error(
      JSON.stringify({
        ...entry,
        error: {
          name: err?.name,
          message: err?.message ?? String(error ?? ""),
          stack: err?.stack,
        },
      }),
    );
  },
};
