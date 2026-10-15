# Changelog

## 3.0.0 (15-Oct-2026)

### Breaking changes

- **Redesigned the logging API to remove ambiguous argument handling.** Logger configuration must now be passed explicitly using the new `withParams()` method.
- Removed automatic `LogParams` detection based on the first argument. Regular logger calls now treat all arguments as message data, including objects containing `level`, `threshold`, or other configuration-like properties.
- Updated the `LogFunction` type to reflect the new API and removed the previous overload signatures.

**Migration example:**

Before:

```ts
logWithLevel({ level: "warn", threshold: "debug" }, "Warning!");
```

After:

```ts
logWithLevel.withParams(
  { level: "warn", threshold: "debug" },
  "Warning!",
);
```

Calls without custom configuration remain unchanged:

```ts
logWithLevel("Hello!", { userId: 123 });
```

The same changes apply to `logWithColor()` and custom loggers created using `createLogger()`.

### Fixed

- Prevented duplicated error names and messages when formatting `Error` instances with stack traces.
- Fixed handling of objects whose `toJSON()` method returns `undefined`, ensuring they are not silently omitted from log output.
- Prevented data loss when serializing `Map` instances with non-string keys by representing maps as arrays of entries.
- Improved log level and threshold validation to reject inherited object properties such as `toString`.

### Changed

- Preserved the console method's calling context when emitting messages.
- Made the log level priority mapping immutable.
- Expanded test coverage for argument handling, serialization edge cases, invalid log levels, and logging failures.

## 2.2.1 (01-Sep-2026)

* Update dependencies
* Minor code fixes

## 2.2.0 (13-Jul-2026)

* Use TypeScript 7

## 2.1.3 (01-May-2026)

* Update dependencies
* Fix entrypoint

## 2.1.0 (06-Apr-2026)

* Use Typescript 6

## 2.0.0 (17-Dec-2025)

* Require Node 20+

## 1.1.0

* Stricter logic, various code updates

## 1.0.1 (11-May-2025)

* Initial release
