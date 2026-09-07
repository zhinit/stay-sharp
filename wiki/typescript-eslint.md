# typescript-eslint

typescript-eslint enables [[eslint]] to lint TypeScript code. It provides a parser, plugin, and preconfigured rule sets. It is the standard way to get TypeScript-specific lint rules in ESLint. (source: typescript-eslint-getting-started-2026.md)

## Installation

```bash
npm install --save-dev eslint @eslint/js typescript typescript-eslint
```

(source: typescript-eslint-getting-started-2026.md)

## Configuration

Uses ESLint's flat config format:

```javascript
// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
  files: ['**/*.{js,ts}'],
  extends: [js.configs.recommended, tseslint.configs.recommended],
});
```

The `// @ts-check` comment enables type checking within the config file itself. The `files` glob can be expanded to `'**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'` for full coverage. (source: typescript-eslint-getting-started-2026.md)

## Rule sets

Three tiers of preconfigured rules:

- **recommended**: Core TypeScript rules
- **strict**: Superset of recommended with more opinionated rules that may also catch bugs
- **stylistic**: Consistent code styling without altering logical behavior

```javascript
extends: [
  js.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
]
```

(source: typescript-eslint-getting-started-2026.md)

## Type-aware linting

A separate configuration enables rules that use the TypeScript type system. This provides full type information to lint rules, enabling checks like detecting floating promises and invalid type assertions. See [[type-aware-linting]]. (source: typescript-eslint-getting-started-2026.md)

typescript-eslint provides 59 type-aware rules with full TypeScript type system coverage, the most comprehensive of any tool. (source: sph-typescript-linting-tools-2026.md)

## Example with type checking

```javascript
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  prettierConfig,
);
```

(source: sph-typescript-linting-tools-2026.md)

## Related pages

- [[eslint]]
- [[type-aware-linting]]
- [[javascript-linting]]
