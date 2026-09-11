# Bun Bundler

[[bun|Bun]] includes a native bundler for JavaScript, TypeScript, JSX, and CSS, accessible through the `bun build` CLI command or the `Bun.build()` JavaScript API (source: bun-docs-bundler-2026.md).

## Basic usage

From the CLI: `bun build ./src/index.ts --outdir ./dist`. From JavaScript (source: bun-docs-bundler-2026.md):

```typescript
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
});
```

The `--watch` flag enables incremental rebuilds on file changes (source: bun-docs-bundler-2026.md).

## Targets and formats

The `target` option controls the execution environment (source: bun-docs-bundler-2026.md):

- `browser` (default) for client-side code
- `bun` for code running under the Bun runtime
- `node` for Node.js environments

The `format` option controls the module format: `esm` (ES modules), `cjs` (CommonJS), or `iife` (immediately-invoked function expression for script tags) (source: bun-docs-bundler-2026.md).

## Optimization

**Code splitting** via the `splitting` option generates shared chunks for code imported by multiple entry points (source: bun-docs-bundler-2026.md).

**Tree shaking** and dead code elimination remove unused exports automatically (source: bun-docs-bundler-2026.md).

**Minification** is enabled with `--minify` and supports granular control over whitespace, identifiers, and syntax separately (source: bun-docs-bundler-2026.md).

**`optimizeImports`** skips parsing unused submodules from barrel files, reducing bundle size for libraries with large re-export indexes (source: bun-docs-bundler-2026.md).

## Source maps

Three source map modes are available via the `sourcemap` option: `linked` (separate .map file), `inline` (embedded in the output), and `external` (generated but not referenced) (source: bun-docs-bundler-2026.md).

## Output control

The `naming` option customizes generated filenames using tokens like `[name]`, `[hash]`, and `[dir]`. The `publicPath` option adds a prefix to import paths in bundled code. The `external` option marks imports to exclude from the bundle (source: bun-docs-bundler-2026.md).

## Plugins and loaders

Custom bundler plugins extend the build pipeline (source: bun-docs-bundler-2026.md). The `loader` option maps file extensions to built-in loaders. The bundler natively handles `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.jsonc`, `.toml`, `.yaml`, `.css`, `.html`, `.wasm`, and `.node` files (source: bun-docs-bundler-2026.md).

## Compile-time features

**`define`** replaces global identifiers with constants at build time (source: bun-docs-bundler-2026.md).

**`features`** enables compile-time feature flags for dead code elimination (source: bun-docs-bundler-2026.md).

**`drop`** removes function calls entirely, such as `console` or `debugger` statements (source: bun-docs-bundler-2026.md).

**`env`** controls environment variable injection: `inline` bakes values in, `disable` excludes them, or a prefix string limits which variables are included (source: bun-docs-bundler-2026.md).

## Bytecode

With `target: "bun"`, the `bytecode` option generates precompiled bytecode for faster startup. This only works with the Bun target (source: bun-docs-bundler-2026.md).

## Compile to standalone binary

The `--compile` flag produces a self-contained executable that bundles the runtime with the application (source: bun-docs-executables-2026.md):

```bash
bun build ./src/cli.ts --compile --outfile ./bin/mycli
```

Cross-compilation targets specific platforms via `--target` (source: bun-docs-executables-2026.md):

```bash
bun build ./src/cli.ts --compile --target=bun-linux-x64 --outfile ./bin/mycli-linux
bun build ./src/cli.ts --compile --target=bun-darwin-arm64 --outfile ./bin/mycli-mac
bun build ./src/cli.ts --compile --target=bun-windows-x64 --outfile ./bin/mycli.exe
```

Supported targets: `bun-linux-x64`, `bun-linux-arm64`, `bun-linux-x64-musl`, `bun-linux-arm64-musl`, `bun-windows-x64`, `bun-windows-arm64`, `bun-darwin-x64`, `bun-darwin-arm64` (source: bun-docs-executables-2026.md).

The resulting executables are 50-100 MB with sub-millisecond startup, requiring no external runtime on the target machine (source: deployhq-bun-cheatsheet-2026.md).

### Production optimization

Combine flags for production builds (source: bun-docs-executables-2026.md):

```bash
bun build --compile --minify --sourcemap --bytecode ./app.ts --outfile myapp
```

`--bytecode` moves parsing overhead from runtime to build time (approximately 2x faster startup for tools like tsc) (source: bun-docs-executables-2026.md).

### Asset embedding

Embed files into the executable using import attributes (source: bun-docs-executables-2026.md):

```javascript
import icon from "./icon.png" with { type: "file" };
import config from "./config.json" with { type: "file" };
import template from "./email.html" with { type: "text" };
```

Embed entire directories with `--asset`:

```bash
bun build --compile ./index.ts --asset ./public --outfile myapp
```

Embedded files live in the `$bunfs` virtual filesystem (`/$bunfs/root/...` on Unix, `B:\~BUN\...` on Windows). Standard `require.resolve()` and path resolution do not work inside `$bunfs`. Access embedded files through `Bun.embeddedFiles` or the import attribute pattern (source: bun-docs-executables-2026.md).

### Detecting standalone mode

```javascript
if (Bun.isStandaloneExecutable) {
  // Running from compiled binary
}
```

List embedded files at runtime (source: bun-docs-executables-2026.md):

```javascript
for (const blob of Bun.embeddedFiles) {
  console.log(`${blob.name} - ${blob.size} bytes`);
}
```

### Unsupported flags

`--compile` does not support `--outdir`, `--public-path`, `--target=node`, or `--no-bundle` (source: bun-docs-executables-2026.md).

## Build output

`Bun.build()` returns a `BuildOutput` object containing an `outputs` array of `BuildArtifact` objects (Blobs with metadata), a `success` boolean, `logs` for warnings, and an optional `metafile` for build analysis (source: bun-docs-bundler-2026.md).

**Related pages:** [[bun]], [[bun-runtime]], [[bun-configuration]], [[bun-modules]]
