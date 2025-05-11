import type { LogParams } from "./log_params.js";

type LogFnArity1 = (...args: unknown[]) => void;

// Full control: user provides LogParams
type LogFnArity2 = (params: LogParams, ...args: unknown[]) => void;

// Combined overload signature
export type LogFunction = LogFnArity1 & LogFnArity2;
