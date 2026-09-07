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

The `--compile` flag produces a self-contained executable that bundles the runtime with the application (source: deployhq-bun-cheatsheet-2026.md):

```bash
bun build ./src/cli.ts --compile --outfile ./bin/mycli
```

Cross-compilation targets specific platforms (source: deployhq-bun-cheatsheet-2026.md):

```bash
bun build ./src/cli.ts --compile --target=bun-linux-x64 --outfile ./bin/mycli-linux
bun build ./src/cli.ts --compile --target=bun-darwin-arm64 --outfile ./bin/mycli-mac
bun build ./src/cli.ts --compile --target=bun-windows-x64 --outfile ./bin/mycli.exe
```

The resulting executables are 50-100 MB with sub-millisecond startup, requiring no external runtime on the target machine (source: deployhq-bun-cheatsheet-2026.md).

## Build output

`Bun.build()` returns a `BuildOutput` object containing an `outputs` array of `BuildArtifact` objects (Blobs with metadata), a `success` boolean, `logs` for warnings, and an optional `metafile` for build analysis (source: bun-docs-bundler-2026.md).

**Related pages:** [[bun]], [[bun-runtime]], [[bun-configuration]], [[bun-modules]]
