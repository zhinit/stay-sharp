# Oxlint

Oxlint is a Rust-based linter for JavaScript and TypeScript, part of the Oxc (JavaScript Oxidation Compiler) project. It focuses exclusively on linting (no formatting) and is designed for maximum speed and ESLint compatibility. Version 1.0 launched June 2025. (source: oxlint-quickstart-2026.md, sph-typescript-linting-tools-2026.md)

## Installation

```bash
npm add -D oxlint
```

Add to `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix"
  }
}
```

When no path is specified, oxlint analyzes the current directory. (source: oxlint-quickstart-2026.md)

## Configuration

Oxlint looks for config files in this order: `.oxlintrc.json`, `.oxlintrc.jsonc`, `oxlint.config.ts`, `oxlint.config.mts`. JSON configs support comments (JSONC). Generate a default with `oxlint --init`. (source: oxlint-configuration-2026.md)

### JSON format

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "categories": {
    "correctness": "warn"
  },
  "rules": {
    "eslint/no-unused-vars": "error"
  }
}
```

### TypeScript format

```typescript
import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "warn",
  },
  rules: {
    "eslint/no-unused-vars": "error",
  },
});
```

Requires Node v22.18+ or v24+ for TS execution. (source: oxlint-configuration-2026.md)

## Rules

865+ built-in rules across categories: correctness, suspicious, pedantic, perf, style, restriction, nursery. By default, only `correctness` is enabled. (source: sph-typescript-linting-tools-2026.md, oxlint-configuration-2026.md)

Severity values: `"off"`/`"allow"`, `"warn"`, `"error"`/`"deny"`. Rules support options via array syntax: `["error", { "allowForLoopAfterthoughts": true }]`. (source: oxlint-configuration-2026.md)

## Plugins

Native Rust plugins: `eslint`, `react`, `unicorn`, `typescript`, `oxc`, `import`, `jsdoc`, `jest`, `vitest`, `jsx-a11y`, `nextjs`, `react-perf`, `promise`, `node`, `vue`. (source: oxlint-config-file-reference-2026.md)

JavaScript plugin support (alpha) via `jsPlugins` field for ESLint plugin compatibility. Reserved names cannot be used for JS plugins since they map to native implementations. (source: oxlint-configuration-2026.md)

## Type-aware linting (tsgolint)

Enabled with `"typeAware": true` in options. Uses typescript-go (tsgo, the native Go port of the TypeScript compiler, also known as TypeScript 7). Currently provides 43 type-aware rules. See [[type-aware-linting]]. (source: oxlint-config-file-reference-2026.md, sph-typescript-linting-tools-2026.md)

Experimental `"typeCheck": true` adds full TypeScript diagnostics. (source: oxlint-config-file-reference-2026.md)

## Fix modes

Three levels: `--fix` (safe fixes), `--fix-suggestions` (may alter behavior), `--fix-dangerously`. (source: oxlint-quickstart-2026.md)

## Overrides and extends

File-specific config via `overrides` with glob patterns. Shared configs via `extends`. Configs merge left-to-right with later entries winning. (source: oxlint-configuration-2026.md)

## Environments and globals

Predefined globals by environment (`browser`, `node`, `jest`, `es2015`-`es2026`, `react`, `vue`, etc.). Custom globals set as `"readonly"`, `"writable"`, or `"off"`. (source: oxlint-config-file-reference-2026.md)

## CI usage

```bash
oxlint --quiet              # errors only
oxlint --deny-warnings      # fail on any warnings
oxlint --max-warnings 0     # fail if warnings exceed threshold
oxlint -f json              # machine-readable output
```

Output formats: `default`, `json`, `unix`, `checkstyle`, `github`, `gitlab`, `junit`, `stylish`. (source: oxlint-quickstart-2026.md)

## Performance

50-100x faster than [[eslint]] on equivalent codebases. On a 10,000-line monorepo, typical time is ~70ms versus ESLint's 3-5s. Approximately 2x faster than [[biome]] for pure linting, though for most projects both are sub-second. (source: sph-typescript-linting-tools-2026.md, jsmanifest-biome-vs-oxlint-2026.md)

With type-aware rules enabled, runs 10-20x slower than without, but still 5-10x faster than ESLint. (source: jsmanifest-biome-vs-oxlint-2026.md)

## The Oxc ecosystem

Oxlint is one component of the broader Oxc project:

| Tool | Purpose | Notes |
|------|---------|-------|
| oxc-parser | JS/TS(X) parsing | 3x faster than SWC, passes all Test262 tests |
| oxfmt | Code formatting (alpha) | 30x faster than Prettier, 3x faster than Biome |
| oxc-transform | Transpilation | TypeScript, JSX, ES2015, React Fast Refresh |
| oxc-resolver | Module resolution | 28x faster than enhanced-resolve |
| oxc-minify | Code minification | Dead code elimination, mangling |

(source: sph-typescript-linting-tools-2026.md)

## Running alongside ESLint

The recommended gradual adoption path uses `eslint-plugin-oxlint` to disable overlapping rules in ESLint, then runs oxlint first for fast feedback:

```bash
npm install --save-dev oxlint eslint-plugin-oxlint
```

```javascript
// eslint.config.js
import oxlint from "eslint-plugin-oxlint";

export default [
  ...tseslint.configs.recommended,
  oxlint.configs["flat/recommended"],
];
```

```json
{
  "scripts": {
    "lint": "oxlint && eslint ."
  }
}
```

(source: sph-typescript-linting-tools-2026.md)

## Related pages

- [[eslint]]
- [[biome]]
- [[javascript-linting]]
- [[type-aware-linting]]
