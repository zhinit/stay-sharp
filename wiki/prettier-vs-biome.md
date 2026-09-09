# Prettier vs Biome Formatting

Biome's formatter targets 96%+ compatibility with Prettier for JavaScript, TypeScript, and JSX. The remaining differences are intentional divergences. (source: biomejs-prettier-challenge-2024.md)

## Compatibility level

Before the Prettier challenge, Biome had roughly 85% compatibility. After v1.4.0, this jumped to over 96%. Current documentation claims 97%. (source: biomejs-prettier-challenge-2024.md)

## Intentional divergences

### Identifier unquoting

Biome unquotes all valid ES2015+ identifiers in object and class properties. Prettier only unquotes valid ES5 identifiers. Non-ASCII identifiers valid in ES2015+ (like `𐊧`) stay quoted in Prettier but are unquoted by Biome. (source: biomejs-differences-with-prettier-2026.md)

### Trailing commas in arrow function type parameters

When a type parameter has a default (`<T = unknown>() => {}`), a trailing comma is not syntactically required. Biome omits it. Prettier adds it. (source: biomejs-differences-with-prettier-2026.md)

### Computed key parentheses

Prettier inconsistently adds parentheses around assignments in computed keys for object properties (`[(x = 0)]`) but not for class properties. Biome omits parentheses in both cases. (source: biomejs-differences-with-prettier-2026.md)

### Non-null assertion parentheses on optional chains

Prettier does not normalize parenthesization around `!` on optional chains. `a.?.b!`, `(a.?.b)!`, and `(a.?.b!)` are left as-is. Biome normalizes all three to `a.?.b!`. (source: biomejs-differences-with-prettier-2026.md)

### Invalid syntax

Biome's parser is stricter than Prettier's Babel-based parser. When Biome encounters invalid syntax (duplicate class modifiers, assignment to optional chains, top-level returns, abstract members in non-abstract classes), it creates "bogus nodes" printed verbatim without formatting. Prettier formats invalid syntax as if it were valid. (source: biomejs-differences-with-prettier-2026.md)

## Option philosophy

Both tools are opinionated formatters that resist adding options. Biome added Prettier's existing options (bracketSameLine, bracketSpacing, arrowParens) for migration compatibility but considers them "a legacy feature for compatibility rather than a baseline feature set." No new options will be added. (source: biomejs-option-philosophy-2026.md)

## New options added for compatibility

Biome v1.4.0 added lineEnding (lf/cr/crlf), bracketSameLine, and bracketSpacing to match Prettier's option surface. (source: biomejs-prettier-challenge-2024.md)

## Will they conflict in an editor?

Yes. If both Prettier and Biome format the same file, the 3-4% divergence means some files will toggle between the two styles on every save. Any file containing an ES2015+ non-ASCII identifier in an object key, an arrow function with defaulted type parameters, or certain optional chain patterns will be reformatted differently by each tool.

The fix is to ensure only one formatter runs per file. See [[conform-nvim]] for the standard Neovim solution: use `stop_after_first = true` to pick Biome when a `biome.json` exists and fall back to Prettier otherwise. For Biome v2, using Biome's LSP directly for formatting (bypassing conform.nvim) is an alternative. (source: conform-nvim-readme-2026.md, willcodefor-biome-neovim-2026.md)

## Related pages

- [[biome]]
- [[conform-nvim]]
- [[javascript-linting]]
