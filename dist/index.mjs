import { inspect } from "node:util";

//#region src/logger/colors.ts
/**
* ANSI color codes mapped to log levels for terminal output.
* These control how the log prefix is rendered in supported terminals.
*/
const LEVEL_COLORS = Object.freeze({
	debug: "\x1B[90m",
	info: "\x1B[36m",
	warn: "\x1B[33m",
	error: "\x1B[31m"
});
const RESET_COLOR = "\x1B[0m";
/**
* Returns the ANSI color code for a given log level.
* Throws if the level is unknown or not configured.
*
* @param level - The log level to get color for.
* @returns ANSI escape code string for that level.
*/
function getColorFor(level) {
	if (!Object.hasOwn(LEVEL_COLORS, level)) throw new Error(`Unknown log level: "${level}"`);
	return LEVEL_COLORS[level];
}

//#endregion
//#region src/logger/formatters.ts
/**
* Formats a log message with no colors.
* Adds a prefix (with optional timestamp), followed by the joined message body.
*
* Example output:
* `[INFO] message here`
* or
* `2025-05-10T12:34:56.789Z [INFO] message here`
*/
const plainFormatter = (config) => {
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
const colorFormatter = (config) => {
	const color = getColorFor(config.level);
	const prefix = getPrefix(config);
	const body = config.args.map(formatArg).join(" ");
	return `${color}${body ? `${prefix} ${body}` : prefix}${RESET_COLOR}`;
};
/**
* Formats various data types to be printed
*
* @param arg - Argument to format
* @returns String ready to be printed
*/
function formatArg(arg) {
	if (typeof arg === "undefined") return "undefined";
	if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack ?? ""}`;
	if (typeof arg === "string") return arg;
	if (typeof arg === "bigint") return `${arg}n`;
	if (typeof arg === "function") return `[Function ${arg.name || "anonymous"}]`;
	if (typeof arg === "object" && arg !== null) try {
		return JSON.stringify(arg, jsonReplacer);
	} catch {
		try {
			return inspect(arg, {
				depth: null,
				breakLength: Infinity
			});
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
function getPrefix({ level, prefixBuilder, withTimestamp = false }) {
	if (typeof prefixBuilder === "function") return prefixBuilder();
	return `${withTimestamp ? `${(/* @__PURE__ */ new Date()).toISOString()} ` : ""}[${level.toUpperCase()}]`;
}
function jsonReplacer(_k, v) {
	if (typeof v === "bigint") return String(v);
	if (typeof v === "symbol") return v.toString();
	if (v instanceof Map) return Object.fromEntries(v);
	if (v instanceof Set) return Array.from(v);
	return v;
}

//#endregion
//#region src/logger/emitter.ts
/**
* Maps each log level to the corresponding console method.
* Used internally to dispatch messages to the correct output function.
*/
const CONSOLE_METHODS = Object.freeze({
	debug: "log",
	info: "info",
	warn: "warn",
	error: "error"
});
/**
* Returns console method to use for a given log level.
* Throws if the level is unknown or not configured.
*
* @param level - The log level to get method for.
* @returns ConsoleMethod
*/
function getMethodFor(level) {
	const m = CONSOLE_METHODS[level];
	if (!m) throw new Error(`Unknown method for level: "${level}"`);
	return m;
}
/**
* Emits a log message to the appropriate console method.
* Assumes message is already formatted and ready to print.
*
* @param level - The log level of the message (e.g. "warn", "error")
* @param message - The final string to output (includes prefix, colors, etc.)
*/
function emitLog(level, message) {
	const method = getMethodFor(level);
	const fn = console[method];
	fn(message);
}

//#endregion
//#region src/types/log_threshold.ts
const logThresholds = [
	"debug",
	"info",
	"warn",
	"error",
	"silent"
];

//#endregion
//#region src/logger/level_priority.ts
function fromEntriesStrict(entries) {
	return Object.fromEntries(entries);
}
/**
* Assigns a numeric priority to each log threshold level.
* Lower numbers mean more verbose; higher means more critical.
* "silent" is given a very high value to suppress all output.
*/
const levelPriority = fromEntriesStrict(logThresholds.map((level, index) => [level, level === "silent" ? Number.POSITIVE_INFINITY : index]));
/**
* Returns the numeric priority for a given log level or threshold.
* Throws if the level is unknown or not registered.
*
* @param level - Log level or threshold
* @returns Priority number
*/
function getPriorityFor(level) {
	const p = levelPriority[level];
	if (p === void 0) throw new Error(`Unknown log level/threshold: "${level}"`);
	return p;
}
/**
* Determines whether a message with the given `level` should be logged
* based on the user-defined `threshold`.
*
* @param threshold - The minimum log level required to allow output
* @param level - The log level of the current message
* @returns `true` if the message should be printed, `false` otherwise
*/
function shouldLog(threshold, level) {
	return getPriorityFor(level) >= getPriorityFor(threshold);
}

//#endregion
//#region src/logger/log_core.ts
/**
* Core logging function that handles level filtering, formatting, and emitting.
*
* - Skips logging if `shouldLog(threshold, level)` returns false.
* - Uses the provided `formatter` to convert log args to a string.
* - Passes the final message to `emitLog`.
*
* @param params - Log configuration: level, threshold, and optional timestamp.
* @param formatter - Function that formats the log message.
* @param args - Arbitrary message arguments to be logged.
*/
function logCore(params, formatter, ...args) {
	const { level, prefixBuilder, threshold = "info", withTimestamp = false } = params;
	if (!shouldLog(threshold, level)) return;
	try {
		emitLog(level, formatter({
			level,
			args,
			withTimestamp,
			...prefixBuilder ? { prefixBuilder } : {}
		}));
	} catch (err) {
		try {
			const fallback = `[logging-error @ ${(/* @__PURE__ */ new Date()).toISOString()}] ` + (err instanceof Error ? `${err.name}: ${err.message}` : String(err));
			console.error(fallback);
		} catch {}
	}
}

//#endregion
//#region src/logger/loggers.ts
/**
* Default parameters used when the caller omits an explicit
* `LogParams` object ( a "fire-and-forget" call).
*/
const DEFAULT_LOG_PARAMS = Object.freeze({
	level: "info",
	threshold: "info"
});
const createLogger = (formatter) => {
	return (first, ...rest) => {
		const provided = isLogParams(first) ? first : void 0;
		logCore({
			...DEFAULT_LOG_PARAMS,
			...provided
		}, formatter, ...provided ? rest : [first, ...rest]);
	};
};
/**
* Log with colourised output.
* **Overloads**
* 1. `(message, ...rest)` – uses sensible defaults (`info`/`info`).
* 2. `(params, message, ...rest)` – full control.
*/
const logWithColor = createLogger(colorFormatter);
/**
* Log without colours – plain prefix only.
* **Overloads**
* 1. `(message, ...rest)` – defaults to `info` level.
* 2. `(params, message, ...rest)` – caller supplies `LogParams`.
*/
const logWithLevel = createLogger(plainFormatter);
/**
* Runtime guard that checks whether an arbitrary value is a `LogParams` bag.
* (Deliberately not exhaustive – we only need to know core keys.)
*/
function isLogParams(obj) {
	if (typeof obj !== "object" || obj === null) return false;
	const o = obj;
	if (typeof o.level !== "string") return false;
	if ("threshold" in o && o.threshold !== void 0 && typeof o.threshold !== "string") return false;
	if ("withTimestamp" in o && o.withTimestamp !== void 0 && typeof o.withTimestamp !== "boolean") return false;
	if ("prefixBuilder" in o && o.prefixBuilder !== void 0 && typeof o.prefixBuilder !== "function") return false;
	return true;
}

//#endregion
export { createLogger, formatArg, getPrefix, logWithColor, logWithLevel };
//# sourceMappingURL=index.mjs.map