import type { Formatter } from "../types/formatter.js";
import type { LogParams } from "../types/log_params.js";
import { emitLog } from "./emitter.js";
import { shouldLog } from "./level_priority.js";

/**
 * Core logging function that handles level filtering, formatting, and emitting.
 *
 * - Skips logging if `shouldLog(threshold, level)` returns false.
 * - Uses the provided `formatter` to convert log args to a string.
 * - Passes the final message to `emitLog`.
 *
 * @param params - Log configuration: level, threshold, and optional timestamp.
 * @param formatter - Function that formats the log message.
 * @param args - Arbitrary message arguments to be logged.
 */
export function logCore(
	params: LogParams,
	formatter: Formatter,
	...args: unknown[]
): void {
	const {
		level,
		prefixBuilder,
		threshold = "info",
		withTimestamp = false,
	} = params;

	if (!shouldLog(threshold, level)) return;

	try {
		const msg = formatter({
			level,
			args,
			withTimestamp,
			...(prefixBuilder ? { prefixBuilder } : {}),
		});
		emitLog(level, msg);
	} catch (err) {
		try {
			const fallback =
				`[logging-error @ ${new Date().toISOString()}] ` +
				(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
			console.error(fallback);
		} catch {}
	}
}
