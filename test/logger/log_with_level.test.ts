import * as emitter from "../../src/logger/emitter.js";
import { logWithLevel } from "../../src/logger/log_with_level.js";
import { afterEach, describe, expect, it, vi } from "../setup.js";

describe("logWithLevel", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("does nothing if shouldLog is false", () => {
		const spy = vi.spyOn(emitter, "emitLog");
		logWithLevel("error", "debug", "should not appear");
		expect(spy).not.toHaveBeenCalled();
	});

	it("calls emitLog with formatted message", () => {
		const spy = vi.spyOn(emitter, "emitLog").mockImplementation(() => {});
		logWithLevel("debug", "warn", "CPU usage", "90%");
		expect(spy).toHaveBeenCalledWith("warn", "[WARN] CPU usage 90%");
	});

	it("handles no args cleanly", () => {
		const spy = vi.spyOn(emitter, "emitLog").mockImplementation(() => {});
		logWithLevel("debug", "info");
		expect(spy).toHaveBeenCalledWith("info", "[INFO]");
	});
});
