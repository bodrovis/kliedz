import { getColorFor, RESET_COLOR } from "../../src/logger/colors.js";
import type { LogLevel } from "../../src/types/log_level.js";
import { describe, expect, it } from "../setup.js";

describe("getColorFor", () => {
	it.each([
		["debug", "\x1b[90m"],
		["info", "\x1b[36m"],
		["warn", "\x1b[33m"],
		["error", "\x1b[31m"],
	] as const)("returns correct color for %s", (level, color) => {
		expect(getColorFor(level)).toBe(color);
	});

	it("throws for unknown log levels", () => {
		expect(() => getColorFor("fatal" as LogLevel)).toThrow(
			'Unknown log level: "fatal"',
		);
	});

	it("rejects inherited object properties", () => {
		expect(() => getColorFor("toString" as LogLevel)).toThrow(
			'Unknown log level: "toString"',
		);
	});
});

describe("RESET_COLOR", () => {
	it("contains the ANSI reset sequence", () => {
		expect(RESET_COLOR).toBe("\x1b[0m");
	});
});
