import type { LogLevel } from "./log_level.js";
import type { LogThreshold } from "./log_threshold.js";

export type LogParams = {
	level: LogLevel;
	threshold?: LogThreshold;
	withTimestamp?: boolean;
	prefixBuilder?: () => string;
};
