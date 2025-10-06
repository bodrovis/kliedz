import type { LogLevel } from "./log_level.js";

export type Formatter = (config: FormatterConfig) => string;

export type FormatterConfig = {
	level: LogLevel;
	args: readonly unknown[];
	withTimestamp?: boolean;
	prefixBuilder?: () => string;
};
