//#region src/types/log_threshold.d.ts
declare const logThresholds: readonly ["debug", "info", "warn", "error", "silent"];
type LogThreshold = (typeof logThresholds)[number];
//#endregion
//#region src/types/log_level.d.ts
type LogLevel = Exclude<LogThreshold, "silent">;
//#endregion
//#region src/types/formatter.d.ts
type Formatter = (config: FormatterConfig) => string;
type FormatterConfig = {
  level: LogLevel;
  args: readonly unknown[];
  withTimestamp?: boolean;
  prefixBuilder?: () => string;
};
//#endregion
//#region src/logger/formatters.d.ts
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
declare function getPrefix({
  level,
  prefixBuilder,
  withTimestamp
}: FormatterConfig): string;
//#endregion
//#region src/types/log_params.d.ts
type LogParams = {
  level: LogLevel;
  threshold?: LogThreshold;
  withTimestamp?: boolean;
  prefixBuilder?: () => string;
};
//#endregion
//#region src/types/log_function.d.ts
type LogFnArity1 = (message: unknown, ...args: unknown[]) => void;
type LogFnArity2 = (params: LogParams, ...args: unknown[]) => void;
type LogFunction = LogFnArity1 & LogFnArity2;
//#endregion
//#region src/logger/loggers.d.ts
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
//#endregion
//#region src/types/console_method.d.ts
type ConsoleMethod = "log" | "info" | "warn" | "error";
//#endregion
export { ConsoleMethod, Formatter, FormatterConfig, LogFunction, LogLevel, LogParams, LogThreshold, createLogger, formatArg, getPrefix, logWithColor, logWithLevel };
//# sourceMappingURL=index.d.mts.map