# Biome

Biome is a Rust-based unified linter, formatter, and assist tool for JavaScript, TypeScript, JSX, JSON, CSS, GraphQL, and (experimentally) HTML, Vue, Svelte, and Astro. It replaces both [[eslint]] and Prettier with a single tool and configuration file. (source: biomejs-getting-started-2026.md, biomejs-roadmap-2026.md)

Biome crossed into mainstream usage with about 8.8 million weekly npm downloads as of mid-2026, surpassing 15 million monthly downloads by the end of 2025. (source: sph-typescript-linting-tools-2026.md, biomejs-roadmap-2026.md)

## Installation

```bash
npm i -D -E @biomejs/biome    # also: pnpm, bun, deno, yarn
npx @biomejs/biome init        # creates biome.json
```

The `-E` flag pins the exact version, which is recommended. Biome is also available as a standalone executable that does not require Node.js. (source: biomejs-getting-started-2026.md)

## Core commands

```bash
biome format --write <files>   # format only
biome lint --write <files>     # lint and apply safe fixes
biome check --write <files>    # format + lint + organize imports
biome ci .                     # CI mode (no writes, optimized for pipelines)
```

See [[biome-cli]] for the full command and flag reference. (source: biomejs-getting-started-2026.md)

## Supported languages

Biome supports JavaScript, TypeScript, JSX, TSX, JSON, JSONC, CSS, and GraphQL for formatting and linting. HTML formatting is experimental (disabled by default). Vue, Svelte, and Astro are supported experimentally via `html.experimentalFullSupportEnabled`. Biome treats all JS/TS variants under the `javascript` configuration key. (source: biomejs-configuration-reference-2026.md, biomejs-v2-announcement-2025.md)

## Configuration

Biome uses `biome.json` or `biome.jsonc`. Configuration is organized around three tools (formatter, linter, assist), all enabled by default. See [[biome-configuration]] for the full reference. (source: biomejs-configure-biome-guide-2026.md)

```json
{
  "formatter": { "indentStyle": "space", "indentWidth": 2 },
  "linter": { "rules": { "recommended": true } },
  "javascript": { "formatter": { "quoteStyle": "single" } }
}
```

(source: biomejs-configure-biome-guide-2026.md)

## Linter

540+ built-in rules organized into eight groups: Accessibility, Complexity, Correctness, Nursery, Performance, Security, Style, Suspicious. Rules use a `use*`/`no*` naming convention. See [[biome-linter]] for details. (source: biomejs-linter-overview-2026.md, biomejs-javascript-rules-2026.md)

## Formatter

Biome is an opinionated formatter in the Prettier tradition. It targets 97% compatibility with Prettier for JS/TS/JSX but diverges intentionally in several cases. The formatter's option set is considered final. See [[biome-formatter]] for details. (source: biomejs-formatter-overview-2026.md, biomejs-differences-with-prettier-2026.md)

## Assist

Biome Assist provides code actions (sorting keys, organizing imports, simplifying expressions) that always include a fix. 10 actions available as of v2.4. See [[biome-assist]]. (source: biomejs-assist-overview-2026.md)

## Biome v2 highlights

Biome v2 (codename Biotype) shipped June 17, 2025. (source: biomejs-v2-announcement-2025.md)

### Type-aware linting

Biome is the first JavaScript/TypeScript linter with type-aware rules that does not rely on the TypeScript compiler. It uses a custom type synthesizer. The initial shipped rule was `noFloatingPromises`, detecting floating promises in about 75% of cases compared to typescript-eslint. Sponsored by Vercel. (source: biomejs-v2-announcement-2025.md)

### Scanner

Biome v2 introduced a file scanner that crawls project files to build a module graph and infer types. It is opt-in: a full scan (including `node_modules`) runs only when project-domain rules are enabled. Performance cost: ~2k files adds ~1.2s on top of base ~800ms. (source: biomejs-v2-announcement-2025.md, biomejs-linter-overview-2026.md)

### Monorepo support

Biome v2 supports nested configuration files. Set `"root": false` in nested `biome.json` files, or use `"extends": "//"` to extend from the root config. Nested configs do not inherit from the root by default. (source: biomejs-v2-announcement-2025.md)

### Plugins

GritQL-based linter plugins that match code snippets and report diagnostics. No support for JavaScript-based custom rules. Plugin distribution method is not yet finalized. (source: biomejs-v2-announcement-2025.md)

### Improved suppressions

`// biome-ignore-all` suppresses a rule or formatter for an entire file. `// biome-ignore-start` and `// biome-ignore-end` create suppression ranges. (source: biomejs-v2-announcement-2025.md)

### Import organizer revamp

The v2 import organizer handles blank-line separated groups, merges duplicate imports, supports custom ordering, and organizes exports. It is now an assist action. (source: biomejs-v2-announcement-2025.md)

## Biome v2.4

v2.4 (first minor of 2026) added experimental embedded CSS/GraphQL snippets in JS template literals, inline editor configuration, improved Vue/Svelte/Astro parsing, 15 new HTML accessibility rules, a rule profiler (`--profile-rules`), and config discovery from platform-specific directories. (source: biomejs-v2-4-release-2026.md)

## 2026 roadmap

Planned: SCSS support (most requested feature), JavaScript embedded languages, HTML stabilization and Prettier parity, cross-language lint rules, opt-in workspace improvements, YAML stabilization, LSP enhancements for cross-file navigation. Markdown support lacks a champion. (source: biomejs-roadmap-2026.md)

## IDE integration

First-party extensions for VS Code, IntelliJ, and Zed. Community extensions for Vim, Neovim, and Sublime Text. See [[biome-editor-integration]]. (source: biomejs-getting-started-2026.md, biomejs-vscode-extension-2026.md)

## Migration

`biome migrate eslint --write` and `biome migrate prettier --write` translate existing configs to `biome.json`. See [[biome-migration]]. (source: biomejs-migrate-eslint-prettier-2026.md)

## CI and git hooks

`biome ci` is optimized for pipelines: no writes, platform-specific reporters (GitHub annotations, GitLab Code Quality). Git hook integration via Lefthook, Husky, or pre-commit. See [[biome-ci-hooks]]. (source: biomejs-ci-integration-2026.md, biomejs-git-hooks-2026.md)

## Related pages

- [[biome-configuration]]
- [[biome-cli]]
- [[biome-linter]]
- [[biome-formatter]]
- [[biome-assist]]
- [[biome-migration]]
- [[biome-editor-integration]]
- [[biome-ci-hooks]]
- [[eslint]]
- [[oxlint]]
- [[javascript-linting]]
- [[type-aware-linting]]
- [[prettier-vs-biome]]
