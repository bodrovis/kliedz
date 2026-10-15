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

afterEach(() => {
	vi.restoreAllMocks();
});

describe("createLogger", () => {
	it("creates a logger with a custom formatter", () => {
		const customFormatter = vi.fn(() => "[CUSTOM] hello");
		const customLogger = logger.createLogger(customFormatter);

		customLogger("foo", 42);

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			customFormatter,
			"foo",
			42,
		);
	});

	it("supports custom parameters with a custom formatter", () => {
		const customFormatter = vi.fn(() => "[CUSTOM] hello");
		const customLogger = logger.createLogger(customFormatter);

		customLogger.withParams(userParams, "hello");

		expect(coreSpy).toHaveBeenCalledWith(userParams, customFormatter, "hello");
	});
});

describe("logWithColor", () => {
	it("delegates to logCore with default parameters", () => {
		logger.logWithColor("quick", "msg");

		expect(coreSpy).toHaveBeenCalledTimes(1);
		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			colorFormatter,
			"quick",
			"msg",
		);
	});

	it("uses caller-supplied parameters via withParams", () => {
		logger.logWithColor.withParams(userParams, ...msgArgs);

		expect(coreSpy).toHaveBeenCalledWith(
			userParams,
			colorFormatter,
			...msgArgs,
		);
	});
});

describe("logWithLevel", () => {
	it("delegates to logCore with default parameters", () => {
		logger.logWithLevel("just", "text");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			"just",
			"text",
		);
	});

	it("forwards custom parameters correctly", () => {
		logger.logWithLevel.withParams({ level: "warn" }, ...msgArgs);

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "warn", threshold: "info" },
			plainFormatter,
			...msgArgs,
		);
	});

	it("forwards valid optional parameters", () => {
		const prefixBuilder = () => "PB";

		logger.logWithLevel.withParams(
			{
				level: "debug",
				withTimestamp: true,
				prefixBuilder,
			},
			"x",
			"y",
		);

		expect(coreSpy).toHaveBeenCalledWith(
			{
				level: "debug",
				threshold: "info",
				withTimestamp: true,
				prefixBuilder,
			},
			plainFormatter,
			"x",
			"y",
		);
	});

	it("does not override a provided threshold", () => {
		logger.logWithLevel.withParams(
			{ level: "warn", threshold: "error" },
			"boom",
		);

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "warn", threshold: "error" },
			plainFormatter,
			"boom",
		);
	});

	it("supports withParams without message arguments", () => {
		logger.logWithLevel.withParams({ level: "warn" });

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "warn", threshold: "info" },
			plainFormatter,
		);
	});

	it("does not mutate caller-supplied parameters", () => {
		const params: LogParams = { level: "warn" };

		logger.logWithLevel.withParams(params, "hello");

		expect(params).toEqual({ level: "warn" });
	});
});

describe("message handling", () => {
	it("treats an object containing level as message data", () => {
		const message = {
			level: "error",
			message: "Something happened",
			userId: 123,
		};

		logger.logWithLevel(message);

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			message,
		);
	});

	it("does not interpret valid LogParams as configuration", () => {
		const message = { level: "warn", threshold: "error" };

		logger.logWithLevel(message, "hello");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			message,
			"hello",
		);
	});

	it("treats an object with invalid parameter types as data", () => {
		const message = {
			level: 42,
			threshold: 7,
			withTimestamp: "yes",
			prefixBuilder: "->",
		};

		logger.logWithLevel(message, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			message,
			"x",
		);
	});

	it("treats numbers as message data", () => {
		logger.logWithLevel(123, ...msgArgs);

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			123,
			...msgArgs,
		);
	});

	it("treats null as message data", () => {
		logger.logWithLevel(null, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			null,
			"x",
		);
	});

	it("preserves undefined message arguments", () => {
		logger.logWithLevel(undefined, "x");

		expect(coreSpy).toHaveBeenCalledWith(
			{ level: "info", threshold: "info" },
			plainFormatter,
			undefined,
			"x",
		);
	});
});
