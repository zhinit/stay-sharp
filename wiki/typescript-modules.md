# TypeScript Modules

## Scripts vs modules

A file without a top-level `import`, `export`, or top-level `await` is treated as a script whose contents are in the global scope. A file with any of those is a module with its own scope. To force a file into module mode without exporting anything, add `export {};` (source: typescript-handbook-modules-2026.md).

TypeScript's `namespaces` predate ES Modules and are not recommended for new code (source: typescript-handbook-modules-2026.md).

## The `module` compiler option

The `module` option controls output format and informs the compiler about module kind detection, interop rules, and available features like `import.meta` and top-level `await`. Choosing the right value matters even with `noEmit`, because it affects type checking and module resolution (source: typescript-modules-theory-2026.md).

Key values:

- **`node16` / `node18` / `nodenext`** emit files as either CJS or ESM based on file extension and `package.json` `"type"` field. These are the only correct values for Node.js projects (source: typescript-modules-reference-2026.md). `node18` adds import attributes. `nodenext` is a moving target; as of TS 5.8 it supports `require()` of ESM (source: typescript-modules-theory-2026.md).
- **`esnext`** emits all files as ESM. Use with `moduleResolution: "bundler"` for bundled apps. Do not use for Node.js (source: typescript-modules-reference-2026.md).
- **`preserve`** (TS 5.4+) passes ESM imports/exports through as-is and emits `import x = require(...)` as CJS `require`. Best reflects bundler and Bun capabilities (source: typescript-modules-reference-2026.md).
- **`commonjs`** emits all files as CJS. Legacy; prefer `nodenext` (source: typescript-modules-reference-2026.md).
- **`amd`, `umd`, `system`** are no longer recommended and scheduled for deprecation in TS 6.0 (source: typescript-modules-theory-2026.md).

## The `moduleResolution` compiler option

Controls how TypeScript resolves module specifiers (the string in `import`/`require`) to files on disk. Must match the host's resolution algorithm (source: typescript-modules-reference-2026.md).

Key values:

- **`node16` / `nodenext`** model Node.js v12+ resolution. ESM imports require file extensions and cannot use directory index resolution. CJS `require` calls allow extensionless paths and directory modules. Enforced to pair with `module: node16`/`nodenext` (source: typescript-modules-reference-2026.md).
- **`bundler`** supports `package.json` `"exports"` and `"imports"` like `node16`, but allows extensionless paths and directory modules everywhere (like CJS resolution). Requires `module: "esnext"` or `"preserve"` (source: typescript-modules-reference-2026.md).
- **`node10`** (formerly `node`) models pre-v12 Node.js CJS resolution only. No `"exports"` support. Should not be used for new projects (source: typescript-modules-reference-2026.md).
- **`classic`** is TypeScript's oldest mode. Should not be used; scheduled for deprecation in TS 6.0 (source: typescript-modules-reference-2026.md).

## Module format detection

Under `node16`/`nodenext`, TypeScript determines each file's format the same way Node.js does:

- `.mts` / `.mjs` / `.d.mts` are always ESM.
- `.cts` / `.cjs` / `.d.cts` are always CJS.
- `.ts` / `.js` / `.d.ts` are ESM if the nearest ancestor `package.json` has `"type": "module"`, otherwise CJS (source: typescript-modules-theory-2026.md).

## Import paths and extension substitution

Module specifiers are emitted as-written; TypeScript does not transform them by default. Import paths should reference the output file extension (`.js`) even when the source is `.ts`, because TypeScript resolves by modeling the host's behavior on output files (source: typescript-modules-theory-2026.md).

When resolving a `.js` path, TypeScript tries `.ts`, then `.tsx`, then `.d.ts`, then `.js` itself. For `.mjs` it tries `.mts`, `.d.mts`, `.mjs`. For `.cjs` it tries `.cts`, `.d.cts`, `.cjs` (source: typescript-modules-reference-2026.md).

The `--rewriteRelativeImportExtensions` option (TS 5.7) transforms `.ts`/`.tsx`/`.mts`/`.cts` extensions to their JS equivalents in output, allowing `.ts` extensions in source for runtimes that support it (source: typescript-modules-theory-2026.md).

## Type-only imports

`import type { Foo }` and inline `import { type Foo, bar }` are guaranteed to be elided from output. This lets non-TypeScript transpilers (Babel, swc, esbuild) safely strip type-only imports without full type analysis (source: typescript-handbook-modules-2026.md).

A type-only import declaration cannot mix a default import and named bindings. Use `import type { default as Foo, Bar }` instead (source: typescript-modules-reference-2026.md).

## `verbatimModuleSyntax`

Introduced in TS 5.0. Requires that imports and exports be written in the form closest to how they will be emitted. In CJS-emitting files, this forces `import x = require("...")` and `export = ...` syntax instead of ESM `import`/`export`. This eliminates ambiguity about what kind of module a file is and sidesteps `esModuleInterop` portability issues (source: typescript-modules-theory-2026.md).

Recommended for Node.js projects using mostly ESM with some CJS files. Not recommended for projects targeting CJS that may want to migrate to ESM later (source: typescript-modules-theory-2026.md).

