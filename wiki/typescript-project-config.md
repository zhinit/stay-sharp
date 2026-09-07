# TypeScript Project Configuration

## tsconfig.json structure

A `tsconfig.json` file in a directory marks the root of a TypeScript project. It specifies root files and compiler options. JavaScript projects can use `jsconfig.json` instead, which acts the same but has some JS-related flags enabled by default. (source: typescript-tsconfig-json-2026.md)

The file supports three ways to specify source files: `files` lists individual files explicitly, `include` uses glob patterns like `"src/**/*"`, and `exclude` removes matches from `include`. When input files are specified on the command line, `tsconfig.json` is ignored. (source: typescript-tsconfig-json-2026.md)

The `extends` property inherits from a base config. Community base configs like `@tsconfig/node12` handle runtime-specific settings so your config can focus on project-specific choices. (source: typescript-tsconfig-json-2026.md)

## Key compiler options

The `target` option sets the JavaScript language version for emitted output and implies a corresponding `lib`. Values range from `es5` through `es2025` and `esnext`. Default is `es5` unless `module` implies otherwise (e.g. `nodenext` implies `esnext`). (source: typescript-compiler-options-2026.md)

The `module` option controls what module code is generated. Key values: `commonjs` (CJS output), `esnext` (ESM output), `node16`/`node18`/`node20`/`nodenext` (dual ESM+CJS for Node.js, auto-detects format from file extension and `package.json` `"type"`), and `preserve` (passes imports/requires through as-is, best for bundlers). Default is `commonjs` if target is ES5, `es6` otherwise. (source: typescript-compiler-options-2026.md)

The `moduleResolution` option controls how TypeScript resolves import specifiers to files. Key values: `node16`/`nodenext` (strict ESM resolution for imports, lenient for requires), `bundler` (lenient everywhere, supports `package.json` exports), `node10` (legacy CJS-only, no exports support), `classic` (deprecated). It is implied by `module` in most cases. (source: typescript-compiler-options-2026.md)

The `esModuleInterop` flag emits additional JavaScript to support importing CommonJS modules with `import x from "cjs"` syntax. It defaults to `true` when `module` is `node16`, `nodenext`, or `preserve`. (source: typescript-compiler-options-2026.md)

## Strict mode

The `strict` flag is an umbrella that enables all strict type-checking options. It defaults to `true`. The individual flags it controls: (source: typescript-compiler-options-2026.md)

- `noImplicitAny` -- errors on expressions with implied `any` type
- `strictNullChecks` -- makes `null` and `undefined` their own types rather than assignable to everything
- `strictFunctionTypes` -- checks function parameter contravariance
- `strictBindCallApply` -- checks `bind`, `call`, `apply` argument types
- `strictPropertyInitialization` -- requires class fields to be initialized in the constructor
- `noImplicitThis` -- errors when `this` has type `any`
- `useUnknownInCatchVariables` -- types catch clause variables as `unknown` instead of `any`
- `alwaysStrict` -- emits `"use strict"` in every file
- `strictBuiltinIteratorReturn` -- built-in iterators get `TReturn` of `undefined` instead of `any`

## Emit options

`noEmit` disables all file output, useful when another tool (bundler, swc, Babel) handles transpilation and you only want type checking. `declaration` generates `.d.ts` files alongside JavaScript output; it defaults to `true` when `composite` is set. `sourceMap` creates `.js.map` files for debugging. `declarationMap` creates `.d.ts.map` files that enable "Go to Definition" to navigate to original `.ts` source across project boundaries. `noEmitOnError` prevents output when type errors exist. (source: typescript-compiler-options-2026.md)

## Module-related flags

`isolatedModules` ensures each file can be safely transpiled in isolation without cross-file type information. It defaults to `true` when `verbatimModuleSyntax` is set. Required for compatibility with single-file transpilers like Babel, swc, and esbuild. (source: typescript-compiler-options-2026.md)

`isolatedDeclarations` requires sufficient type annotations on exports so that other tools can generate declaration files without full type checking. (source: typescript-compiler-options-2026.md)

`verbatimModuleSyntax` prevents TypeScript from transforming or eliding imports/exports not marked as type-only. In CJS-emitting files, this requires using `require()` syntax rather than `import` statements. It provides a guarantee that what you write is what gets emitted. (source: typescript-compiler-options-2026.md)

