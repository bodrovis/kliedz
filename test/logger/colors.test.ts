import { getColorFor } from "../../src/logger/colors.js";
import type { LogLevel } from "../../src/types/log_level.js";
import { describe, expect, it } from "../setup.js";

describe("getColorFor", () => {
	it("returns correct color for known level", () => {
		expect(getColorFor("debug")).toBe("\x1b[90m");
	});

	it("throws if level is not in LEVEL_COLORS", () => {
		const badLevel = "fatal" as unknown as LogLevel;

		expect(() => getColorFor(badLevel)).toThrowError(
			/Unknown log level: "fatal"/,
		);
	});
});
