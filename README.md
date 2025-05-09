# Kliedz

**Kliedz** is a dead-simple, stateless logging utility for JavaScript and TypeScript.

It lets you conditionally log messages based on a configured log level — without storing state, mutating anything, or introducing extra dependencies.

## Installation

```
npm install kliedz
```

## Usage

```js
import { logWithLevel, logWithColor } from "kliedz";

const logLevel = "info"; // configured by user or environment

logWithLevel(logLevel, "debug", "some debug info");       // won't log
logWithLevel(logLevel, "info", "hello info");             // logs
logWithLevel(logLevel, "error", "something exploded");    // logs

logWithColor(logLevel, "error", "Boom");                  // printed in red
```

## How it works

This package provides two main logging functions:

- **`logWithLevel()`** – logs plain messages (no colors)
- **`logWithColor()`** – logs messages with ANSI-colored `[LEVEL]` prefixes

Both perform the same core logic: they check whether a message should be printed based on a user-defined `threshold` and the severity `level` of the message.

If the `level` is equal to or more severe than the `threshold`, the message is printed using the appropriate console method (`console.log`, `console.warn`, etc.).

### Parameters

All logging functions accept the same arguments:

- `threshold` – the minimum level required to allow printing.
  + Must be one of: `"debug"`, `"info"`, `"warn"`, `"error"`, or `"silent"`
- `level` – the severity level of the current message.
  + Must be one of: `"debug"`, `"info"`, `"warn"`, or `"error"`
- `...args` – any values you want to log. These are joined with spaces, like `console.log(...args)`

## Examples

```js
const userLogLevel = process.env.LOG_LEVEL as LogLevel || "warn";

logWithLevel(userLogLevel, "debug", "Too verbose"); // skipped
logWithLevel(userLogLevel, "warn", "Careful!");     // printed
logWithLevel(userLogLevel, "error", "Boom");        // printed

logWithColor(userLogLevel, "debug", "Too verbose"); // skipped
logWithColor(userLogLevel, "warn", "Careful!");     // printed in yellow
logWithColor(userLogLevel, "error", "Boom");        // printed in red
```

If you're building a client or SDK, store the log level in a config object and pass it through:

```js
class MyClient {
	constructor(private logLevel: LogLevel) {}

	doSomething() {
		logWithLevel(this.logLevel, "info", "doing stuff...");
	}
}
```

## License

Licensed under MIT.

(c) [Ilya Krukowski](https://bodrovis.tech/)