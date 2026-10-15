# Kliedz

![npm](https://img.shields.io/npm/v/kliedz)
![CI](https://github.com/bodrovis/kliedz/actions/workflows/ci.yml/badge.svg)
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![Code Coverage][coverage-image]][coverage-url]
[![Maintainability][maintainability-image]][maintainability-url]

**Kliedz** is a stateless logging utility for JavaScript and TypeScript, built using a functional approach.

## Installation

```bash
npm install kliedz
```

## What is this?

Kliedz is a simple logging system for JS/TS. It lets you conditionally log messages based on a configured log level — without storing state, mutating anything, or pulling in extra runtime dependencies.

It works around two main concepts: **level** and **threshold**.

### `level`

The severity of the message you're logging. It also determines which `console` method is used:

- `debug` → `console.log()`
- `info` → `console.info()`
- `warn` → `console.warn()`
- `error` → `console.error()`

### `threshold`

A cutoff filter: only messages with `level >= threshold` will be printed. Think of `threshold` as the minimum severity required to be shown. This is useful when log visibility is controlled by a user or environment (e.g. `--verbose`).

Supported values:

- `debug` → everything logs
- `info` → skips only `debug` (default)
- `warn` → logs only `warn` and `error`
- `error` → logs only `error`
- `silent` → disables all logging

## Usage

```js
import { logWithColor, logWithLevel } from "kliedz";

// Quick start
logWithColor("Hey!");
logWithLevel.withParams({ level: "warn" }, "Something feels off");

// ─────────────────────────────────────────────────────────────────────────────
// Basic "just log it" call (uses default level = "info", threshold = "info")
// ─────────────────────────────────────────────────────────────────────────────

logWithColor("Hello from the default logger");
// [INFO] Hello from the default logger
// printed in cyan

logWithLevel("Just a plain info message", 42);
// [INFO] Just a plain info message 42
// printed without color

// Objects are always treated as message data in regular calls
logWithLevel({ level: "warn", message: "This is just an object" });
// [INFO] {"level":"warn","message":"This is just an object"}

// ─────────────────────────────────────────────────────────────────────────────
// Fully configured log call
// ─────────────────────────────────────────────────────────────────────────────

logWithColor.withParams(
  {
    level: "warn", // threshold is optional, defaults to "info"
  },
  "This is a warning with color",
);
// [WARN] This is a warning with color
// printed in yellow

logWithLevel.withParams(
  {
    level: "debug",
    threshold: "debug",
  },
  "Low-level debug info",
);
// [DEBUG] Low-level debug info
// printed without color

// ─────────────────────────────────────────────────────────────────────────────
// Including a timestamp in the prefix
// ─────────────────────────────────────────────────────────────────────────────

logWithColor.withParams(
  {
    level: "error",
    threshold: "debug",
    withTimestamp: true,
  },
  "Error occurred!",
);
// 2025-05-10T13:52:59.845Z [ERROR] Error occurred!

logWithLevel.withParams(
  {
    level: "info",
    threshold: "debug",
    withTimestamp: true,
  },
  "Startup complete",
);
// 2025-05-10T13:53:15.240Z [INFO] Startup complete

// ─────────────────────────────────────────────────────────────────────────────
// With a custom prefixBuilder
// ─────────────────────────────────────────────────────────────────────────────

logWithLevel.withParams(
  {
    level: "info",
    threshold: "debug",
    prefixBuilder: () => ">>> INFO <<<",
  },
  "Using a custom prefix builder",
);
// >>> INFO <<< Using a custom prefix builder

logWithColor.withParams(
  {
    level: "warn",
    prefixBuilder: () => {
      const ts = new Date().toISOString();
      return `!!${ts}[WARNING]!!`;
    },
  },
  "Custom warning with timestamped prefix",
);
// !!2025-05-10T14:03:32.302Z[WARNING]!! Custom warning with timestamped prefix
```

## How it works

This package provides two main logging functions:

- **`logWithLevel()`** — logs plain messages without colors.
- **`logWithColor()`** — logs messages with ANSI colors based on their severity.

Both functions use the same core logic and support two ways of logging messages.

### Option 1: Just log something (default config)

If you want to log without specifying configuration:

```ts
logWithColor("hello world");
logWithLevel("something happened", { id: 123 });
```

This uses the default settings:

- `level`: `"info"`
- `threshold`: `"info"`

All arguments are treated as message data, including objects containing properties such as `level` or `threshold`.

### Option 2: Log with full control

To configure a log message, use the `withParams()` method:

```ts
logWithColor.withParams(
  { level: "warn", threshold: "debug", withTimestamp: true },
  "warning issued",
);

logWithLevel.withParams(
  { level: "debug", threshold: "warn" },
  "this will be filtered out",
);
```

The first argument to `withParams()` is a `LogParams` object. All subsequent arguments are message data.

You can control:

- `level`: The severity of the current message (`"debug"`, `"info"`, `"warn"`, `"error"`). Required.
- `threshold`: The cutoff level. Only messages with `level >= threshold` are printed. Defaults to `"info"`.
- `withTimestamp`: If `true`, includes an ISO timestamp in the prefix.
- `prefixBuilder`: Optional function to fully customize the prefix format. Overrides the default prefix, including the timestamp.

## Creating a custom logger

You can create a logger with your own formatting logic using `createLogger()`.

For example, this formatter produces JSON output:

```ts
import { createLogger, getPrefix, formatArg } from "kliedz";
import type { Formatter, FormatterConfig } from "kliedz";

// Define a custom formatter
const jsonFormatter: Formatter = (config: FormatterConfig): string => {
  const prefix = getPrefix(config);

  // Convert message arguments into strings
  const message = config.args.map(formatArg).join(" ");

  // Return the final formatted log message
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: config.level,
    prefix,
    message,
  });
};

// Create a logger with the custom formatter
const logJson = createLogger(jsonFormatter);

// Default configuration
logJson("This is a default info log");

// Custom level and threshold
logJson.withParams(
  { level: "warn" },
  "Something might be wrong",
  { id: 123 },
);

// Custom timestamp and error logging
logJson.withParams(
  { level: "error", withTimestamp: true },
  new Error("kaboom"),
);
```

Custom loggers support the same methods as the built-in loggers:

- `logger(message, ...args)` — uses the default configuration.
- `logger.withParams(params, ...args)` — uses the supplied configuration, merged with the defaults.

The formatter receives a `FormatterConfig` object containing the current log level, message arguments, timestamp setting, and optional custom prefix builder.

It must return a string, which is then passed to the appropriate console method.

## License

Licensed under MIT.

(c) [Ilya Krukowski](https://bodrovis.tech/)

[npm-downloads-image]: https://img.shields.io/npm/dm/kliedz
[npm-downloads-url]: https://npmcharts.com/compare/kliedz?minimal=true
[coverage-image]: https://qlty.sh/gh/bodrovis/projects/kliedz/coverage.svg
[coverage-url]: https://qlty.sh/gh/bodrovis/projects/kliedz
[maintainability-image]: https://qlty.sh/gh/bodrovis/projects/kliedz/maintainability.svg
[maintainability-url]: https://qlty.sh/gh/bodrovis/projects/kliedz