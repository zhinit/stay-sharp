# Bun File I/O

[[bun|Bun]] provides file I/O through `Bun.file()` for reading and `Bun.write()` for writing, both optimized with platform-specific system calls (source: bun-docs-file-io-2026.md).

## Reading with Bun.file()

`Bun.file(path)` creates a `BunFile`, a lazily-loaded file reference that does not read from disk on creation (source: bun-docs-file-io-2026.md). File references can be created from file paths (relative to cwd), numerical file descriptors, or `file://` URLs.

Properties available without reading the file: `.size` (byte count) and `.type` (MIME type). A second argument to `Bun.file()` can override the default MIME type (source: bun-docs-file-io-2026.md).

`BunFile` conforms to the `Blob` interface. Reading methods include (source: bun-docs-file-io-2026.md):

- `.text()` returns file contents as a string
- `.json()` parses the file as JSON
- `.stream()` returns a `ReadableStream`
- `.arrayBuffer()` returns an `ArrayBuffer`
- `.bytes()` returns a `Uint8Array`

Additional methods: `.exists()` checks whether the file exists on disk, and `.delete()` removes it (source: bun-docs-file-io-2026.md).

## Writing with Bun.write()

`Bun.write(destination, data)` writes data to a destination, which can be a file path, URL, or `BunFile` instance. The data argument accepts strings, Blobs, ArrayBuffers, TypedArrays, and HTTP Responses (source: bun-docs-file-io-2026.md).

Bun selects the optimal platform-specific system call automatically: `copy_file_range` and `sendfile` on Linux, `fcopyfile` on macOS (source: bun-docs-file-io-2026.md). This makes file-to-file copies and HTTP response-to-disk writes particularly efficient.

## Incremental writing with FileSink

For buffered, incremental writes, access a `FileSink` via `file.writer()`. The FileSink supports configurable high water marks for automatic flushing, manual `.flush()` calls, and process lifecycle management through `.ref()` and `.unref()` (source: bun-docs-file-io-2026.md).

## Standard streams

The standard I/O streams are available as `Bun.stdin`, `Bun.stdout`, and `Bun.stderr`, each behaving as a `BunFile` (source: bun-docs-file-io-2026.md).

## Directory operations

Directory listing and creation use the `node:fs` module: `readdir()` for listing files and `mkdir()` for creation, with options for recursive operations (source: bun-docs-file-io-2026.md).

**Related pages:** [[bun]], [[bun-runtime]], [[bun-http-server]], [[bun-shell]]
