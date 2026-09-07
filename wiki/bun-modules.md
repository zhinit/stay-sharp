# Bun Module Resolution

[[bun|Bun]] supports both ES modules (ESM) and CommonJS with a consistent resolution algorithm requiring minimal configuration (source: bun-docs-modules-2026.md).

## Module systems

Both ESM `import` and CommonJS `require()` work interchangeably in Bun (source: bun-docs-modules-2026.md). Key differences between the systems: ES modules support top-level `await` and are always in strict mode, while CommonJS modules are not.

When `require()` is called on an ES module, Bun returns the module's namespace object. When called on a CommonJS module, it returns `module.exports` as usual. The one restriction: files with top-level `await` cannot be `require()`'d (source: bun-docs-modules-2026.md).

## File resolution order

When an import omits the file extension (e.g., `./hello`), Bun checks files in this order (source: bun-docs-modules-2026.md):

1. TypeScript: `.tsx`, `.jsx`, `.mts`, `.ts`
2. JavaScript: `.mjs`, `.js`
3. CommonJS: `.cts`, `.cjs`
4. Data: `.json`
5. Directory index files (repeating the above extensions)

The exact order varies by context. `require()` prioritizes CommonJS extensions, and imports inside `node_modules` favor JavaScript over TypeScript (source: bun-docs-modules-2026.md).

## Package resolution

For bare specifiers (e.g., `import "lodash"`), Bun walks up the directory tree checking `node_modules` folders, following the Node.js resolution algorithm (source: bun-docs-modules-2026.md).

Package entry points are resolved from `package.json` in this order (source: bun-docs-modules-2026.md):

1. Custom `"bun"` export condition (useful for TypeScript libraries shipping source)
2. Platform-specific conditions: `"node"`, `"require"`, `"import"`
3. `"default"` fallback
4. Legacy fields: `"main"` or implicit `index.*`, then `"module"`

## Path aliases

Two mechanisms support path re-mapping (source: bun-docs-modules-2026.md):

**tsconfig.json paths:** Set `compilerOptions.paths` to map import specifiers to file paths:

```json
{
  "compilerOptions": {
    "paths": {
      "config": ["./config.ts"],
      "components/*": ["components/*"]
    }
  }
}
```

**package.json subpath imports:** Node.js-style `#` imports defined in the `"imports"` field of `package.json`.

## import.meta

The `import.meta` object provides runtime metadata about the current module (source: bun-docs-modules-2026.md):

- `import.meta.dir` / `import.meta.dirname` returns the directory path
- `import.meta.path` / `import.meta.filename` returns the file path
- `import.meta.url` returns the file URL
- `import.meta.main` indicates whether this file is the entry point
- `import.meta.resolve(specifier)` programmatically resolves a module specifier

## CLI options

The `NODE_PATH` environment variable adds extra resolution directories. The `--conditions` flag specifies custom export conditions for both `bun build` and runtime execution (source: bun-docs-modules-2026.md).

**Related pages:** [[bun]], [[bun-runtime]], [[bun-bundler]], [[bun-configuration]]
