# TypeScript 6.0 Migration

TypeScript 6.0 is a transition release bridging 5.9 and the Go-based TypeScript 7.0. Most changes are new defaults and deprecations preparing for 7.0. The JS compiler codebase entered maintenance mode in January 2026; 6.0 shipped March 2026. (source: typescript-5-to-6-migration-guide-2026.md)

## New defaults

TypeScript 6.0 flips several compiler option defaults to reflect the modern ecosystem. (source: typescript-release-notes-6.0-2026.md)

| Option | 5.9 default | 6.0 default |
|--------|------------|------------|
| `strict` | `false` | `true` |
| `target` | `ES3` | `es2025` |
| `module` | `CommonJS` (varies) | `es2022` (resolved from target) |
| `moduleResolution` | `node10` (varies) | `bundler` (resolved from module) |
| `rootDir` | inferred from input files | `.` (tsconfig.json directory) |
| `types` | `["*"]` (all `@types`) | `[]` (none) |
| `noUncheckedSideEffectImports` | `false` | `true` |
| `libReplacement` | `true` | `false` |
| `esModuleInterop` | `false` | `true` |

(source: typescript-5-to-6-migration-guide-2026.md)

The two most disruptive changes for existing projects are `types` defaulting to `[]` (no `@types` packages auto-discovered, must explicitly list `"types": ["node"]` or similar) and `rootDir` defaulting to `.` (output may nest under `dist/src/` instead of `dist/` if not explicitly set). Many projects have seen 20-50% build time improvements from explicitly specifying `types`. (source: typescript-release-notes-6.0-2026.md)

## Deprecations

All deprecations can be temporarily silenced with `"ignoreDeprecations": "6.0"` in tsconfig.json. They become hard removals in TypeScript 7.0. (source: typescript-release-notes-6.0-2026.md)

**Removed targets and module formats:** `target: es5` is deprecated (lowest is now `es2015`). `module: amd`, `umd`, `system`, and `none` are deprecated. `outFile` is deprecated; use a bundler instead. `downlevelIteration` is deprecated since it only applied to ES5 output. (source: typescript-release-notes-6.0-2026.md)

**Removed resolution strategies:** `moduleResolution: node10` (the old `node`) and `moduleResolution: classic` are both deprecated. Migrate to `nodenext` (for Node.js) or `bundler` (for bundled apps / Bun). (source: typescript-release-notes-6.0-2026.md)

**baseUrl deprecated:** `baseUrl` no longer serves as a module resolution lookup root. Inline its value into your `paths` entries instead. The `ts5to6` tool can automate this. (source: typescript-release-notes-6.0-2026.md)

**esModuleInterop / allowSyntheticDefaultImports:** Setting either to `false` is deprecated. The safer interop behavior is always enabled. Change `import * as x from "cjs"` to `import x from "cjs"`. (source: typescript-release-notes-6.0-2026.md)

**alwaysStrict:** Setting to `false` is deprecated. All code is assumed to be in JS strict mode. (source: typescript-release-notes-6.0-2026.md)

**Legacy module keyword:** `module Foo { }` for namespaces is a hard error. Use `namespace Foo { }`. Ambient module declarations (`declare module "specifier" { }`) remain valid. (source: typescript-release-notes-6.0-2026.md)

**Import assertions:** `assert { type: "json" }` is deprecated. Use `with { type: "json" }` (import attributes). (source: typescript-release-notes-6.0-2026.md)

## Migration tools

The `ts5to6` tool (by Andrew Branch, TypeScript team member) automates the two most disruptive tsconfig migrations: `baseUrl` removal and `rootDir` inference. It works across monorepos, follows project references, and handles `extends` chains. (source: typescript-5-to-6-migration-guide-2026.md)

```bash
npx @andrewbranch/ts5to6 --fixBaseUrl .
npx @andrewbranch/ts5to6 --fixRootDir .
```

(source: typescript-5-to-6-migration-guide-2026.md)

## stableTypeOrdering

A diagnostic-only flag (`--stableTypeOrdering`) makes 6.0 use the same deterministic type ordering algorithm as 7.0, reducing noise when comparing `.d.ts` output between the two versions. Not intended for long-term use. Can add up to 25% slowdown to type-checking. (source: typescript-release-notes-6.0-2026.md)

TypeScript 7.0 uses parallel type checking, which makes internal type ID assignment non-deterministic. The stable ordering ensures all checkers encounter the same object order regardless of creation time. (source: typescript-release-notes-6.0-2026.md)

## erasableSyntaxOnly (5.8)

The `--erasableSyntaxOnly` flag (introduced in 5.8) errors on TypeScript-specific constructs that have runtime behavior: `enum` declarations, `namespace`s with runtime code, parameter properties, and `import =`/`export =`. This aligns with Node.js's `--experimental-strip-types` mode, which requires all TypeScript syntax to be erasable without semantic changes. Combine with `--verbatimModuleSyntax` for full compatibility. (source: typescript-release-notes-5.8-2026.md)

## New features in 6.0

**This-less function inference:** Method-syntax functions that don't reference `this` are no longer treated as contextually sensitive, fixing ordering-dependent inference failures in generic object literals. (source: typescript-release-notes-6.0-2026.md)

**`#/` subpath imports:** Node.js added support for subpath imports starting with `#/`, and TypeScript now supports this under `nodenext` and `bundler` module resolution. (source: typescript-release-notes-6.0-2026.md)

**`--moduleResolution bundler` with `--module commonjs`:** Previously bundler resolution only worked with `esnext` or `preserve`. Now it also allows `commonjs`, providing a migration path from deprecated `node10` resolution. (source: typescript-release-notes-6.0-2026.md)

**`--module node20` (5.9):** A stable module option for Node.js 20 behavior. Unlike `nodenext`, `node20` will not change in future releases. Implies `--target es2023`. (source: typescript-release-notes-5.9-2026.md)

**`import defer` (5.9):** Support for deferred module evaluation via `import defer * as feature from "./module.js"`. The module is loaded but not executed until one of its exports is accessed. Only works under `--module preserve` and `--module esnext`. (source: typescript-release-notes-5.9-2026.md)

## Migration checklist

1. Set `"types": ["node"]` (or whatever `@types` packages you need)
2. Set `"rootDir": "./src"` if you rely on source files in a subdirectory
3. Review `strict: true` default, or explicitly set `"strict": false`
4. Set explicit `target` if you need something other than `es2025`
5. Set explicit `module` if you need `commonjs` output
6. Remove `baseUrl` and inline into `paths` entries
7. Replace `import * as x from "cjs"` with `import x from "cjs"`
8. Replace `assert { }` with `with { }` on imports
9. Replace `module Foo { }` with `namespace Foo { }`
10. Remove deprecated options: `downlevelIteration`, `outFile`, `alwaysStrict: false`
11. Update `moduleResolution` from `node10`/`classic` to `nodenext`/`bundler`

(source: typescript-5-to-6-migration-guide-2026.md)

## Related pages

- [[typescript-project-config]]
- [[typescript-modules]]
- [[typescript-enums]]
- [[typescript-classes]]
