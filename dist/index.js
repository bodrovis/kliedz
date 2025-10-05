// src/logger/formatters.ts
import { inspect } from "util";

// src/logger/colors.ts
var LEVEL_COLORS = {
  debug: "\x1B[90m",
  // gray
  info: "\x1B[36m",
  // cyan
  warn: "\x1B[33m",
  // yellow/orange
  error: "\x1B[31m"
  // red
};
var RESET_COLOR = "\x1B[0m";
function getColorFor(level) {
  if (!(level in LEVEL_COLORS)) {
    throw new Error(`Unknown log level: "${level}"`);
  }
  return LEVEL_COLORS[level];
}

// src/logger/formatters.ts
var plainFormatter = (config) => {
  const prefix = getPrefix(config);
  const body = config.args.map(formatArg).join(" ");
  return body ? `${prefix} ${body}` : prefix;
};
var colorFormatter = (config) => {
  const color = getColorFor(config.level);
  const prefix = getPrefix(config);
  const body = config.args.map(formatArg).join(" ");
  const line = body ? `${prefix} ${body}` : prefix;
  return `${color}${line}${RESET_COLOR}`;
};
function formatArg(arg) {
  if (typeof arg === "undefined") return "undefined";
  if (arg instanceof Error)
    return `${arg.name}: ${arg.message}
${arg.stack ?? ""}`;
  if (typeof arg === "string") return arg;
  if (typeof arg === "bigint") return `${arg}n`;
  if (typeof arg === "function")
    return `[Function ${arg.name || "anonymous"}]`;
  if (typeof arg === "object" && arg !== null) {
    try {
      return JSON.stringify(arg, jsonReplacer);
    } catch {
      try {
        return inspect(arg, { depth: null, breakLength: Infinity });
      } catch {
        return "[Unserializable Object]";
      }
    }
  }
  return String(arg);
}
function jsonReplacer(_k, v) {
  if (typeof v === "bigint") return String(v);
  if (typeof v === "symbol") return v.toString();
  if (v instanceof Map) return Object.fromEntries(v);
  if (v instanceof Set) return Array.from(v);
  return v;
}
function getPrefix({
  level,
  prefixBuilder,
  withTimestamp = false
}) {
  if (typeof prefixBuilder === "function") {
    return prefixBuilder();
  }
  const timestamp = withTimestamp ? `${(/* @__PURE__ */ new Date()).toISOString()} ` : "";
  return `${timestamp}[${level.toUpperCase()}]`;
}

// src/logger/emitter.ts
var CONSOLE_METHODS = {
  debug: "log",
  info: "info",
  warn: "warn",
  error: "error"
};
function getMethodFor(level) {
  const m = CONSOLE_METHODS[level];
  if (!m) throw new Error(`Unknown method for level: "${level}"`);
  return m;
}
function emitLog(level, message) {
  const method = getMethodFor(level);
  console[method]?.(message);
}

// src/types/log_threshold.ts
var logThresholds = [
  "debug",
  "info",
  "warn",
  "error",
  "silent"
];

// src/logger/level_priority.ts
function fromEntriesStrict(entries) {
  return Object.fromEntries(entries);
}
var levelPriority = fromEntriesStrict(
  logThresholds.map(
    (level, index) => [level, level === "silent" ? Number.POSITIVE_INFINITY : index]
  )
);
function getPriorityFor(level) {
  const p = levelPriority[level];
  if (p === void 0)
    throw new Error(`Unknown log level/threshold: "${level}"`);
  return p;
}
function shouldLog(threshold, level) {
  return getPriorityFor(level) >= getPriorityFor(threshold);
}

// src/logger/log_core.ts
function logCore(params, formatter, ...args) {
  const {
    level,
    prefixBuilder,
    threshold = "info",
    withTimestamp = false
  } = params;
  if (!shouldLog(threshold, level)) return;
  const msg = formatter({
    level,
    args,
    withTimestamp,
    ...prefixBuilder ? { prefixBuilder } : {}
  });
  emitLog(level, msg);
}

// src/logger/loggers.ts
var DEFAULT_LOG_PARAMS = Object.freeze({
  level: "info",
  threshold: "info"
});
var createLogger = (formatter) => {
  return (first, ...rest) => {
    const provided = isLogParams(first) ? first : void 0;
    const params = { ...DEFAULT_LOG_PARAMS, ...provided };
    const args = provided ? rest : [first, ...rest];
    logCore(params, formatter, ...args);
  };
};
var logWithColor = createLogger(colorFormatter);
var logWithLevel = createLogger(plainFormatter);
function isLogParams(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj;
  if (typeof o.level !== "string") return false;
  if ("threshold" in o && typeof o.threshold !== "string") return false;
  if ("withTimestamp" in o && typeof o.withTimestamp !== "boolean")
    return false;
  if ("prefixBuilder" in o && typeof o.prefixBuilder !== "function")
    return false;
  return true;
}
export {
  createLogger,
  formatArg,
  getPrefix,
  logWithColor,
  logWithLevel
};
//# sourceMappingURL=index.js.map