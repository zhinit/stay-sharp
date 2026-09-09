# Biome Migration

Biome provides dedicated commands to migrate from [[eslint]] and Prettier. (source: biomejs-migrate-eslint-prettier-2026.md)

## Quick start

```bash
biome migrate eslint --write
biome migrate prettier --write
```

These commands read existing ESLint/Prettier configs and translate them into `biome.json`. (source: biomejs-migrate-eslint-prettier-2026.md)

## Migrating from ESLint

The `biome migrate eslint` subcommand reads ESLint configuration (both legacy and flat formats), loads shared and plugin configurations, and converts them to [[biome-configuration|Biome configuration]]. It also migrates `.eslintignore`. The subcommand needs Node.js to resolve plugins and `extends`. (source: biomejs-migrate-eslint-prettier-2026.md)

### Naming conventions

ESLint uses kebab-case rule names (e.g. `no-var`), while Biome uses camelCase (e.g. `noVar`). Biome has often chosen different names to better convey intent. (source: biomejs-migrate-eslint-prettier-2026.md)

### Supported plugins

The migration handles TypeScript ESLint, ESLint JSX A11y, ESLint React, and ESLint Unicorn. (source: biomejs-migrate-eslint-prettier-2026.md)

### Config transformation

The subcommand overwrites the initial Biome configuration. It disables `recommended` and writes explicit rule entries instead. ESLint `overrides` are converted to Biome `overrides` with matching `include` patterns. Globals are mapped to `javascript.globals`. (source: biomejs-migrate-eslint-prettier-2026.md)

### Inspired rules

By default, rules merely inspired by ESLint (not identical) are skipped. Use `--include-inspired` to migrate them:

```bash
biome migrate eslint --write --include-inspired
```

Behavior may differ from ESLint since Biome implements rules differently. (source: biomejs-migrate-eslint-prettier-2026.md)

### Limitations

- YAML configuration files are not supported. (source: biomejs-migrate-eslint-prettier-2026.md)
- Some plugins or shared configurations export objects with cyclic references. Biome may fail to load these. The workaround is to temporarily comment out the problematic plugins, run the migration, then re-enable them one by one. (source: biomejs-migrate-eslint-prettier-2026.md)
- Flat configuration files support only JavaScript extensions (`js`, `cjs`, `mjs`). (source: biomejs-migrate-eslint-prettier-2026.md)

## Migrating from Prettier

The `biome migrate prettier --write` command converts Prettier configuration to Biome format, including overrides for specific file patterns. Biome uses different defaults from Prettier, notably tabs instead of spaces for indentation. (source: biomejs-migrate-eslint-prettier-2026.md)

The subcommand needs Node.js to load JavaScript configurations such as `.prettierrc.js`. It does not support JSON5, TOML, or YAML format configs. (source: biomejs-migrate-eslint-prettier-2026.md)

### VCS integration

Both ESLint and Prettier take VCS ignore files into account. After migrating, enable Biome's VCS integration to maintain the same behavior. (source: biomejs-migrate-eslint-prettier-2026.md)

## Bulk suppression during transition

To suppress all existing violations after migration without fixing them:

```bash
biome lint --suppress --reason "suppressed due to migration"
```

This writes suppression comments into the source files, allowing gradual adoption of new rules. (source: biomejs-migrate-eslint-prettier-2026.md)

## Related pages

- [[biome]]
- [[biome-configuration]]
- [[biome-linter]]
