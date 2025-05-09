import * as emitter from "../../src/logger/emitter.js";
import { logWithColor } from "../../src/logger/log_with_color.js";
import { afterEach, describe, expect, it, vi } from "../setup.js";

describe("logWithColor", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("does not call emitLog if shouldLog is false", () => {
		const spy = vi.spyOn(emitter, "emitLog");
		logWithColor("error", "debug", "this won't log");
		expect(spy).not.toHaveBeenCalled();
	});

	it("calls emitLog with correct color and formatting", () => {
		const spy = vi.spyOn(emitter, "emitLog").mockImplementation(() => {});
		logWithColor("debug", "warn", "Caution:", "disk space low");

		const expected = "\x1b[33m[WARN] Caution: disk space low\x1b[0m";
		expect(spy).toHaveBeenCalledWith("warn", expected);
	});

	it("handles multiple args cleanly", () => {
		const spy = vi.spyOn(emitter, "emitLog").mockImplementation(() => {});
		logWithColor("debug", "info", "foo", 123, true);

		const expected = "\x1b[36m[INFO] foo 123 true\x1b[0m";
		expect(spy).toHaveBeenCalledWith("info", expected);
	});

	it("formats correctly with no message args", () => {
		const spy = vi.spyOn(emitter, "emitLog").mockImplementation(() => {});
		logWithColor("debug", "error");

		const expected = "\x1b[31m[ERROR] \x1b[0m";
		expect(spy).toHaveBeenCalledWith("error", expected);
	});
});
