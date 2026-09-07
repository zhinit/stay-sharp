# Bun Runtime

The [[bun|Bun]] runtime executes JavaScript and TypeScript files with native transpilation and significantly lower startup overhead than Node.js.

## Startup performance

Bun processes start approximately 4x faster than Node.js on Linux: 5.2ms versus 25.1ms for a Hello World script (source: bun-docs-runtime-2026.md). Package.json script execution takes roughly 6ms compared to 170ms with npm (source: bun-docs-runtime-2026.md).

## Execution

Run files with `bun run index.js` or the shorthand `bun index.tsx`. The runtime automatically transpiles TypeScript and JSX without additional configuration (source: bun-docs-overview-2026.md). No `tsc` or separate transpiler step is needed.

Package.json scripts run via `bun run <script>` or the shorthand `bun <script>` when there is no filename collision (source: bun-docs-runtime-2026.md).

Bun can execute code from stdin: `echo "console.log('hello')" | bun run -` (source: bun-docs-runtime-2026.md).

## Watch and hot reload

Two modes handle file-change reloading (source: deployhq-bun-cheatsheet-2026.md):

- `bun --watch run index.tsx` restarts the process on file changes, giving a clean process each time. Flags must precede the script name (source: bun-docs-runtime-2026.md).
- `bun --hot server.ts` performs hot reload that preserves application state between reloads, including database connections and in-memory caches. This is suited to long-running servers (source: deployhq-bun-cheatsheet-2026.md).

## Runtime flags

**Memory:** `--smol` reduces memory consumption by triggering more frequent garbage collection at the cost of throughput (source: bun-docs-runtime-2026.md).

**Debugging:** `--inspect`, `--inspect-wait`, and `--inspect-brk` activate the debugger at different lifecycle points (source: bun-docs-runtime-2026.md).

**Output:** `--console-depth` (default 2) controls how deeply nested objects are printed in console output (source: bun-docs-runtime-2026.md).

**Transpilation:** `--loader`, `--define`, `--drop`, and `--jsx-runtime` customize how files are compiled before execution (source: bun-docs-runtime-2026.md).

**Networking:** `--port`, `--max-http-header-size`, `--dns-result-order`, and `--user-agent` configure network behavior (source: bun-docs-runtime-2026.md).

## Monorepo support

The `--filter` argument runs scripts across multiple workspace packages using pattern matching (source: bun-docs-runtime-2026.md).

## Node.js compatibility

Bun implements Node.js-compatible globals and modules, supporting both ESM and CommonJS (source: bun-docs-overview-2026.md). See [[bun-modules]] for resolution details.

## Web-standard APIs

The runtime provides web-standard APIs including `fetch`, `WebSocket`, and `ReadableStream` (source: bun-docs-overview-2026.md). Environment variables are accessible through both `Bun.env.KEY` and the Node.js-compatible `process.env.KEY` (source: deployhq-bun-cheatsheet-2026.md).

**Related pages:** [[bun]], [[bun-modules]], [[bun-configuration]], [[bun-shell]]
