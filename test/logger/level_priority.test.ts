import { levelPriority, shouldLog } from "../../src/logger/level_priority.js";
import type { LogLevel } from "../../src/types/log_level.js";
import type { LogThreshold } from "../../src/types/log_threshold.js";
import { describe, expect, it } from "../setup.js";

describe("levelPriority", () => {
	const expected: Record<LogThreshold, number> = {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
		silent: Number.POSITIVE_INFINITY,
	};

	it("should match expected priority values", () => {
		expect(levelPriority).toEqual(expected);
	});

	it("should assign silent the highest value", () => {
		expect(levelPriority.silent).toBeGreaterThan(levelPriority.error);
	});

	it("should preserve order of increasing severity", () => {
		expect(levelPriority.debug).toBeLessThan(levelPriority.info);
		expect(levelPriority.info).toBeLessThan(levelPriority.warn);
		expect(levelPriority.warn).toBeLessThan(levelPriority.error);
	});
});

describe("shouldLog", () => {
	it("returns true when level equals threshold", () => {
		expect(shouldLog("info", "info")).toBe(true);
		expect(shouldLog("error", "error")).toBe(true);
	});

	it("returns true when level is more severe than threshold", () => {
		expect(shouldLog("info", "warn")).toBe(true);
		expect(shouldLog("warn", "error")).toBe(true);
	});

	it("returns false when level is less severe than threshold", () => {
		expect(shouldLog("warn", "info")).toBe(false);
		expect(shouldLog("error", "debug")).toBe(false);
	});

	it("returns false for all levels when threshold is silent", () => {
		expect(shouldLog("silent", "debug")).toBe(false);
		expect(shouldLog("silent", "info")).toBe(false);
		expect(shouldLog("silent", "warn")).toBe(false);
		expect(shouldLog("silent", "error")).toBe(false);
	});

	it("returns true for all levels when threshold is debug", () => {
		expect(shouldLog("debug", "debug")).toBe(true);
		expect(shouldLog("debug", "info")).toBe(true);
		expect(shouldLog("debug", "warn")).toBe(true);
		expect(shouldLog("debug", "error")).toBe(true);
	});

	it("throws if level is unknown", () => {
		const badLevel = "fatal" as unknown as LogLevel;

		expect(() => shouldLog(badLevel, "info")).toThrowError(
			/Unknown log level\/threshold: "fatal"/,
		);
	});
});
