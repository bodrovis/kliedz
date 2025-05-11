import type { Formatter } from "../types/formatter.js";
import type { LogFunction } from "../types/log_function.js";
import type { LogParams } from "../types/log_params.js";
import { colorFormatter, plainFormatter } from "./formatters.js";
import { logCore } from "./log_core.js";

/**
 * Default parameters used when the caller omits an explicit
 * `LogParams` object ( a "fire-and-forget" call).
 */
const DEFAULT_LOG_PARAMS: LogParams = {
	level: "info",
	threshold: "info",
};

export const createLogger = (formatter: Formatter): LogFunction => {
	return (first: LogParams | unknown, ...rest: unknown[]): void => {
		const params = isLogParams(first) ? first : DEFAULT_LOG_PARAMS;
		const args = isLogParams(first) ? rest : [first, ...rest];

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
	return (
		typeof obj === "object" &&
		obj !== null &&
		"level" in obj &&
		typeof obj.level === "string"
	);
}
