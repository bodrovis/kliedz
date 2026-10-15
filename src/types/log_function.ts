import type { LogParams } from "./log_params.js";

export interface LogFunction {
	(message: unknown, ...args: unknown[]): void;
	withParams(params: LogParams, ...args: unknown[]): void;
}
