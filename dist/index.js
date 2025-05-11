// src/logger/colors.ts
var RESET_COLOR = "\x1B[0m";
function getColorFor(level) {
  if (!(level in LEVEL_COLORS)) {
    throw new Error(`Unknown log level: "${level}"`);
  }
  return LEVEL_COLORS[level];
}
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

// src/logger/formatters.ts
var plainFormatter = (config) => {
  const prefix = getPrefix(config);
  const body = config.args.map(formatArg).join(" ");
  return `${prefix} ${body}`;
};
var colorFormatter = (config) => {
  const color = getColorFor(config.level);
  const prefix = getPrefix(config);
  const body = config.args.map(formatArg).join(" ");
  return `${color}${prefix} ${body}${RESET_COLOR}`;
};
function formatArg(arg) {
  if (typeof arg === "undefined") return "undefined";
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}
${arg.stack ?? ""}`;
  }
  if (typeof arg === "object" && arg !== null) {
    try {
      return JSON.stringify(arg);
    } catch {
      return "[Unserializable Object]";
    }
  }
  return String(arg);
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
function emitLog(level, message) {
  const method = getMethodFor(level);
  console[method]?.(message);
}
function getMethodFor(level) {
  if (!(level in CONSOLE_METHODS)) {
    throw new Error(`Unknown method for level: "${level}"`);
  }
  return CONSOLE_METHODS[level];
}
var CONSOLE_METHODS = {
  debug: "log",
  info: "info",
  warn: "warn",
  error: "error"
};

// src/types/log_threshold.ts
var logThresholds = [
  "debug",
  "info",
  "warn",
  "error",
  "silent"
];

// src/logger/level_priority.ts
var levelPriority = Object.fromEntries(
  logThresholds.map(
    (level, index) => level === "silent" ? [level, 999] : [level, index]
  )
);
function getPriorityFor(level) {
  if (!(level in levelPriority)) {
    throw new Error(`Unknown log level/threshold: "${level}"`);
  }
  return levelPriority[level];
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
  const msg = formatter({ level, args, prefixBuilder, withTimestamp });
  emitLog(level, msg);
}

// src/logger/loggers.ts
var DEFAULT_LOG_PARAMS = {
  level: "info",
  threshold: "info"
};
var createLogger = (formatter) => {
  return (first, ...rest) => {
    const params = isLogParams(first) ? first : DEFAULT_LOG_PARAMS;
    const args = isLogParams(first) ? rest : [first, ...rest];
    logCore(params, formatter, ...args);
  };
};
var logWithColor = createLogger(colorFormatter);
var logWithLevel = createLogger(plainFormatter);
function isLogParams(obj) {
  return typeof obj === "object" && obj !== null && "level" in obj && typeof obj.level === "string";
}
export {
  createLogger,
  formatArg,
  getPrefix,
  logWithColor,
  logWithLevel
};
//# sourceMappingURL=index.js.map