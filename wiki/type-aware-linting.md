# Type-aware linting

Type-aware linting uses TypeScript's type system to detect bugs that syntax-only analysis misses, such as floating promises, invalid type assertions, and strict boolean expressions. It requires resolving types for every expression, which adds a performance cost. (source: sph-typescript-linting-tools-2026.md)

## Approaches by tool

### typescript-eslint (ESLint)

Full TypeScript type system coverage with 59 type-aware rules. Uses the actual TypeScript compiler. Provides the most comprehensive coverage but is the slowest: adds 10-20 seconds on larger projects. (source: sph-typescript-linting-tools-2026.md, typescript-eslint-getting-started-2026.md)

Configuration requires setting `parserOptions.project: true` and pointing to a tsconfig:

```javascript
...tseslint.configs.strictTypeChecked,
{
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
},
```

(source: sph-typescript-linting-tools-2026.md)

### Biotype (Biome)

Custom type synthesizer that does not depend on the TypeScript compiler. Covers approximately 75-85% of [[typescript-eslint]] rules. Gains speed by skipping the full TS compiler but produces false negatives on complex type relationships. Initial shipped rule: `noFloatingPromises`. (source: sph-typescript-linting-tools-2026.md, biome-roadmap-2026.md)

Uses a Scanner that builds a module graph and infers types. The Scanner activates only when project-domain rules are enabled. (source: biomejs-linter-docs-2026.md)

### tsgolint (Oxlint)

Based on typescript-go (tsgo), the native Go port of the TypeScript compiler (TypeScript 7). Provides 43 type-aware rules. Benefits from ongoing TypeScript team optimizations to tsgo. (source: sph-typescript-linting-tools-2026.md, oxlint-config-file-reference-2026.md)

Enabled with:

```json
{
  "options": {
    "typeAware": true
  }
}
```

(source: oxlint-config-file-reference-2026.md)

## Performance comparison

Benchmarks on real codebases (source: sph-typescript-linting-tools-2026.md):

| Tool | Vue Core | Sentry |
|------|----------|--------|
| ESLint + typescript-eslint | ~21s | ~55s |
| Oxlint + tsgolint | ~2.5s | ~4.4s |
| Biome + Biotype | ~3s | ~6s |

Rust-based tools show 7-12x improvements for type-aware linting, with varying rule coverage.

## Coverage tradeoffs

The Rust-based tools gain speed by giving up type-aware rule breadth. When specific type-aware rules are critical (e.g., `@typescript-eslint/no-floating-promises`, `@typescript-eslint/strict-boolean-expressions`), coverage should be verified before migrating away from [[typescript-eslint]]. (source: sph-typescript-linting-tools-2026.md, jsmanifest-biome-vs-oxlint-2026.md)

## Related pages

- [[eslint]]
- [[typescript-eslint]]
- [[biome]]
- [[oxlint]]
- [[javascript-linting]]
