import type { Formatter, FormatterConfig } from "../types/formatter.js";
import { getColorFor, RESET_COLOR } from "./colors.js";

/**
 * Formats a log message with no colors.
 * Adds a prefix (with optional timestamp), followed by the joined message body.
 *
 * Example output:
 * `[INFO] message here`
 * or
 * `2025-05-10T12:34:56.789Z [INFO] message here`
 */
export const plainFormatter: Formatter = (config) => {
	const prefix = getPrefix(config);
	const body = config.args.map(formatArg).join(" ");

	return `${prefix} ${body}`;
};

/**
 * Formats a log message with ANSI colors based on log level.
 * Adds a prefix (with optional timestamp), wraps it in color codes.
 *
 * Example output:
 * `\x1b[33m[WARN] something happened\x1b[0m`
 */
export const colorFormatter: Formatter = (config) => {
	const color = getColorFor(config.level);
	const prefix = getPrefix(config);
	const body = config.args.map(formatArg).join(" ");

	return `${color}${prefix} ${body}${RESET_COLOR}`;
};

/**
 * Formats various data types to be printed
 *
 * @param arg - Argument to format
 * @returns String ready to be printed
 */
export function formatArg(arg: unknown): string {
	if (typeof arg === "undefined") return "undefined";

	if (arg instanceof Error) {
		return `${arg.name}: ${arg.message}\n${arg.stack ?? ""}`;
	}

	if (typeof arg === "object" && arg !== null) {
		try {
			return JSON.stringify(arg);
		} catch {
			return "[Unserializable Object]";
		}
	}

	return String(arg);
}

/**
 * Builds the log prefix for a given message.
 * If a custom `prefixBuilder` is provided in the config, it's used directly.
 * Otherwise, constructs `[LEVEL]` or `timestamp [LEVEL]` depending on config.
 *
 * @param config - Formatter config including log level and optional timestamp/custom builder.
 * @returns A formatted prefix string.
 */
export function getPrefix({
	level,
	prefixBuilder,
	withTimestamp = false,
}: FormatterConfig): string {
	if (typeof prefixBuilder === "function") {
		return prefixBuilder();
	}

	const timestamp = withTimestamp ? `${new Date().toISOString()} ` : "";

	return `${timestamp}[${level.toUpperCase()}]`;
}
