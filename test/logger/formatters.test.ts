import { RESET_COLOR } from "../../src/logger/colors.js";
import {
	colorFormatter,
	getPrefix,
	plainFormatter,
} from "../../src/logger/formatters.js";
import { describe, expect, it, vi } from "../setup.js";

const fakeDatetime = "2025-05-10T12:00:00.000Z";
const mockDate = new Date(fakeDatetime);
vi.useFakeTimers().setSystemTime(mockDate);

describe("getPrefix", () => {
	it("returns default prefix without timestamp", () => {
		const result = getPrefix({
			level: "info",
			args: [],
		});

		expect(result).toBe("[INFO]");
	});

	it("includes ISO timestamp if withTimestamp = true", () => {
		const result = getPrefix({
			level: "debug",
			withTimestamp: true,
			args: [],
		});

		expect(result).toBe(`${fakeDatetime} [DEBUG]`);
	});

	it("uses custom prefixBuilder if provided", () => {
		const result = getPrefix({
			level: "warn",
			args: [],
			prefixBuilder: () => ">>>CUSTOM<<<",
		});

		expect(result).toBe(">>>CUSTOM<<<");
	});
});

describe("plainFormatter", () => {
	it("formats message with default prefix", () => {
		const msg = plainFormatter({
			level: "info",
			args: ["hello", "world"],
		});

		expect(msg).toBe("[INFO] hello world");
	});

	it("adds timestamp when withTimestamp is true", () => {
		const msg = plainFormatter({
			level: "warn",
			withTimestamp: true,
			args: ["warning!"],
		});

		expect(msg).toBe(`${fakeDatetime} [WARN] warning!`);
	});

	it("formats undefined value", () => {
		const msg = plainFormatter({
			level: "info",
			args: [undefined],
		});
		expect(msg).toBe("[INFO] undefined");
	});

	it("formats objects using JSON.stringify", () => {
		const msg = plainFormatter({
			level: "info",
			args: [{ foo: "bar", n: 42 }],
		});
		expect(msg).toBe(`[INFO] {"foo":"bar","n":42}`);
	});

	it("prints Unserializable Object when the object cannot be properly processed", () => {
		const baddyBadObj = {
			toJSON() {
				throw new Error("nope");
			},
		};

		const msg = plainFormatter({
			level: "info",
			args: [baddyBadObj],
		});
		expect(msg).toBe("[INFO] [Unserializable Object]");
	});

	it("formats Error instances with name, message, and stack", () => {
		const err = new Error("something exploded");
		const msg = plainFormatter({
			level: "error",
			args: [err],
		});
		expect(msg).toContain("Error: something exploded");
		expect(msg).toContain(err.stack?.split("\n")[0] ?? "");
	});

	it("formats mixed values cleanly", () => {
		const msg = plainFormatter({
			level: "warn",
			args: ["msg", { a: 1 }, new Error("nope")],
		});

		expect(msg).toContain("[WARN] msg");
		expect(msg).toContain('"a":1');
		expect(msg).toContain("Error: nope");
	});
});

describe("colorFormatter", () => {
	it("wraps message with color codes", () => {
		const msg = colorFormatter({
			level: "error",
			args: ["something", "broke"],
		});
		const expectedPrefix = "[ERROR] something broke";

		expect(msg).toContain(expectedPrefix);
		expect(msg.startsWith("\x1b")).toBe(true);
		expect(msg.endsWith(RESET_COLOR)).toBe(true);
	});

	it("supports timestamp + color", () => {
		const msg = colorFormatter({
			level: "debug",
			withTimestamp: true,
			args: ["debugging"],
		});

		expect(msg).toContain(`${fakeDatetime} [DEBUG] debugging`);
		expect(msg.startsWith("\x1b")).toBe(true);
	});

	it("formats object with color wrapper", () => {
		const msg = colorFormatter({
			level: "info",
			args: [{ user: "leo", active: true }],
		});

		expect(msg).toContain('[INFO] {"user":"leo","active":true}');
		expect(msg.startsWith("\x1b")).toBe(true);
		expect(msg.endsWith(RESET_COLOR)).toBe(true);
	});

	it("formats error with stack trace and color", () => {
		const err = new Error("oh no");
		const msg = colorFormatter({
			level: "error",
			args: [err],
		});

		expect(msg).toContain("Error: oh no");
		expect(msg).toContain(err.stack?.split("\n")[0] ?? "");
		expect(msg.startsWith("\x1b")).toBe(true);
		expect(msg.endsWith(RESET_COLOR)).toBe(true);
	});
});
