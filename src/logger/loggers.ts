import type { Formatter } from "../types/formatter.js";
import type { LogFunction } from "../types/log_function.js";
import type { LogParams } from "../types/log_params.js";
import { colorFormatter, plainFormatter } from "./formatters.js";
import { logCore } from "./log_core.js";

/**
 * Default parameters used when the caller omits an explicit
 * `LogParams` object ( a "fire-and-forget" call).
 */
const DEFAULT_LOG_PARAMS = Object.freeze({
	level: "info",
	threshold: "info",
} as const satisfies LogParams);

export const createLogger = (formatter: Formatter): LogFunction => {
	return (first: LogParams | unknown, ...rest: unknown[]): void => {
		const provided = isLogParams(first) ? first : undefined;
		const params: LogParams = { ...DEFAULT_LOG_PARAMS, ...provided };
		const args = provided ? rest : [first, ...rest];
		logCore(params, formatter, ...args);
	};
};

/**
 * Log with colourised output.
 * **Overloads**
 * 1. `(message, ...rest)` – uses sensible defaults (`info`/`info`).
 * 2. `(params, message, ...rest)` – full control.
 */
export const logWithColor: LogFunction = createLogger(colorFormatter);

/**
 * Log without colours – plain prefix only.
 * **Overloads**
 * 1. `(message, ...rest)` – defaults to `info` level.
 * 2. `(params, message, ...rest)` – caller supplies `LogParams`.
 */
export const logWithLevel: LogFunction = createLogger(plainFormatter);

/**
 * Runtime guard that checks whether an arbitrary value is a `LogParams` bag.
 * (Deliberately not exhaustive – we only need to know core keys.)
 */
function isLogParams(obj: unknown): obj is LogParams {
	if (typeof obj !== "object" || obj === null) return false;
	const o = obj as Record<string, unknown>;

	if (typeof o.level !== "string") return false;

	if (
		"threshold" in o &&
		o.threshold !== undefined &&
		typeof o.threshold !== "string"
	)
		return false;
	if (
		"withTimestamp" in o &&
		o.withTimestamp !== undefined &&
		typeof o.withTimestamp !== "boolean"
	)
		return false;
	if (
		"prefixBuilder" in o &&
		o.prefixBuilder !== undefined &&
		typeof o.prefixBuilder !== "function"
	)
		return false;

	return true;
}
