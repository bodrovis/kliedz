declare const logThresholds: readonly ["debug", "info", "warn", "error", "silent"];
type LogThreshold = (typeof logThresholds)[number];

type LogLevel = Exclude<LogThreshold, "silent">;

type ConsoleMethod = "log" | "info" | "warn" | "error";

type LogParams = {
    level: LogLevel;
    threshold?: LogThreshold;
    withTimestamp?: boolean;
    prefixBuilder?: () => string;
};

type Formatter = (config: FormatterConfig) => string;
type FormatterConfig = {
    level: LogLevel;
    args: unknown[];
    withTimestamp?: boolean;
    prefixBuilder?: () => string;
};

/**
 * Log with colourised output.
 * **Overloads**
 * 1. `(message, ...rest)` – uses sensible defaults (`info`/`info`).
 * 2. `(params, message, ...rest)` – full control.
 */
declare function logWithColor(...args: unknown[]): void;
declare function logWithColor(params: LogParams, ...args: unknown[]): void;
/**
 * Log without colours – plain prefix only.
 * **Overloads**
 * 1. `(message, ...rest)` – defaults to `info` level.
 * 2. `(params, message, ...rest)` – caller supplies `LogParams`.
 */
declare function logWithLevel(...args: unknown[]): void;
declare function logWithLevel(params: LogParams, ...args: unknown[]): void;

export { type ConsoleMethod, type Formatter, type LogLevel, type LogParams, type LogThreshold, logWithColor, logWithLevel };
