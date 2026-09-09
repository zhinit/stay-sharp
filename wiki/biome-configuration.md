# Biome Configuration

Biome uses `biome.json` or `biome.jsonc` for configuration. It runs with zero configuration using sane defaults, but most projects customize settings. Configuration is organized around three tools: [[biome-formatter|formatter]], [[biome-linter|linter]], and [[biome-assist|assist]], all enabled by default. (source: biomejs-configure-biome-guide-2026.md)

## File structure

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.13/schema.json",
  "formatter": { "enabled": true },
  "linter": { "enabled": true },
  "assist": { "enabled": true }
}
```

Options that apply to multiple languages go in the tool field (`formatter`, `linter`). Language-specific options go under `<language>.<tool>`, which can override the general settings. Biome treats all JS/TS/JSX/TSX variants under the `javascript` key. (source: biomejs-configure-biome-guide-2026.md)

## $schema

Points to a JSON schema file for IDE validation. Use the local path `./node_modules/@biomejs/biome/configuration_schema.json` or the published URL `https://biomejs.dev/schemas/<version>/schema.json`. (source: biomejs-configuration-reference-2026.md)

## extends

A list of paths to other Biome config files. Order goes from least relevant to most relevant (later overrides earlier). Since v2, accepts `"//"` as shorthand to extend from the root configuration in a monorepo. (source: biomejs-configuration-reference-2026.md)

## root

Whether this config is treated as a root. Default: `true`. Nested configuration files must set `"root": false`. Setting `"extends": "//"` implicitly sets root to false and extends from the root config. (source: biomejs-configuration-reference-2026.md, biomejs-v2-announcement-2025.md)

## File resolution

Biome looks for config files in this order: `biome.json`, `biome.jsonc`, `.biome.json`, `.biome.jsonc`. It searches the current working directory, then parent folders recursively, then platform-specific home directories (`$XDG_CONFIG_HOME/biome` on Linux, `~/Library/Application Support/biome` on macOS, `AppData\Roaming\biome\config` on Windows). (source: biomejs-configure-biome-guide-2026.md)

## files

### files.includes

Glob patterns controlling which files are processed. Applies to all tools. Negated patterns (`!`) exclude files from formatting/linting but still allow indexing. Force-ignore patterns (`!!`) prevent the scanner from indexing files entirely. (source: biomejs-configuration-reference-2026.md)

```json
{
  "files": {
    "includes": ["**", "!**/*.generated.js", "!!**/dist"]
  }
}
```

Tool-specific `includes` fields (`linter.includes`, `formatter.includes`, `assist.includes`) further refine matching but can never match files excluded by `files.includes`. (source: biomejs-configure-biome-guide-2026.md)

### files.ignoreUnknown

Suppresses diagnostics for unrecognized file types. Default: `false`. (source: biomejs-configuration-reference-2026.md)

### files.maxSize

Maximum file size in bytes. Files above this are ignored. Default: `1048576` (1 MB). (source: biomejs-configuration-reference-2026.md)

