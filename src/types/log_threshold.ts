export const logThresholds = [
	"debug",
	"info",
	"warn",
	"error",
	"silent",
] as const;
export type LogThreshold = (typeof logThresholds)[number];
