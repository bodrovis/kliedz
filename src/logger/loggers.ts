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
	const logger = (...args: unknown[]): void => {
		logCore(DEFAULT_LOG_PARAMS, formatter, ...args);
	};

	logger.withParams = (params: LogParams, ...args: unknown[]): void => {
		logCore({ ...DEFAULT_LOG_PARAMS, ...params }, formatter, ...args);
	};

	return logger;
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
