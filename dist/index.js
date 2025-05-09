// src/logger/emitter.ts
var consoleMethods = {
  debug: "log",
  info: "info",
  warn: "warn",
  error: "error"
};
function emitLog(level, message) {
  const method = consoleMethods[level];
  console[method](message);
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
var levelPriority = Object.fromEntries(
  logThresholds.map(
    (level, index) => level === "silent" ? [level, 999] : [level, index]
  )
);
function shouldLog(threshold, level) {
  return levelPriority[level] >= levelPriority[threshold];
}

// src/logger/log_with_level.ts
function logWithLevel(threshold, level, ...args) {
  if (!shouldLog(threshold, level)) return;
  const prefix = `[${level.toUpperCase()}]`;
  const msg = [prefix, ...args].map(String).join(" ");
  emitLog(level, msg);
}

// src/logger/log_with_color.ts
var RESET = "\x1B[0m";
var levelColor = {
  debug: "\x1B[90m",
  // gray
  info: "\x1B[36m",
  // cyan
  warn: "\x1B[33m",
  // yellow/orange
  error: "\x1B[31m"
  // red
};
function logWithColor(threshold, level, ...args) {
  if (!shouldLog(threshold, level)) return;
  const color = levelColor[level];
  const prefix = `[${level.toUpperCase()}]`;
  const body = args.map(String).join(" ");
  const colored = `${color}${prefix} ${body}${RESET}`;
  emitLog(level, colored);
}
export {
  logWithColor,
  logWithLevel
};
//# sourceMappingURL=index.js.map