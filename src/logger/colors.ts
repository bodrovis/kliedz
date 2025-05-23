import type { LogLevel } from "../types/log_level.js";

export const RESET_COLOR = "\x1b[0m";

/**
 * Returns the ANSI color code for a given log level.
 * Throws if the level is unknown or not configured.
 *
 * @param level - The log level to get color for.
 * @returns ANSI escape code string for that level.
 */
export function getColorFor(level: LogLevel): string {
	if (!(level in LEVEL_COLORS)) {
		throw new Error(`Unknown log level: "${level}"`);
	}

	return LEVEL_COLORS[level];
}

/**
 * ANSI color codes mapped to log levels for terminal output.
 * These control how the log prefix is rendered in supported terminals.
 */
const LEVEL_COLORS: Record<LogLevel, string> = {
	debug: "\x1b[90m", // gray
	info: "\x1b[36m", // cyan
	warn: "\x1b[33m", // yellow/orange
	error: "\x1b[31m", // red
};
