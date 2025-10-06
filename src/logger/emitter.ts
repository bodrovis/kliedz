import type { ConsoleMethod } from "../types/console_method.js";
import type { LogLevel } from "../types/log_level.js";

/**
 * Maps each log level to the corresponding console method.
 * Used internally to dispatch messages to the correct output function.
 */
const CONSOLE_METHODS = Object.freeze({
	debug: "log",
	info: "info",
	warn: "warn",
	error: "error",
} as const satisfies Record<LogLevel, ConsoleMethod>);

/**
 * Returns console method to use for a given log level.
 * Throws if the level is unknown or not configured.
 *
 * @param level - The log level to get method for.
 * @returns ConsoleMethod
 */
function getMethodFor(level: LogLevel): ConsoleMethod {
	const m = CONSOLE_METHODS[level];
	if (!m) throw new Error(`Unknown method for level: "${level}"`);
	return m;
}

/**
 * Emits a log message to the appropriate console method.
 * Assumes message is already formatted and ready to print.
 *
 * @param level - The log level of the message (e.g. "warn", "error")
 * @param message - The final string to output (includes prefix, colors, etc.)
 */
export function emitLog(level: LogLevel, message: string): void {
	const method = getMethodFor(level);
	const fn = console[method] as (msg?: unknown, ...rest: unknown[]) => void;
	fn(message);
}
