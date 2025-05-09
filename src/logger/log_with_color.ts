import type { LogLevel } from "../types/log_level.js";
import { emitLog } from "./emitter.js";
import { shouldLog } from "./level_priority.js";

const RESET = "\x1b[0m";

/**
 * ANSI color codes mapped to log levels for terminal output.
 * These control how the log prefix is rendered in supported terminals.
 */
const levelColor: Record<LogLevel, string> = {
	debug: "\x1b[90m", // gray
	info: "\x1b[36m", // cyan
	warn: "\x1b[33m", // yellow/orange
	error: "\x1b[31m", // red
};

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
export function logWithColor(
	threshold: LogLevel,
	level: LogLevel,
	...args: unknown[]
): void {
	if (!shouldLog(threshold, level)) return;

	const color = levelColor[level];
	const prefix = `[${level.toUpperCase()}]`;
	const body = args.map(String).join(" ");
	const colored = `${color}${prefix} ${body}${RESET}`;
	emitLog(level, colored);
}
