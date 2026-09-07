# JavaScript linting

The JavaScript/TypeScript linting landscape in 2026 has three major tools: [[eslint]] (incumbent), [[biome]] (unified linter+formatter), and [[oxlint]] (speed-focused). Two Rust-based alternatives now challenge ESLint's decade-long dominance. (source: sph-typescript-linting-tools-2026.md)

## Tool comparison

| | ESLint | Biome | Oxlint |
|---|---|---|---|
| Language | JavaScript | Rust | Rust |
| Built-in rules | ~300 core | 536 | 865+ |
| Type-aware rules | 59 (via [[typescript-eslint]]) | ~75-85% coverage (Biotype) | 43 (tsgolint) |
| Formatting | No (use Prettier) | Built-in | No (use Prettier/oxfmt/dprint) |
| Plugin ecosystem | 1000+ plugins | GritQL plugins (v2), no JS custom rules | JS plugins (alpha preview) |
| Config format | `eslint.config.js` (flat config) | `biome.json` | `.oxlintrc.json` or `oxlint.config.ts` |
| Speed vs ESLint | baseline | 15-25x faster | 50-100x faster |
| Weekly npm downloads | ~134M | ~8.8M | growing |
| React support | Via plugins | Built-in | Built-in |
| Vue/Svelte/Astro | Via plugins | Experimental (v2.3+) | Limited |
| CSS linting | Via stylelint | Yes | No |

(source: sph-typescript-linting-tools-2026.md, jsmanifest-biome-vs-oxlint-2026.md)

## Performance

On a 10,000-line monorepo (source: sph-typescript-linting-tools-2026.md):

| Tool | Time |
|---|---|
| ESLint (no type-aware) | 3-5s |
| ESLint + typescript-eslint | 10-20s |
| Biome | ~200ms |
| Oxlint | ~70ms |

Both Rust tools compile to native binaries and parse ASTs without Node.js runtime overhead. Oxlint is roughly 2x faster than Biome for pure linting, though at typical project sizes both are sub-second and the difference is academic. The gap matters at monorepo scale (10,000+ files) or CI pipelines where seconds compound. (source: jsmanifest-biome-vs-oxlint-2026.md, sph-typescript-linting-tools-2026.md)

## Design philosophy differences

**Biome** replaces both ESLint and Prettier with one unified tool. Single config file, single AST pass for linting and formatting. The tradeoff: no JavaScript custom rules, and type-aware coverage gaps. (source: jsmanifest-biome-vs-oxlint-2026.md)

**Oxlint** replaces only the linter. It maximizes ESLint compatibility (parses `.eslintrc.json` files, supports ESLint severity syntax) and is designed to run alongside ESLint as a fast pre-check. Formatting is delegated to Prettier, oxfmt, or dprint. (source: jsmanifest-biome-vs-oxlint-2026.md, oxlint-configuration-2026.md)

**ESLint** retains the full plugin ecosystem, mature type-aware support via [[typescript-eslint]], and custom rule authoring. The tradeoff is speed. (source: sph-typescript-linting-tools-2026.md)

## Decision framework

Choose **ESLint + Prettier** when: specific ESLint plugins are required, full [[type-aware-linting]] coverage is mandatory, Vue/Svelte/Astro support is needed. (source: sph-typescript-linting-tools-2026.md)

Choose **Biome** when: starting a new project, consolidating formatter and linter, no custom ESLint plugins needed, 75-85% type-aware coverage is acceptable. (source: sph-typescript-linting-tools-2026.md, jsmanifest-biome-vs-oxlint-2026.md)

Choose **Oxlint alongside ESLint** when: CI speed is a priority but full migration is not feasible, faster local feedback is wanted, evaluating Rust tools without commitment. (source: sph-typescript-linting-tools-2026.md)

Choose **Oxlint replacing ESLint** when: maximum speed is the priority, rule requirements fit within 865+ built-in rules, linting only (formatting handled separately). (source: sph-typescript-linting-tools-2026.md)

## Migration paths

### ESLint to Biome

```bash
npx biome migrate eslint --write
npx biome migrate prettier --write
npm uninstall eslint prettier eslint-config-prettier ...
rm .eslintrc.* .prettierrc*
```

Complexity: low to medium. Time: 1-2 days for small projects, 1 week for large. (source: sph-typescript-linting-tools-2026.md, devto-biome-migration-guide-2026.md)

### ESLint + Oxlint (gradual)

```bash
npm install --save-dev oxlint eslint-plugin-oxlint
```

`eslint-plugin-oxlint` disables overlapping rules in ESLint so oxlint handles the fast checks and ESLint handles the rest. Scripts run `oxlint && eslint .` for fast-first feedback. Complexity: minimal, ~1-2 hours. (source: sph-typescript-linting-tools-2026.md)

### Formatter-only migration (Prettier to Biome)

```bash
npx biome migrate prettier --write
```

Disable Biome linting in `biome.json` if keeping ESLint. 30-minute migration. (source: sph-typescript-linting-tools-2026.md)

## CI integration

Biome provides a GitHub Action (`biomejs/setup-biome@v2`) and `biome ci` for CI-optimized runs. Oxlint provides `oxc-project/setup-oxc@v1`. A parallel strategy runs oxlint for fast feedback in one job and ESLint for type-aware rules in another. (source: sph-typescript-linting-tools-2026.md)

## Formatting tools

Related but distinct from linting. The major formatters:

| Tool | Language | Speed vs Prettier | Notes |
|---|---|---|---|
| Prettier | JavaScript | baseline | Dominant, opinionated, 97% format compat with Biome |
| Biome formatter | Rust | ~25x faster | Built into Biome |
| dprint | Rust | ~25x faster | Pluggable, configurable, WebAssembly plugins |
| oxfmt | Rust (alpha) | ~30x faster | Part of Oxc, native Tailwind class sorting |

(source: sph-typescript-linting-tools-2026.md)

## Related pages

- [[eslint]]
- [[typescript-eslint]]
- [[biome]]
- [[oxlint]]
- [[type-aware-linting]]