`erasableSyntaxOnly` disallows runtime constructs that are not part of ECMAScript (like enums and namespaces with runtime code). This is needed for Node.js's built-in type stripping, which can only erase syntax, not transform it. (source: typescript-compiler-options-2026.md)

## Path options

`rootDir` specifies the root folder of source files and controls the output directory structure under `outDir`. It defaults to the longest common path of all non-declaration input files, or to the directory containing `tsconfig.json` when `composite` is set. `outDir` specifies the output folder for all emitted files. (source: typescript-compiler-options-2026.md)

`baseUrl` resolves bare specifier module names relative to a base directory. It is deprecated in TypeScript 6.0. `paths` maps import specifiers to alternative lookup locations. It does not affect emit and should not point at `node_modules`. (source: typescript-compiler-options-2026.md)

## Project references

Project references split a TypeScript project into smaller pieces for faster incremental builds and logical separation. Each sub-project has its own `tsconfig.json`. The root config uses a `references` array pointing to sub-project directories. (source: typescript-project-references-2026.md)

Referenced projects must enable `composite: true`, which forces `declaration: true` and defaults `rootDir` to the config file's directory. All implementation files must be matched by `include` or listed in `files`. (source: typescript-project-references-2026.md)

Build with `tsc --build` (`tsc -b`), which finds all referenced projects, detects which are out of date, and builds them in dependency order. It effectively enables `noEmitOnError` for all projects. Flags: `--verbose`, `--dry`, `--clean`, `--force`, `--watch`. (source: typescript-project-references-2026.md)

A "solution" `tsconfig.json` at the root references all leaf projects with `files` set to an empty array. Use `declarationMap` for cross-project "Go to Definition". Referenced projects consume each other's `.d.ts` output, not source files. (source: typescript-project-references-2026.md)

## Recommended configurations

**Bundler apps** (webpack, Vite, esbuild): `module: "esnext"`, `moduleResolution: "bundler"`, `esModuleInterop: true`, `noEmit: true`. Optionally add `verbatimModuleSyntax: true` and `allowImportingTsExtensions: true`. (source: typescript-modules-choosing-options-2026.md)

**Node.js apps**: `module: "nodenext"`, which implies `moduleResolution: "nodenext"`, `esModuleInterop: true`, and `target: "esnext"`. Add `verbatimModuleSyntax: true`. (source: typescript-modules-choosing-options-2026.md)

**Libraries**: `module: "node18"` for maximum compatibility, since code that works in Node.js almost always works in bundlers, but not vice versa. Use `strict: true`, `verbatimModuleSyntax: true`, `declaration: true`, `sourceMap: true`, `declarationMap: true`, with explicit `rootDir` and `outDir`. (source: typescript-modules-choosing-options-2026.md)

## Monorepo configuration

### Linking strategies

There are three ways to connect TypeScript packages in a monorepo, each with different tradeoffs. (source: nx-managing-ts-packages-monorepos-2026.md)

**TypeScript path aliases** define import mappings in `tsconfig.json` `paths`. Readable but TypeScript treats the entire workspace as one project, with no incremental compilation. The TypeScript team recommends avoiding `paths` for cross-package linking in favor of package manager solutions. (source: nx-managing-ts-packages-monorepos-2026.md)

**Package manager workspaces** (npm, yarn, pnpm, bun) symlink local packages into `node_modules` so they resolve like external npm packages. This decouples import paths from the file system layout. npm and yarn use `"workspaces"` in root `package.json`; pnpm uses `pnpm-workspace.yaml`. Local dependencies use `"*"` (npm) or `"workspace:*"` (yarn/pnpm/bun) as version strings. (source: nx-typescript-project-linking-2026.md) (source: pnpm-workspaces-2026.md)

**Workspaces plus project references** is the recommended combination: workspaces handle package resolution while project references provide incremental compilation. Performance numbers from Nx: without references 186s / 6.14 GB memory; first run with references 175s / 945 MB; subsequent cached runs 25s / 429 MB. (source: nx-typescript-project-linking-2026.md)

### Root config structure

The root `tsconfig.json` in a monorepo is a "solution" config: `extends` a base options file, `files` is an empty array, and `references` lists all projects. Compiler options go in a separate `tsconfig.base.json` (or `tsconfig.options.json`) so project configs can extend it without circular references. (source: moonrepo-typescript-project-refs-2026.md)

