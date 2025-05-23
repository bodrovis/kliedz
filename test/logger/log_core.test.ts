import * as emitter from "../../src/logger/emitter.js";
import * as priority from "../../src/logger/level_priority.js";
import { logCore } from "../../src/logger/log_core.js";
import type { Formatter } from "../../src/types/formatter.js";
import type { LogParams } from "../../src/types/log_params.js";
import { afterEach, describe, expect, it, vi } from "../setup.ts";

const baseParams: LogParams = { level: "info", threshold: "debug" };

const makeLine: Formatter = ({ level, args }) =>
	`[${level.toUpperCase()}] ${args.join(" ")}`;

describe("logCore", () => {
	afterEach(() => vi.restoreAllMocks());

	it("formats and emits when shouldLog returns true", () => {
		const shouldLogSpy = vi.spyOn(priority, "shouldLog").mockReturnValue(true);

		const emitLogSpy = vi
			.spyOn(emitter, "emitLog")
			.mockImplementation(() => void 0);

		logCore(baseParams, makeLine, "hello", "world");

		expect(shouldLogSpy).toHaveBeenCalledWith(
			baseParams.threshold,
			baseParams.level,
		);
		expect(emitLogSpy).toHaveBeenCalledWith(
			baseParams.level,
			"[INFO] hello world",
		);
	});

	it("formats and emits when shouldLog returns true with default threshold", () => {
		const shouldLogSpy = vi.spyOn(priority, "shouldLog").mockReturnValue(true);

		const emitLogSpy = vi
			.spyOn(emitter, "emitLog")
			.mockImplementation(() => void 0);

		logCore({ level: "warn" }, makeLine, "warning");

		expect(shouldLogSpy).toHaveBeenCalledWith("info", "warn");
		expect(emitLogSpy).toHaveBeenCalledWith("warn", "[WARN] warning");
	});

	it("suppresses output when shouldLog returns false", () => {
		const shouldLogSpy = vi.spyOn(priority, "shouldLog").mockReturnValue(false);

		const emitLogSpy = vi
			.spyOn(emitter, "emitLog")
			.mockImplementation(() => void 0);

		logCore(baseParams, makeLine, "hidden");

		expect(shouldLogSpy).toHaveBeenCalledWith(
			baseParams.threshold,
			baseParams.level,
		);
		expect(emitLogSpy).not.toHaveBeenCalled();
	});

	it("forwards withTimestamp flag to formatter", () => {
		const fmtSpy: Formatter = vi.fn(() => "formatted");
		const consoleInfoSpy = vi.spyOn(console, "info").mockReturnValue();

		logCore({ ...baseParams, withTimestamp: true }, fmtSpy, "payload");

		expect(fmtSpy).toHaveBeenCalledWith({
			level: baseParams.level,
			args: ["payload"],
			withTimestamp: true,
		});
		expect(consoleInfoSpy).toHaveBeenCalledWith("formatted");
	});
});
