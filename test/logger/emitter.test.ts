import { emitLog } from "../../src/logger/emitter.js";
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
});
