import { RESET_COLOR } from "../../src/logger/colors.js";
import {
	colorFormatter,
	getPrefix,
	plainFormatter,
} from "../../src/logger/formatters.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "../setup.js";

const fakeDatetime = "2025-05-10T12:00:00.000Z";

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(fakeDatetime));
});

afterEach(() => {
	vi.useRealTimers();
});

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
			withTimestamp: true,
			args: [],
			prefixBuilder: () => ">>>CUSTOM<<<",
		});

		expect(result).toBe(">>>CUSTOM<<<");
	});

	it("returns prefix only when no args", () => {
		const result = getPrefix({ level: "info", args: [] });
		expect(result).toBe("[INFO]");
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

	it("prints Function when the object has a weird function inside", () => {
		const baddyBadObj = {
			toJSON() {
				throw new Error("nope");
			},
		};

		const msg = plainFormatter({
			level: "info",
			args: [baddyBadObj],
		});
		expect(msg).toBe("[INFO] { toJSON: [Function: toJSON] }");
	});

	it("formats a named function arg compactly", () => {
		function doStuff() {}
		const msg = plainFormatter({ level: "info", args: [doStuff] });
		expect(msg).toBe("[INFO] [Function doStuff]");
	});

	it("formats an anonymous function arg compactly", () => {
		const msg = plainFormatter({ level: "info", args: [() => {}] });

		expect(msg).toBe("[INFO] [Function anonymous]");
	});

	it("formats bigint values with trailing 'n'", () => {
		const msg = plainFormatter({ level: "info", args: [123n] });
		expect(msg).toBe("[INFO] 123n");
	});

	it("formats booleans as strings", () => {
		const msg = plainFormatter({ level: "info", args: [true] });
		expect(msg).toBe("[INFO] true");
	});

	it("stringifies bigint inside objects as strings (JSON-safe)", () => {
		const msg = plainFormatter({ level: "info", args: [{ id: 123n }] });
		expect(msg).toBe('[INFO] {"id":"123"}');
	});

	it("stringifies symbol inside objects via toString()", () => {
		const sym = Symbol("x");
		const msg = plainFormatter({ level: "info", args: [{ s: sym }] });
		expect(msg).toBe(`[INFO] {"s":"${sym.toString()}"}`);
	});

	it("stringifies Set as array", () => {
		const msg = plainFormatter({ level: "info", args: [new Set([1, 2])] });
		expect(msg).toBe("[INFO] [1,2]");
	});

	it("stringifies Map as an array of entries", () => {
		const m = new Map<string, number>([["a", 1]]);
		const msg = plainFormatter({ level: "info", args: [m] });
		expect(msg).toBe('[INFO] [["a",1]]');
	});

	it("returns '[Unserializable Object]' if even inspect throws", async () => {
		try {
			// biome-ignore lint/suspicious/noExplicitAny: force self-loop here
			const a: any = {};
			a.self = a;

			vi.doMock("node:util", () => {
				return {
					inspect: () => {
						throw new Error("nope");
					},
				};
			});

			vi.resetModules();
			const { plainFormatter } = await import("../../src/logger/formatters.js");

			const msg = plainFormatter({ level: "info", args: [a] });
			expect(msg).toBe("[INFO] [Unserializable Object]");
		} catch (error) {
			console.error(error);
		} finally {
			vi.doUnmock("node:util");
			vi.resetModules();
		}
	});

	it("formats Error without stack gracefully", () => {
		const err = new Error("oops");
		delete err.stack;

		const msg = plainFormatter({ level: "error", args: [err] });

		expect(msg).toBe("[ERROR] Error: oops");
	});

	it("emits only prefix when args are empty", () => {
		const msg = plainFormatter({ level: "info", args: [] });
		expect(msg).toBe("[INFO]");
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

	it("includes name/message and some stack without duplicating constraints", () => {
		const err = new Error("boom");
		const msg = plainFormatter({ level: "error", args: [err] });
		expect(msg).toContain("Error: boom");
		expect(msg.split("\n").length).toBeGreaterThan(1);
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

	it("falls back to inspect when JSON.stringify returns undefined", () => {
		const obj = {
			toJSON() {
				return undefined;
			},
		};

		const msg = plainFormatter({ level: "info", args: [obj] });

		expect(msg).toContain("[INFO]");
		expect(msg).toContain("toJSON");
		expect(msg).not.toBe("[INFO]");
	});

	it("preserves Map entries with object keys", () => {
		const map = new Map([
			[{ id: 1 }, "first"],
			[{ id: 2 }, "second"],
		]);

		const msg = plainFormatter({ level: "info", args: [map] });

		expect(msg).toBe('[INFO] [[{"id":1},"first"],[{"id":2},"second"]]');
	});

	it("falls back to inspect for circular references", () => {
		const obj: { name: string; self?: unknown } = {
			name: "circular",
		};
		obj.self = obj;

		const msg = plainFormatter({ level: "info", args: [obj] });

		expect(msg).toContain("circular");
		expect(msg).toContain("[Circular");
	});

	it("does not duplicate Error name and message", () => {
		const err = new Error("something exploded");

		const msg = plainFormatter({
			level: "error",
			args: [err],
		});

		expect(msg.match(/Error: something exploded/g)).toHaveLength(1);
		expect(msg).toContain(err.stack);
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

	it("colors prefix even when no body (no args)", () => {
		const msg = colorFormatter({ level: "warn", args: [] });
		expect(msg.startsWith("\x1b")).toBe(true);
		expect(msg).toContain("[WARN]");
		expect(msg.endsWith(RESET_COLOR)).toBe(true);
	});

	it("supports timestamp + no body", () => {
		const msg = colorFormatter({
			level: "info",
			withTimestamp: true,
			args: [],
		});
		expect(msg.startsWith("\x1b")).toBe(true);
		expect(msg).toContain(`${fakeDatetime} [INFO]`);
		expect(msg.endsWith(RESET_COLOR)).toBe(true);
	});
});
