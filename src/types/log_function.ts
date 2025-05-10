import type { LogParams } from "./log_params.js";

export type LogFunction = {
	(...args: unknown[]): void;
	(params: LogParams, ...args: unknown[]): void;
};