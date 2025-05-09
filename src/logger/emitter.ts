import type { ConsoleMethod } from "../types/console_method.js";
import type { LogLevel } from "../types/log_level.js";

/**
 * Maps each log level to the corresponding console method.
 * Used internally to dispatch messages to the correct output function.
 */
export const consoleMethods: Record<LogLevel, ConsoleMethod> = {
	debug: "log",
	info: "info",
	warn: "warn",
	error: "error",
};

/**
 * Emits a log message to the appropriate console method.
 * Assumes message is already formatted and ready to print.
 *
 * @param level - The log level of the message (e.g. "warn", "error")
 * @param message - The final string to output (includes prefix, colors, etc.)
 */
export function emitLog(level: LogLevel, message: string): void {
	const method = consoleMethods[level];
	console[method](message);
}
