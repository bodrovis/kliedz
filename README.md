# Kliedz

![npm](https://img.shields.io/npm/v/kliedz)
![CI](https://github.com/bodrovis/kliedz/actions/workflows/ci.yml/badge.svg)
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![Code Coverage][coverage-image]][coverage-url]
[![Maintainability][maintainability-image]][maintainability-url]

**Kliedz** is a stateless logging utility for JavaScript and TypeScript.

## Installation

```
npm install kliedz
```

## What is this?

This is a simple logging system for JS/TS. It lets you conditionally log messages based on a configured log level — without storing state, mutating anything, or pulling in extra dependencies.

It works around two main concepts: **level** and **threshold**.

### `level`

The severity of the message you're logging that also determines how the message is printed (which `console` method is used):

- `debug` → `console.log()`
- `info`  → `console.info()`
- `warn`  → `console.warn()`
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
import { logWithColor, logWithLevel } from "./logger";

// ─────────────────────────────────────────────────────────────────────────────
// Basic "just log it" call (uses default level = "info", threshold = "info")
// ─────────────────────────────────────────────────────────────────────────────

logWithColor("Hello from the default logger");
// [INFO] Hello from the default logger
// printed in cyan color

logWithLevel("Just a plain info message", 42);
// [INFO] Just a plain info message 42
// printed without color

// ─────────────────────────────────────────────────────────────────────────────
// Fully configured log call
// ─────────────────────────────────────────────────────────────────────────────

logWithColor(
  {
    level: "warn", // threshold, is optional, defaults to "info"
  },
  "This is a warning with color"
);
// [WARN] This is a warning with color
// printed in orange

logWithLevel(
  {
    level: "debug",
    threshold: "debug",
  },
  "Low-level debug info"
);
// [DEBUG] Low-level debug info
// printed without color

// ─────────────────────────────────────────────────────────────────────────────
// Including a timestamp in the prefix
// ─────────────────────────────────────────────────────────────────────────────

logWithColor(
  {
    level: "error",
    threshold: "debug",
    withTimestamp: true,
  },
  "Error occurred!",
);
// 2025-05-10T13:52:59.845Z [ERROR] Error occurred!

logWithLevel(
  {
    level: "info",
    threshold: "debug",
    withTimestamp: true,
  },
  "Startup complete"
);
// 2025-05-10T13:53:15.240Z [INFO] Startup complete

// ─────────────────────────────────────────────────────────────────────────────
// With a custom prefixBuilder
// ─────────────────────────────────────────────────────────────────────────────

logWithLevel(
  {
    level: "info",
    threshold: "debug",
    prefixBuilder: () => ">>> INFO <<<",
  },
  "Using a custom prefix builder"
);
// >>> INFO <<< Using a custom prefix builder

logWithColor(
  {
    level: "warn",
    prefixBuilder: () => {
      const ts = new Date().toISOString();
      return `!!${ts}[WARNING]!!`;
    },
  },
  "Custom warning with timestamped prefix"
);
// !!2025-05-10T14:03:32.302Z[WARNING]!! Custom warning with timestamped prefix
```

## How it works

This package provides two main logging functions:

- **`logWithLevel()`** – logs plain messages (no colors)
- **`logWithColor()`** – logs messages with ANSI-colored `[LEVEL]` prefixes

Both functions use the same core logic under the hood. You can call them in two ways:

### Option 1: Just log something (default config)

If you just want to log without caring about configuration:

```ts
logWithColor("hello world");
logWithLevel("something happened", { id: 123 });
```

This uses default settings:

- `level`: `"info"`
- `threshold`: `"info"` (so messages with level `"info"`, `"warn"`, or `"error"` will be printed)

### Option 2: Log with full control

If you need to configure how a message is treated, pass a `LogParams` object as the first argument:

```ts
logWithColor(
  { level: "warn", threshold: "debug", withTimestamp: true },
  "warning issued"
);

logWithLevel(
  { level: "debug", threshold: "warn" },
  "this will be filtered out"
);
```

You can control:

- `level`: The severity of the current message (`"debug"`, `"info"`, `"warn"`, `"error"`)
- `threshold`: The cutoff level. Only messages with `level >= threshold` are printed.
- `withTimestamp`: If true, includes an ISO timestamp in the prefix.
- `prefixBuilder`: Optional function to fully customize the prefix format.

## License

Licensed under MIT.

(c) [Ilya Krukowski](https://bodrovis.tech/)

[npm-downloads-image]: https://badgen.net/npm/dm/kliedz
[npm-downloads-url]: https://npmcharts.com/compare/kliedz?minimal=true
[coverage-image]: https://qlty.sh/badges/42567da8-5e74-410b-846f-74160289b944/test_coverage.svg
[coverage-url]: https://qlty.sh/gh/bodrovis/projects/kliedz
[maintainability-image]: https://qlty.sh/badges/42567da8-5e74-410b-846f-74160289b944/maintainability.svg
[maintainability-url]: https://qlty.sh/gh/bodrovis/projects/kliedz