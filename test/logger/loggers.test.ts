import { colorFormatter, plainFormatter } from "../../src/logger/formatters.js";
import * as coreMod from "../../src/logger/log_core.js";
import * as logger from "../../src/logger/loggers.js";
import type { LogParams } from "../../src/types/log_params.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "../setup.js";

const userParams: LogParams = { level: "warn", threshold: "debug" };
const msgArgs = ["hello", "world"];

let coreSpy!: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	coreSpy = vi.spyOn(coreMod, "logCore").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("createLogger - allows to create custom loggers", () => {
	it("creates a logger with custom formatter", () => {
		const params = { level: "info", threshold: "debug" };
		const customFormatter = vi.fn(() => "[CUSTOM] hello");

		const customLogger = logger.createLogger(customFormatter);

		customLogger(params, "hello");

		expect(coreSpy).toHaveBeenCalledWith(params, customFormatter, "hello");

		customLogger("foo", 42);

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			customFormatter,
			"foo",
			42,
		);
	});
});

describe("logWithColor – overload resolution", () => {
	it("delegates to logCore with DEFAULT params when no LogParams given", () => {
		logger.logWithColor("quick", "msg");

		expect(coreSpy).toHaveBeenCalledTimes(1);
		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			colorFormatter,
			"quick",
			"msg",
		);
	});

	it("uses caller-supplied LogParams when provided", () => {
		logger.logWithColor(userParams, ...msgArgs);

		expect(coreSpy).toHaveBeenCalledWith(
			userParams,
			colorFormatter,
			...msgArgs,
		);
	});
});

describe("logWithLevel – overload resolution", () => {
	it("delegates with defaults when first arg is NOT LogParams", () => {
		logger.logWithLevel("just", "text");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			"just",
			"text",
		);
	});

	it("forwards custom LogParams correctly", () => {
		logger.logWithLevel({ level: "warn" }, ...msgArgs);

		expect(coreSpy).toHaveBeenCalledWith(
			expect.objectContaining({ level: "warn", threshold: "info" }),
			plainFormatter,
			...msgArgs,
		);
	});
});

describe("isLogParams (behaviour via createLogger)", () => {
	it("rejects non-object (number) → uses defaults, treats value as message", () => {
		logger.logWithLevel(123, ...msgArgs);

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			123,
			...msgArgs,
		);
	});

	it("rejects null → defaults + payload", () => {
		logger.logWithLevel(null, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			null,
			"x",
		);
	});

	it("rejects object without level → defaults + payload", () => {
		logger.logWithLevel({ threshold: "warn" }, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			{ threshold: "warn" },
			"x",
		);
	});

	it("rejects level of wrong type → defaults + payload", () => {
		logger.logWithLevel({ level: 42 }, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			{ level: 42 },
			"x",
		);
	});

	it("rejects bad threshold type → defaults + payload", () => {
		logger.logWithLevel({ level: "info", threshold: 7 }, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			{ level: "info", threshold: 7 },
			"x",
		);
	});

	it("rejects bad withTimestamp type → defaults + payload", () => {
		logger.logWithLevel({ level: "warn", withTimestamp: "yes" }, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			{ level: "warn", withTimestamp: "yes" },
			"x",
		);
	});

	it("rejects bad prefixBuilder type → defaults + payload", () => {
		logger.logWithLevel({ level: "warn", prefixBuilder: "->" }, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			{ level: "warn", prefixBuilder: "->" },
			"x",
		);
	});

	it("accepts minimal valid params (level only) → merges defaults", () => {
		logger.logWithLevel({ level: "warn" }, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "warn", threshold: "info" },
			plainFormatter,
			"x",
		);
	});

	it("accepts valid optional fields (withTimestamp, prefixBuilder) → forwards them", () => {
		const pb = () => "PB";
		logger.logWithLevel(
			{ level: "debug", withTimestamp: true, prefixBuilder: pb },
			"x",
			"y",
		);

		// проверяем, что дефолт threshold домержился, а опции приехали как есть
		const [params, fmt, ...rest] = coreSpy.mock.calls[0];
		expect(params).toEqual({
			level: "debug",
			threshold: "info",
			withTimestamp: true,
			prefixBuilder: pb,
		});
		expect(fmt).toBe(plainFormatter);
		expect(rest).toEqual(["x", "y"]);
	});

	it("does not override provided threshold", () => {
		logger.logWithLevel({ level: "warn", threshold: "error" }, "boom");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "warn", threshold: "error" },
			plainFormatter,
			"boom",
		);
	});
});
