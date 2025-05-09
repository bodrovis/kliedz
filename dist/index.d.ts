declare const logThresholds: readonly ["debug", "info", "warn", "error", "silent"];
type LogThreshold = (typeof logThresholds)[number];

type LogLevel = Exclude<LogThreshold, "silent">;

type ConsoleMethod = "log" | "info" | "warn" | "error";

/**
 * Logs a plain message with a `[LEVEL]` prefix (no colors).
 *
 * Emits the message only if the `level` is equal to or more severe than `threshold`.
 * The message is formatted by joining all `args` with spaces.
 *
 * @param threshold - Minimum log level required to allow output
 * @param level - Severity level of this specific message
 * @param args - One or more values to print (same as `console.log`)
 */
declare function logWithLevel(threshold: LogThreshold, level: LogLevel, ...args: unknown[]): void;

/**
 * Logs a message with colorized `[LEVEL]` prefix using ANSI codes.
 *
 * Emits the message only if the `level` meets or exceeds the configured `threshold`.
 * Color is applied to the prefix and message body, then reset after the line.
 *
 * @param threshold - Minimum log level required to allow printing
 * @param level - Severity level of this message
 * @param args - Message content (anything `console.log` would accept)
 */
declare function logWithColor(threshold: LogLevel, level: LogLevel, ...args: unknown[]): void;

export { type ConsoleMethod, type LogLevel, type LogThreshold, logWithColor, logWithLevel };
