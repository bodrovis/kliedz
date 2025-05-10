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
			{ level: "warn" },
			plainFormatter,
			...msgArgs,
		);
	});
});
