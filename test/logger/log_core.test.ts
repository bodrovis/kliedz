import * as emitter from "../../src/logger/emitter.js";
import * as priority from "../../src/logger/level_priority.js";
import { logCore } from "../../src/logger/log_core.js";
import type { Formatter } from "../../src/types/formatter.js";
import type { LogParams } from "../../src/types/log_params.js";
import {
	afterEach,
	describe,
	expect,
	it,
	type MockedFunction,
	vi,
} from "../setup.js";

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

	it("suppresses formatting and emitting when shouldLog returns false", () => {
		const shouldLogSpy = vi.spyOn(priority, "shouldLog").mockReturnValue(false);
		const emitLogSpy = vi
			.spyOn(emitter, "emitLog")
			.mockImplementation(() => {});
		const formatterSpy = vi.fn(makeLine);

		logCore(baseParams, formatterSpy, "hidden");

		expect(shouldLogSpy).toHaveBeenCalledWith(
			baseParams.threshold,
			baseParams.level,
		);
		expect(formatterSpy).not.toHaveBeenCalled();
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

	it("passes prefixBuilder through to formatter params when provided", () => {
		const pb = () => ">>>PB<<<";
		const fmtSpy = vi.fn(() => "ok") as MockedFunction<Formatter>;

		const emitLogSpy = vi
			.spyOn(emitter, "emitLog")
			.mockImplementation(() => void 0);

		vi.spyOn(priority, "shouldLog").mockReturnValue(true);

		logCore(
			{ level: "info", threshold: "debug", prefixBuilder: pb },
			fmtSpy,
			"x",
		);

		expect(fmtSpy).toHaveBeenCalledTimes(1);
		expect(fmtSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				prefixBuilder: pb,
			}),
		);

		expect(emitLogSpy).toHaveBeenCalledWith("info", "ok");
	});

	it("writes to console.error if formatter fails", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const boom = new Error("formatter exploded");
		const badFormatter = () => {
			throw boom;
		};

		expect(() => logCore(baseParams, badFormatter, "hello")).not.toThrow();

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		const logged = (consoleSpy.mock.calls[0]?.[0] ?? "") as string;
		expect(logged).toContain("[logging-error @ ");
		expect(logged).toContain("Error: formatter exploded");
	});

	it("writes to console.error if formatter fails and error is weird", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const badFormatter = () => {
			throw 42;
		};

		expect(() => logCore(baseParams, badFormatter, "hello")).not.toThrow();

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		const logged = (consoleSpy.mock.calls[0]?.[0] ?? "") as string;
		expect(logged).toContain("[logging-error @ ");
		expect(logged).toContain("42");
	});

	it("does not throw when fallback console.error fails", () => {
		vi.spyOn(priority, "shouldLog").mockReturnValue(true);

		const badFormatter = () => {
			throw new Error("boom");
		};

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {
			throw new Error("console.error is broken");
		});

		expect(() => {
			logCore(baseParams, badFormatter, "arg");
		}).not.toThrow();

		expect(errorSpy).toHaveBeenCalledTimes(1);
	});

	it("propagates errors from shouldLog", () => {
		const error = new Error("Invalid log configuration");

		vi.spyOn(priority, "shouldLog").mockImplementation(() => {
			throw error;
		});

		const formatterSpy = vi.fn(makeLine);
		const emitLogSpy = vi.spyOn(emitter, "emitLog");
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => logCore(baseParams, formatterSpy, "hello")).toThrow(error);

		expect(formatterSpy).not.toHaveBeenCalled();
		expect(emitLogSpy).not.toHaveBeenCalled();
		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it("writes fallback to console.error if emitting fails", () => {
		vi.spyOn(priority, "shouldLog").mockReturnValue(true);

		const emitLogSpy = vi.spyOn(emitter, "emitLog").mockImplementation(() => {
			throw new Error("Emitter failed");
		});

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => logCore(baseParams, makeLine, "hello")).not.toThrow();

		expect(emitLogSpy).toHaveBeenCalledWith("info", "[INFO] hello");
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("Error: Emitter failed"),
		);
	});
});
