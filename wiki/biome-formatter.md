# Biome Formatter

Biome is an opinionated formatter that follows a similar philosophy to Prettier, deliberately supporting few options to avoid style debates. It scores 97% compatibility with Prettier output. (source: biomejs-formatter-overview-2026.md)

## Supported languages

JavaScript, TypeScript, JSX, TSX, JSON, JSONC, CSS, GraphQL, Grit, and (experimentally) HTML. The CSS, GraphQL, Grit, and HTML formatters are disabled by default. (source: biomejs-configuration-reference-2026.md)

## CLI usage

Check formatting without modifying files:

```bash
biome format ./src
```

Apply formatting:

```bash
biome format --write ./src
```

Biome does not support glob parameters directly. Use the `includes` configuration option instead. (source: biomejs-formatter-overview-2026.md)

## Global options

These options apply to all languages. (source: biomejs-configuration-reference-2026.md, biomejs-formatter-overview-2026.md)

| Option | Default | Values |
| --- | --- | --- |
| `indentStyle` | `"tab"` | `"tab"`, `"space"` |
| `indentWidth` | `2` | number (ignored when indentStyle is tab) |
| `lineWidth` | `80` | number |
| `lineEnding` | `"lf"` | `"lf"`, `"crlf"`, `"cr"`, `"auto"` |
| `attributePosition` | `"auto"` | `"auto"`, `"multiline"` |
| `bracketSpacing` | `true` | boolean |
| `delimiterSpacing` | `false` | boolean |
| `expand` | `"auto"` | `"auto"`, `"always"`, `"never"` |
| `trailingNewline` | `true` | boolean (disabling is discouraged) |
| `formatWithErrors` | `false` | boolean |
| `useEditorconfig` | `false` | boolean (since v1.9) |

When formatting `package.json`, Biome uses `expand: "always"` unless configured otherwise. (source: biomejs-configuration-reference-2026.md)

## JavaScript-specific options

These go under `javascript.formatter`. (source: biomejs-configuration-reference-2026.md)

| Option | Default | Values |
| --- | --- | --- |
| `quoteStyle` | `"double"` | `"single"`, `"double"` |
| `jsxQuoteStyle` | `"double"` | `"single"`, `"double"` |
| `quoteProperties` | `"asNeeded"` | `"asNeeded"`, `"preserve"` |
| `trailingCommas` | `"all"` | `"all"`, `"es5"`, `"none"` |
| `semicolons` | `"always"` | `"always"`, `"asNeeded"` |
| `arrowParentheses` | `"always"` | `"always"`, `"asNeeded"` |
| `bracketSameLine` | `false` | boolean |
| `bracketSpacing` | `true` | boolean |
| `delimiterSpacing` | `false` | boolean (parentheses, square brackets, template interpolations, angle brackets, JSX braces, logical NOT) |
| `operatorLinebreak` | `"after"` | `"after"`, `"before"` |

Biome treats all JavaScript variants (TypeScript, JSX, TSX) under the `javascript` key. (source: biomejs-configuration-reference-2026.md)

## JSON-specific options

Under `json.formatter`. (source: biomejs-configuration-reference-2026.md)

| Option | Default | Values |
| --- | --- | --- |
| `trailingCommas` | `"none"` | `"none"`, `"all"` |
| `bracketSpacing` | `true` | boolean |
| `delimiterSpacing` | `false` | boolean |

JSON parser options: `allowComments` (default false), `allowTrailingCommas` (default false). (source: biomejs-configuration-reference-2026.md)

## CSS-specific options

Under `css.formatter`. Formatter is disabled by default. (source: biomejs-configuration-reference-2026.md)

| Option | Default | Values |
| --- | --- | --- |
| `quoteStyle` | `"double"` | `"single"`, `"double"` |
| `delimiterSpacing` | `false` | boolean |

CSS parser options: `cssModules` (default false), `tailwindDirectives` (default false, enables `@theme`, `@utility`, `@apply` parsing). (source: biomejs-configuration-reference-2026.md)

## GraphQL-specific options

Under `graphql.formatter`. Formatter is disabled by default. Supports `quoteStyle` (default `"double"`). (source: biomejs-configuration-reference-2026.md)

## HTML-specific options

Under `html.formatter`. Formatter is disabled by default (experimental). (source: biomejs-configuration-reference-2026.md)

| Option | Default | Values |
| --- | --- | --- |
| `attributePosition` | `"auto"` | `"auto"`, `"multiline"` |
| `bracketSameLine` | `false` | boolean |
| `whitespaceSensitivity` | `"css"` | `"css"`, `"strict"`, `"ignore"` |
| `indentScriptAndStyle` | `false` | boolean (Vue/Svelte only since v2.3) |
| `selfCloseVoidElements` | `"never"` | `"never"`, `"always"` |

HTML parser options: `interpolation` (default false, enables `{{ }}` in .html), `vue` (default false, enables Vue syntax in .html). The `experimentalFullSupportEnabled` option enables full support for Vue, Svelte, and Astro files including embedded language formatting. (source: biomejs-configuration-reference-2026.md)

## Embedded snippets

Since v2.4, Biome can format and lint embedded CSS and GraphQL inside JavaScript template literals (styled-components, Emotion, graphql-tag). Enable with:

```json
{
  "javascript": {
    "experimentalEmbeddedSnippetsEnabled": true
  }
}
```

(source: biomejs-v2-4-release-2026.md)

## Suppression comments

**File-wide** (must be at the top of the file):
```js
// biome-ignore-all format: generated file
```

**Node-level**:
```js
// biome-ignore format: the array should not be formatted
[1, 2, 3]
```

(source: biomejs-formatter-overview-2026.md)

## .editorconfig support

Since v1.9, Biome can load formatting options from `.editorconfig` files. Settings in `biome.json` always take precedence. `.editorconfig` files above a `biome.json` in the hierarchy are ignored. Nested `.editorconfig` files are not supported. Enable with `formatter.useEditorconfig: true`. (source: biomejs-configuration-reference-2026.md)

## Related pages

- [[biome]]
- [[biome-configuration]]
- [[biome-linter]]
- [[biome-assist]]
