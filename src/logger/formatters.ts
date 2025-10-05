import { inspect } from "node:util";
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
	return body ? `${prefix} ${body}` : prefix;
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
	const line = body ? `${prefix} ${body}` : prefix;
	return `${color}${line}${RESET_COLOR}`;
};

/**
 * Formats various data types to be printed
 *
 * @param arg - Argument to format
 * @returns String ready to be printed
 */
export function formatArg(arg: unknown): string {
	if (typeof arg === "undefined") return "undefined";
	if (arg instanceof Error)
		return `${arg.name}: ${arg.message}\n${arg.stack ?? ""}`;
	if (typeof arg === "string") return arg;
	if (typeof arg === "bigint") return `${arg}n`;
	if (typeof arg === "function")
		return `[Function ${(arg).name || "anonymous"}]`;

	if (typeof arg === "object" && arg !== null) {
		try {
			return JSON.stringify(arg, jsonReplacer);
		} catch {
			try {
				return inspect(arg, { depth: null, breakLength: Infinity });
			} catch {
				return "[Unserializable Object]";
			}
		}
	}
	return String(arg);
}

function jsonReplacer(_k: string, v: unknown) {
	if (typeof v === "bigint") return String(v);
	if (typeof v === "symbol") return v.toString();
	if (v instanceof Map) return Object.fromEntries(v);
	if (v instanceof Set) return Array.from(v);
	return v;
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