## VCS integration

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "root": "../",
    "defaultBranch": "main"
  }
}
```

When `useIgnoreFile` is true, Biome respects `.gitignore`, `.ignore`, and Git's local exclude file. Supports nested ignore files. `defaultBranch` is used by `--changed` to detect modified files. (source: biomejs-configuration-reference-2026.md)

## Linter configuration

### linter.enabled

Default: `true`. (source: biomejs-configuration-reference-2026.md)

### linter.rules.preset

Accepts `"recommended"` (default), `"all"`, or `"none"`. (source: biomejs-configuration-reference-2026.md)

### Rule groups

Eight groups: `a11y`, `complexity`, `correctness`, `nursery`, `performance`, `security`, `style`, `suspicious`. Each group can be set to a severity string or configured as an object with individual rules. (source: biomejs-configuration-reference-2026.md)

Severity values: `"on"` (default severity), `"off"`, `"info"`, `"warn"`, `"error"`. (source: biomejs-configuration-reference-2026.md)

```json
{
  "linter": {
    "rules": {
      "preset": "recommended",
      "correctness": { "noUnusedVariables": "error" },
      "style": "warn",
      "nursery": { "recommended": true }
    }
  }
}
```

## Formatter configuration

All options apply to every language unless overridden by a language-specific setting. (source: biomejs-configuration-reference-2026.md)

| Option | Default | Values |
|--------|---------|--------|
| `indentStyle` | `"tab"` | `"tab"`, `"space"` |
| `indentWidth` | `2` | number (ignored when tab) |
| `lineWidth` | `80` | number |
| `lineEnding` | `"lf"` | `"lf"`, `"crlf"`, `"cr"`, `"auto"` |
| `bracketSpacing` | `true` | boolean |
| `delimiterSpacing` | `false` | boolean |
| `expand` | `"auto"` | `"auto"`, `"always"`, `"never"` |
| `attributePosition` | `"auto"` | `"auto"`, `"multiline"` |
| `trailingNewline` | `true` | boolean |
| `formatWithErrors` | `false` | boolean |
| `useEditorconfig` | `false` | boolean |

(source: biomejs-configuration-reference-2026.md)

## JavaScript configuration

```json
{
  "javascript": {
    "parser": {
      "unsafeParameterDecoratorsEnabled": false,
      "jsxEverywhere": true
    },
    "formatter": {
      "quoteStyle": "double",
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSameLine": false,
      "operatorLinebreak": "after"
    },
    "globals": ["$", "_"],
    "jsxRuntime": "transparent",
    "experimentalEmbeddedSnippetsEnabled": false
  }
}
```

Key JS-specific formatter options: `quoteStyle` (`"single"`/`"double"`, default `"double"`), `trailingCommas` (`"all"`/`"es5"`/`"none"`, default `"all"`), `semicolons` (`"always"`/`"asNeeded"`, default `"always"`), `arrowParentheses` (`"always"`/`"asNeeded"`, default `"always"`), `operatorLinebreak` (`"after"`/`"before"`, default `"after"`). (source: biomejs-configuration-reference-2026.md)

`jsxRuntime`: `"transparent"` (modern JSX, default) or `"reactClassic"` (requires React import). (source: biomejs-configuration-reference-2026.md)

## JSON configuration

Parser options: `allowComments` (default `false`), `allowTrailingCommas` (default `false`). Formatter option: `trailingCommas` (`"none"`/`"all"`, default `"none"`). (source: biomejs-configuration-reference-2026.md)

## CSS configuration

Parser options: `cssModules` (default `false`), `tailwindDirectives` (default `false`, enables `@theme`, `@utility`, `@apply`). CSS formatter is disabled by default. `quoteStyle` default is `"double"`. (source: biomejs-configuration-reference-2026.md)

## GraphQL configuration

Formatter disabled by default. Same standard options (indentStyle, lineWidth, quoteStyle). (source: biomejs-configuration-reference-2026.md)

## HTML configuration

Formatter disabled by default (experimental). `experimentalFullSupportEnabled` enables full Vue/Svelte/Astro support. Parser options: `interpolation` (double-brace expressions), `vue` (Vue-specific syntax). Formatter options include `whitespaceSensitivity` (`"css"`/`"strict"`/`"ignore"`, default `"css"`), `selfCloseVoidElements` (`"never"`/`"always"`, default `"never"`), `indentScriptAndStyle` (default `false`, Vue/Svelte only). (source: biomejs-configuration-reference-2026.md)

## Plugins

GritQL plugins are configured via the `plugins` array. Each entry is a path to a `.grit` file or an object with `path` and optional `includes` globs. (source: biomejs-configuration-reference-2026.md)

```json
{
  "plugins": [
    "./my-plugin.grit",
    { "path": "./react-plugin.grit", "includes": ["src/components/**"] }
  ]
}
```

## Overrides

Apply different settings to files matching specific patterns. The first matching override wins. Overrides can change formatter, linter, assist, and language-specific settings. (source: biomejs-configuration-reference-2026.md)

```json
{
  "overrides": [
    {
      "includes": ["generated/**"],
      "formatter": { "lineWidth": 160, "indentStyle": "space" }
    },
    {
      "includes": [".vscode/**"],
      "json": { "parser": { "allowComments": true, "allowTrailingCommas": true } }
    }
  ]
}
```

## Assist configuration

Enabled by default. Actions are organized into the `source` group. (source: biomejs-configuration-reference-2026.md)

```json
{
  "assist": {
    "enabled": true,
    "actions": {
      "source": { "useSortedKeys": "on" }
    }
  }
}
```

## Glob syntax reference

- `*` matches zero or more characters (not `/`)
- `**` recursively matches directories and files (must be entire path component)
- `[...]` character class, `[!...]` negated class
- `!pattern` negated (exclude) pattern, must follow a `**` include
- `!!pattern` force-ignore (prevents scanner indexing)

`node_modules/` is always ignored regardless of `files.includes`. (source: biomejs-configuration-reference-2026.md)

## Well-known files

Biome applies special JSON parsing settings to known config files. For example, `tsconfig.json`, `deno.json`, `jsconfig.json` allow comments and trailing commas. `.eslintrc.json` allows comments only. VS Code, Zed, and Cursor settings directories are treated as JSONC. (source: biomejs-configure-biome-guide-2026.md)

## Protected files

Biome never emits diagnostics for: `composer.lock`, `npm-shrinkwrap.json`, `package-lock.json`, `yarn.lock`. (source: biomejs-configure-biome-guide-2026.md)

## Related pages

- [[biome]]
- [[biome-cli]]
- [[biome-linter]]
- [[biome-formatter]]
- [[biome-assist]]