Required base compiler options for project references: `composite: true`, `declaration: true`, `declarationMap: true`, `incremental: true`. Also recommended: `skipLibCheck: true` (performance), `noEmitOnError: true` (prevent invalid declarations). (source: moonrepo-typescript-project-refs-2026.md)

### Per-package config

Each package needs its own `tsconfig.json` extending the base config. Applications use `noEmit: true` (no one imports from an app). Packages use `emitDeclarationOnly: true` with an `outDir` for declarations. Each config lists `references` to its dependencies. (source: moonrepo-typescript-project-refs-2026.md)

Prefer `include` over `exclude` for specifying source files. An explicit whitelist is easier to manage and prevents TypeScript from eagerly loading config files, test fixtures, and build output. (source: moonrepo-typescript-project-refs-2026.md)

### Extends chains with Nx

Nx recommends that each `tsconfig.lib.json` and `tsconfig.spec.json` extend `tsconfig.base.json` directly (not the project's own `tsconfig.json`) to avoid circular reference issues. The project `tsconfig.json` should have no `compilerOptions`, only `references` to its solution files (`tsconfig.lib.json`, `tsconfig.spec.json`). Each solution file's `outDir` must be unique. (source: nx-switch-workspaces-project-references-2026.md)

Nx uses `customConditions` with a unique org condition (e.g. `@myorg/source`) in `tsconfig.base.json`. Libraries declare this condition in their `package.json` `exports` to resolve workspace dependencies to source `.ts` files during development without requiring a build step. (source: nx-switch-workspaces-project-references-2026.md)

### Turborepo approach

Turborepo recommends a shared config package (`packages/typescript-config`) containing base and specialized configs (`base.json`, `nextjs.json`, `react-library.json`). Each package extends the appropriate config via `"extends": "@repo/typescript-config/nextjs.json"`. Turborepo explicitly recommends against TypeScript project references, preferring its own caching layer with per-package `check-types` tasks run via `turbo check-types`. (source: turborepo-typescript-guide-2026.md)

For package entrypoints, Turborepo suggests `exports` with `types` pointing to source and `default` pointing to compiled output, keeping `tsserver` synchronized with source while consumers use compiled code. (source: turborepo-typescript-guide-2026.md)

### pnpm workspace specifics

Unlike npm and yarn, pnpm only symlinks workspace packages that are explicitly listed as dependencies in a project's `package.json`. The `workspace:` protocol has publishing behavior: `workspace:*` becomes the exact version, `workspace:^` becomes a caret range, `workspace:~` becomes a tilde range. (source: pnpm-workspaces-2026.md)

Key pnpm workspace settings: `linkWorkspacePackages` (default false, can be `true` or `"deep"`), `saveWorkspaceProtocol` (default `"rolling"`, uses `workspace:*`), `disallowWorkspaceCycles` (fails install on cycles), `sharedWorkspaceLockfile` (default true, single lockfile at root). (source: pnpm-workspaces-2026.md)

### Artifacts and .gitignore

Project references generate `.tsbuildinfo` cache files and declaration output in each project. Add to `.gitignore`: `out-tsc`, `dist`, `*.tsbuildinfo`, and the declarations output directory (commonly `lib/`). Use root-level entries (not path-prefixed) so they match in nested project directories. (source: moonrepo-typescript-project-refs-2026.md) (source: nx-switch-workspaces-project-references-2026.md)

### Circular dependencies

TypeScript project references do not support circular dependencies. If project A depends on B and B depends on A, `tsc --build` fails. The fix is to extract shared code into a new package C that both A and B depend on. (source: moonrepo-typescript-project-refs-2026.md)

### Disagreements between tools

Turborepo and Nx/moonrepo disagree on project references. Turborepo says they "introduce both another point of configuration as well as another caching layer" and recommends against them, relying on Turborepo's own caching instead. Nx and moonrepo strongly recommend project references for their incremental compilation, boundary enforcement, and memory reduction benefits. The choice depends on the build orchestrator in use. (source: turborepo-typescript-guide-2026.md) (source: moonrepo-typescript-project-refs-2026.md)

## Related pages

- [[typescript-modules]] -- module/moduleResolution in depth, ESM/CJS interop
- [[typescript-classes]] -- class features affected by strict flags
- [[typescript-migration-6]] -- TS 6.0 default changes to these options
