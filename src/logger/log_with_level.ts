import type { LogLevel } from "../types/log_level.js";
import type { LogThreshold } from "../types/log_threshold.js";
import { emitLog } from "./emitter.js";
import { shouldLog } from "./level_priority.js";

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
export function logWithLevel(
	threshold: LogThreshold,
	level: LogLevel,
	...args: unknown[]
): void {
	if (!shouldLog(threshold, level)) return;

	const prefix = `[${level.toUpperCase()}]`;
	const msg = [prefix, ...args].map(String).join(" ");
	emitLog(level, msg);
}
