# ESLint

ESLint is a pluggable JavaScript/TypeScript linter, dominant in the ecosystem since 2013. It reports patterns in ECMAScript code to enforce consistency and catch bugs. Every rule is a plugin, and the architecture is designed for extensibility. (source: eslint-getting-started-2026.md)

As of mid-2026, ESLint records about 134 million weekly npm downloads. (source: sph-typescript-linting-tools-2026.md)

## Prerequisites

- Node.js `^20.19.0`, `^22.13.0`, or `>=24` with SSL and ICU support
- TypeScript 5.3+ if using ESLint's type definitions

(source: eslint-getting-started-2026.md)

## Installation

```bash
npm init @eslint/config@latest
```

This generates an `eslint.config.js` file using the flat config format (default since ESLint v9). A `package.json` must exist before running. (source: eslint-getting-started-2026.md)

Manual install:

```bash
npm install --save-dev eslint@latest @eslint/js@latest
```

## Flat config

ESLint v9+ uses flat config (`eslint.config.js`) by default, replacing the legacy `.eslintrc` hierarchy. v10 is in active development. (source: eslint-getting-started-2026.md, sph-typescript-linting-tools-2026.md)

A typical configuration:

```javascript
import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
  { files: ["**/*.js"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.js"], plugins: { js }, extends: ["js/recommended"] },
]);
```

(source: eslint-getting-started-2026.md)

## Rules

Rules have three severity levels: `"off"` (0), `"warn"` (1), `"error"` (2). Warnings do not affect the exit code. Errors set exit code 1. (source: eslint-getting-started-2026.md)

ESLint ships about 300 core rules. The full plugin ecosystem provides 1000+ additional plugins. (source: sph-typescript-linting-tools-2026.md)

## Plugin architecture

The documentation hub organizes into five sections: Use (getting started, config, CLI, rules), Extend (plugins, custom rules, parsers, shareable configs), Integrate (Node.js API), Contribute, and Maintain. (source: eslint-docs-hub-2026.md)

Custom rules, processors, language support, parsers, and formatters can all be added through the plugin system. (source: eslint-docs-hub-2026.md)

## IDE integration

ESLint has official VS Code and WebStorm/IntelliJ extensions, plus built-in Neovim LSP support. (source: sph-typescript-linting-tools-2026.md)

## Performance

On a 10,000-line monorepo, ESLint takes 3-5 seconds without type-aware rules. Adding [[typescript-eslint]] with full type checking adds 10-20 seconds. This is 15-100x slower than [[biome]] and [[oxlint]]. (source: sph-typescript-linting-tools-2026.md)

## Related pages

- [[typescript-eslint]]
- [[biome]]
- [[oxlint]]
- [[javascript-linting]]
- [[type-aware-linting]]
