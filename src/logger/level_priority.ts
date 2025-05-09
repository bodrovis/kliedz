import type { LogLevel } from "../types/log_level.js";
import { type LogThreshold, logThresholds } from "../types/log_threshold.js";

/**
 * Assigns a numeric priority to each log threshold level.
 * Lower numbers mean more verbose; higher means more critical.
 * "silent" is given a very high value (999) to suppress all output.
 */
export const levelPriority: Record<LogThreshold, number> = Object.fromEntries(
	logThresholds.map((level, index) =>
		level === "silent" ? [level, 999] : [level, index],
	),
) as Record<LogThreshold, number>;

/**
 * Determines whether a message with the given `level` should be logged
 * based on the user-defined `threshold`.
 *
 * @param threshold - The minimum log level required to allow output
 * @param level - The log level of the current message
 * @returns `true` if the message should be printed, `false` otherwise
 */
export function shouldLog(threshold: LogThreshold, level: LogLevel): boolean {
	return levelPriority[level] >= levelPriority[threshold];
}
