# Biome

Biome is a Rust-based unified linter and formatter for JavaScript, TypeScript, JSON, CSS, GraphQL, and (experimentally) HTML, Vue, Svelte, and Astro. It replaces both [[eslint]] and Prettier with a single tool and configuration file. (source: biomejs-getting-started-2026.md, biome-roadmap-2026.md)

Biome crossed into mainstream usage with about 8.8 million weekly npm downloads as of mid-2026. (source: sph-typescript-linting-tools-2026.md)

## Installation

```bash
npm i -D -E @biomejs/biome
npx @biomejs/biome init
```

The `-E` flag pins the exact version, which is recommended. The init command creates a `biome.json` config file. (source: biomejs-getting-started-2026.md)

## CLI commands

```bash
npx @biomejs/biome format --write <files>   # format only
npx @biomejs/biome lint --write <files>      # lint and fix
npx @biomejs/biome check --write <files>     # format + lint + organize imports
npx @biomejs/biome ci .                      # CI mode (optimized for pipelines)
```

(source: biomejs-getting-started-2026.md)

## Linter

536 built-in rules organized into eight groups: Accessibility, Complexity, Correctness, Nursery, Performance, Security, Style, Suspicious. (source: biomejs-linter-docs-2026.md)

Rules use a `use*`/`no*` naming convention: `use*` enforces practices, `no*` denies patterns. (source: biomejs-linter-docs-2026.md)

### Configuration

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "es5"
    }
  }
}
```

(source: sph-typescript-linting-tools-2026.md, biomejs-linter-docs-2026.md)

Severity levels: `"error"` (affects exit code), `"warn"` (respects `--error-on-warnings`), `"info"` (never affects exit). (source: biomejs-linter-docs-2026.md)

### Domains

Domains group technology-specific rules (e.g., "react", "solid", "test"). They can be set to `"recommended"`, `"all"`, or `"off"`. (source: biomejs-linter-docs-2026.md)

### Code fixes

Two categories: safe fixes (guaranteed to preserve semantics, applied with `--write`) and unsafe fixes (may alter behavior, require `--write --unsafe`). Individual rules can have their fix behavior set to `"none"`, `"safe"`, or `"unsafe"`. (source: biomejs-linter-docs-2026.md)

## Type-aware linting (Biotype)

Biome v2 added type-aware linting called Biotype, sponsored by Vercel. It uses a custom type synthesizer that does not depend on the TypeScript compiler. Coverage is approximately 75-85% of [[typescript-eslint]] rules. The initial shipped rule was `noFloatingPromises`. (source: biome-roadmap-2026.md, sph-typescript-linting-tools-2026.md)

Biotype gains speed by skipping the full TS compiler, but produces false negatives on complex type relationships. See [[type-aware-linting]]. (source: jsmanifest-biome-vs-oxlint-2026.md)

### Scanner

Biome v2 introduced a Scanner that crawls project files to build a module graph and infer types. It activates only when project-domain rules are enabled. Performance cost: ~2k files goes from ~800ms to ~2s; ~5k files from ~1s to ~8s. (source: biomejs-linter-docs-2026.md)

## Plugins

Biome v2 added GritQL-based plugins with custom diagnostics. There is no support for JavaScript-based custom rules. (source: biome-roadmap-2026.md, jsmanifest-biome-vs-oxlint-2026.md)

## Migration from ESLint/Prettier

```bash
npx biome migrate eslint --write
npx biome migrate prettier --write
```

These commands translate existing configs to `biome.json`. During migration, all current violations can be suppressed:

```bash
biome lint --suppress --reason "suppressed due to migration"
```

(source: biomejs-linter-docs-2026.md, devto-biome-migration-guide-2026.md)

A migration of a medium Next.js project (3,847 TS files) showed: linting dropped from 34s to 0.6s, CI pipeline from ~2min to 15s, 87/92 rules migrated, zero breaking changes. (source: devto-biome-migration-guide-2026.md)

## 2026 roadmap

Planned work: JavaScript embedded languages (CSS/GraphQL in JS), HTML stabilization, cross-language lint rules, SCSS support, YAML stabilization, LSP enhancements for cross-file navigation. Markdown support is desired but lacks a champion. (source: biome-roadmap-2026.md)

## IDE integration

First-party extensions for VS Code (v3), IntelliJ, and Zed. Community extensions for Vim, Neovim, and Sublime Text. VS Code extension supports multi-root workspaces, single-file mode, and automatic version reloading. WebStorm integration lags VS Code: format-on-save only, no manual "Format with Biome" action. (source: sph-typescript-linting-tools-2026.md, biomejs-getting-started-2026.md)

## Related pages

- [[eslint]]
- [[oxlint]]
- [[javascript-linting]]
- [[type-aware-linting]]
