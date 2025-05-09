import type { LogThreshold } from "./log_threshold.js";

export type LogLevel = Exclude<LogThreshold, "silent">;