## ESM/CJS interoperability

### The `__esModule` flag

Transpilers (Babel, tsc with `esModuleInterop`) mark their CJS output with `exports.__esModule = true` to distinguish transpiled-from-ESM modules from true CJS. A transpiled default import checks this flag: if present, it links to `exports.default`; if absent, it links to the whole `exports` object (source: typescript-modules-esm-cjs-interop-2026.md).

### The "double default" problem

Node.js does not respect the `__esModule` flag. It always synthesizes a default export from the entire `exports` object. A transpiled module with `exports.default = fn` will be callable as `fn()` when imported by another transpiled module, but requires `fn.default()` when imported by true ESM in Node.js (source: typescript-modules-esm-cjs-interop-2026.md).

### Named exports from CJS

Node.js uses syntactic analysis to synthesize named exports from CJS modules. Dynamically computed properties (e.g., `exports["worl" + "d"] = ...`) are not detected and will be missing as named imports. Accessing them via the default import always works (source: typescript-modules-esm-cjs-interop-2026.md).

### `esModuleInterop`

Enables `__esModule`-checking emit helpers for default and namespace imports when compiling to CJS, aligning tsc output with Babel/Webpack behavior. Also refines type checking to prevent spec-violating namespace imports of callable modules. Should be enabled in applications; implied by `module: nodenext` (source: typescript-modules-esm-cjs-interop-2026.md).

`allowSyntheticDefaultImports` without `esModuleInterop` changes type checking but not emit, allowing potentially unsafe code. Prefer `esModuleInterop` or `verbatimModuleSyntax` instead (source: typescript-modules-esm-cjs-interop-2026.md).

## `package.json` fields

### `"type"`

Set to `"module"` to make `.js` files in the package be treated as ESM. Without it (or with `"type": "commonjs"`), `.js` files are CJS (source: typescript-modules-theory-2026.md).

### `"exports"`

Supported under `node16`/`nodenext`/`bundler` resolution. Maps package entry points to file paths with conditions. The `"types"` condition is always matched by TypeScript and should appear before `"default"`. The presence of `"exports"` blocks resolution of any subpath not explicitly listed (source: typescript-modules-reference-2026.md).

### `"imports"`

Package-internal `#`-prefixed import aliases, supported under `node16`/`nodenext`/`bundler`. TypeScript resolves these through the nearest ancestor `package.json`, applying extension substitution as usual. In the local project (not `node_modules`), TypeScript remaps resolved output paths back to input paths using `rootDir`/`outDir` (source: typescript-modules-reference-2026.md).

### `"main"` and `"types"`

Consulted when `"exports"` is not present (or not read). `"types"` (or legacy `"typings"`) points to the declaration file; `"main"` points to the JS entry point and undergoes extension substitution. npm shows a TS icon only if `"types"` is present (source: typescript-modules-reference-2026.md).

### `"typesVersions"`

Redirects TypeScript's resolution based on compiler version. Not read when `"exports"` is used. Patterns with `*` wildcards can redirect all imports to a versioned subdirectory (source: typescript-modules-reference-2026.md).

## Recommended configurations

**Bundler apps:** `module: "esnext"`, `moduleResolution: "bundler"`, `esModuleInterop: true`, `noEmit: true`. Optionally `verbatimModuleSyntax: true` and `allowImportingTsExtensions: true` (source: typescript-modules-choosing-options-2026.md).

**Node.js apps:** `module: "nodenext"` (implies `moduleResolution: "nodenext"`, `esModuleInterop: true`, `target: "esnext"`). Add `verbatimModuleSyntax: true`. Set `"type": "module"` in `package.json` for ESM output (source: typescript-modules-choosing-options-2026.md).

**Libraries:** `module: "node18"` for maximum compatibility. `moduleResolution: "bundler"` is infectious, allowing code that only works in bundlers. Code that works in Node.js almost always works in bundlers, but not vice versa. Use `strict: true`, `verbatimModuleSyntax: true`, `declaration: true`, `declarationMap: true`, explicit `rootDir`/`outDir` (source: typescript-modules-choosing-options-2026.md).

Libraries shipping CJS should avoid default exports, since transpiled default exports are accessed differently across Node.js ESM, bundlers, and vanilla CJS consumers (source: typescript-modules-esm-cjs-interop-2026.md).

## The `paths` option

Overrides resolution for bare specifiers. Does not affect emitted import paths, so a `paths` alias that the runtime doesn't know about will crash at runtime. Acceptable for bundled apps (where the bundler resolves aliases), but published libraries should not use it. Consider `package.json` `"imports"` as a standard replacement (source: typescript-modules-reference-2026.md).

`paths` should not point into `node_modules`, since it bypasses `"exports"`, `"main"`, and `"typesVersions"` resolution (source: typescript-modules-reference-2026.md).

## `import defer` (TS 5.9)

Deferred module evaluation via `import defer * as ns from "mod"`. The module is not evaluated until a property of `ns` is first accessed. Proposed for ECMAScript Stage 3 (source: typescript-release-notes-5.9-2026.md).

## Related pages

- [[typescript-project-config]]
- [[typescript-migration-6]]
- [[typescript-enums]]
