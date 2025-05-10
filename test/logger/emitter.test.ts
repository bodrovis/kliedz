import { emitLog } from "../../src/logger/emitter.js";
import type { LogLevel } from "../../src/types/log_level.js";
import { afterEach, describe, expect, it, vi } from "../setup.js";

describe("emitLog", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls console.log for debug", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => {});

		emitLog("debug", "Debug message");

		expect(spy).toHaveBeenCalledWith("Debug message");
	});

	it("calls console.info for info", () => {
		const spy = vi.spyOn(console, "info").mockImplementation(() => {});

		emitLog("info", "Info message");

		expect(spy).toHaveBeenCalledWith("Info message");
	});

	it("calls console.warn for warn", () => {
		const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

		emitLog("warn", "Warn message");

		expect(spy).toHaveBeenCalledWith("Warn message");
	});

	it("calls console.error for error", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});

		emitLog("error", "Error message");

		expect(spy).toHaveBeenCalledWith("Error message");
	});

	it("throws if level is unvalid", () => {
		const badLevel = "fatal" as unknown as LogLevel;

		expect(() => emitLog(badLevel, "some message")).toThrowError(
			/Unknown method for level: "fatal"/,
		);
	});
});
