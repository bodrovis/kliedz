import type { LogParams } from "../types/log_params.js";
import { colorFormatter, plainFormatter } from "./formatters.js";
import { logCore } from "./log_core.js";

/**
 * Default parameters used when the caller omits an explicit
 * `LogParams` object ( a “fire-and-forget” call).
 */
const DEFAULT_LOG_PARAMS: LogParams = {
	level: "info",
	threshold: "info",
};

/**
 * Log with colourised output.
 * **Overloads**
 * 1. `(message, ...rest)` – uses sensible defaults (`info`/`info`).
 * 2. `(params, message, ...rest)` – full control.
 */
export function logWithColor(...args: unknown[]): void;
export function logWithColor(params: LogParams, ...args: unknown[]): void;

export function logWithColor(
	first: LogParams | unknown,
	...rest: unknown[]
): void {
	const formatter = colorFormatter;

	if (isLogParams(first)) {
		logCore(first, formatter, ...rest);
	} else {
		logCore(DEFAULT_LOG_PARAMS, formatter, first, ...rest);
	}
}

/**
 * Log without colours – plain prefix only.
 * **Overloads**
 * 1. `(message, ...rest)` – defaults to `info` level.
 * 2. `(params, message, ...rest)` – caller supplies `LogParams`.
 */
export function logWithLevel(...args: unknown[]): void;
export function logWithLevel(params: LogParams, ...args: unknown[]): void;

export function logWithLevel(
	first: LogParams | unknown,
	...rest: unknown[]
): void {
	const formatter = plainFormatter;

	if (isLogParams(first)) {
		logCore(first, formatter, ...rest);
	} else {
		logCore(DEFAULT_LOG_PARAMS, formatter, first, ...rest);
	}
}

/**
 * Runtime guard that checks whether an arbitrary value is a `LogParams` bag.
 * (Deliberately not exhaustive – we only need to know core keys.)
 */
function isLogParams(obj: unknown): obj is LogParams {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"level" in obj &&
		typeof obj.level === "string"
	);
}
