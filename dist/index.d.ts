declare const logThresholds: readonly ["debug", "info", "warn", "error", "silent"];
type LogThreshold = (typeof logThresholds)[number];

type LogLevel = Exclude<LogThreshold, "silent">;

type Formatter = (config: FormatterConfig) => string;
type FormatterConfig = {
    level: LogLevel;
    args: unknown[];
    withTimestamp?: boolean;
    prefixBuilder?: () => string;
};

/**
 * Formats various data types to be printed
 *
 * @param arg - Argument to format
 * @returns String ready to be printed
 */
declare function formatArg(arg: unknown): string;
/**
 * Builds the log prefix for a given message.
 * If a custom `prefixBuilder` is provided in the config, it's used directly.
 * Otherwise, constructs `[LEVEL]` or `timestamp [LEVEL]` depending on config.
 *
 * @param config - Formatter config including log level and optional timestamp/custom builder.
 * @returns A formatted prefix string.
 */
declare function getPrefix({ level, prefixBuilder, withTimestamp, }: FormatterConfig): string;

type LogParams = {
    level: LogLevel;
    threshold?: LogThreshold;
    withTimestamp?: boolean;
    prefixBuilder?: () => string;
};

type LogFnArity1 = (message: unknown, ...args: unknown[]) => void;
type LogFnArity2 = (params: LogParams, ...args: unknown[]) => void;
type LogFunction = LogFnArity1 & LogFnArity2;

declare const createLogger: (formatter: Formatter) => LogFunction;
/**
 * Log with colourised output.
 * **Overloads**
 * 1. `(message, ...rest)` – uses sensible defaults (`info`/`info`).
 * 2. `(params, message, ...rest)` – full control.
 */
declare const logWithColor: LogFunction;
/**
 * Log without colours – plain prefix only.
 * **Overloads**
 * 1. `(message, ...rest)` – defaults to `info` level.
 * 2. `(params, message, ...rest)` – caller supplies `LogParams`.
 */
declare const logWithLevel: LogFunction;

type ConsoleMethod = "log" | "info" | "warn" | "error";

export { type ConsoleMethod, type Formatter, type FormatterConfig, type LogFunction, type LogLevel, type LogParams, type LogThreshold, createLogger, formatArg, getPrefix, logWithColor, logWithLevel };
