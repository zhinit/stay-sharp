# Biome Linter

Biome's linter statically analyzes code to find and fix common errors. It provides 540 rules for JavaScript/TypeScript and 30+ rules for CSS, organized into eight groups. (source: biomejs-linter-overview-2026.md)

## Naming convention

Rules starting with `use*` enforce or suggest a practice. Rules starting with `no*` deny a pattern. For example, `noDebugger` denies `debugger` statements, `useConst` enforces `const` over `let` where possible. (source: biomejs-linter-overview-2026.md)

Language-agnostic rules work across more than one language. For example, `noUselessEscapeInString` reports useless escape sequences in both JavaScript and CSS. (source: biomejs-linter-overview-2026.md)

## Rule groups

Rules are divided into eight groups. (source: biomejs-linter-overview-2026.md)

**Accessibility (a11y)** prevents accessibility problems. Representative rules: `noAccessKey`, `useAltText`, `useSemanticElements`, `useValidAriaProps`, `useHtmlLang`, `useKeyWithClickEvents`. (source: biomejs-javascript-rules-2026.md)

**Complexity** identifies code that could be simplified. Representative rules: `noForEach`, `noUselessConstructor`, `useOptionalChain`, `useFlatMap`, `useArrowFunction`, `noExcessiveCognitiveComplexity`. (source: biomejs-javascript-rules-2026.md)

**Correctness** detects code that is guaranteed to be incorrect or useless. Representative rules: `noConstAssign`, `noUnusedVariables`, `noUnusedImports`, `useExhaustiveDependencies`, `useIsNan`, `noUndeclaredVariables`, `useJsxKeyInIterable`. (source: biomejs-javascript-rules-2026.md)

**Nursery** holds new rules still under development. Nursery rules require explicit opt-in on stable versions because they may have bugs or performance problems. They get promoted to other groups once stable, or removed. Not subject to semantic versioning. Representative rules: `noFloatingPromises`, `noMisusedPromises`, `useAwaitThenable`, `useSortedClasses`, `noUnsafeTypeAssertion`, `useExplicitType`. (source: biomejs-linter-overview-2026.md, biomejs-javascript-rules-2026.md)

**Performance** catches code that could run faster. Representative rules: `noAccumulatingSpread`, `noBarrelFile`, `noDelete`, `noReExportAll`, `useTopLevelRegex`. (source: biomejs-javascript-rules-2026.md)

**Security** detects potential security flaws. Representative rules: `noDangerouslySetInnerHtml`, `noGlobalEval`, `noSecrets`, `noScriptUrl`, `noBlankTarget`. (source: biomejs-javascript-rules-2026.md)

**Style** enforces consistent and idiomatic code. By default, these rules emit warnings instead of errors. Representative rules: `useConst`, `useTemplate`, `noVar` (in suspicious), `useNamingConvention`, `useFilenamingConvention`, `useImportType`, `noDefaultExport`. (source: biomejs-linter-overview-2026.md, biomejs-javascript-rules-2026.md)

**Suspicious** detects code that is likely incorrect or useless. Representative rules: `noDoubleEquals`, `noDebugger`, `noExplicitAny`, `noConsole`, `noShadow`, `noImportCycles`, `noVar`. (source: biomejs-javascript-rules-2026.md)

## CSS rules

CSS linting covers 30+ rules across the same group structure. Key rules include `noUnknownProperty`, `noUnknownUnit`, `noUnknownPseudoClass`, `noDuplicateProperties`, `noEmptyBlock`, `useGenericFontNames`, and `noShorthandPropertyOverrides`. (source: biomejs-css-rules-2026.md)

## Code fixes

Many rules provide automatic code fixes in two categories. (source: biomejs-linter-overview-2026.md)

**Safe fixes** are guaranteed not to change program semantics. They can be applied automatically on save. Apply with `--write`:

```bash
biome lint --write ./src
```

**Unsafe fixes** may change program semantics and require manual review. Apply with `--write --unsafe`:

```bash
biome lint --write --unsafe ./src
```

Individual rules can have their fix behavior configured to `"none"`, `"safe"`, or `"unsafe"`:

```json
{
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": {
          "level": "error",
          "fix": "none"
        }
      }
    }
  }
}
```

(source: biomejs-linter-overview-2026.md)

## Rule configuration

### Severity

Rules ship with a default severity. Available severity levels: `"on"` (use default), `"off"`, `"info"`, `"warn"`, `"error"`. Errors cause a nonzero exit code. Warnings cause a nonzero exit only with `--error-on-warnings`. Info never affects the exit code. (source: biomejs-linter-overview-2026.md)

Severity can be set at the individual rule level or at the group level:

```json
{
  "linter": {
    "rules": {
      "a11y": "off",
      "suspicious": {
        "noDebugger": "error"
      }
    }
  }
}
```

(source: biomejs-linter-overview-2026.md)

### Rule options

Some rules accept an `options` object alongside `level`:

```json
{
  "linter": {
    "rules": {
      "style": {
        "useNamingConvention": {
          "level": "error",
          "options": { "strictCase": false }
        }
      }
    }
  }
}
```

(source: biomejs-linter-overview-2026.md)

### Preset

The `linter.rules.preset` field accepts `"recommended"` (default), `"all"`, or `"none"`. (source: biomejs-configuration-reference-2026.md)

### CLI filtering

Use `--only` and `--skip` to run or exclude specific rules or groups:

```bash
biome lint --only=style/useNamingConvention --skip=a11y
```

(source: biomejs-linter-overview-2026.md)

## Domains

Domains group rules by technology: `"react"`, `"solid"`, `"test"`, `"project"`, `"types"`. Each domain has its own recommended set. Biome auto-enables domain rules when it detects matching dependencies in `package.json`. Manual configuration:

```json
{
  "linter": {
    "domains": {
      "test": "recommended",
      "react": "all"
    }
  }
}
```

Values: `"recommended"`, `"all"`, `"off"`. (source: biomejs-linter-overview-2026.md)

The `types` domain (added in v2.4) specifically enables rules requiring type inference, such as `noFloatingPromises`, `noMisusedPromises`, and `useAwaitThenable`. (source: biomejs-v2-4-release-2026.md)

## Scanner

Biome v2 introduced a Scanner that crawls project files to build a module graph and infer types. It is opt-in and activates only when project-domain rules are enabled. (source: biomejs-v2-announcement-2025.md, biomejs-linter-overview-2026.md)

Performance impact:

| Project size | Without Scanner | With Scanner |
| --- | --- | --- |
| ~2k files | ~800ms | ~2s |
| ~5k files | ~1000ms | ~8s |

The Scanner also scans `.d.ts` files inside `node_modules` (including transitive dependencies) for type inference, which can increase memory usage. (source: biomejs-linter-overview-2026.md)

## Suppression comments

Three suppression forms are available. (source: biomejs-v2-announcement-2025.md)

**Inline** suppresses a single node:
```js
// biome-ignore lint/suspicious/noDebugger: reason
debugger;
```

**File-wide** suppresses the entire file (must be at the top):
```js
// biome-ignore-all lint/suspicious/noDebugger: reason
```

**Range** suppresses a block of code:
```js
// biome-ignore-start lint/suspicious/noDebugger: reason
debugger;
debugger;
// biome-ignore-end lint/suspicious/noDebugger
```

The `biome-ignore-end` comment is optional if the suppression should run to the end of the file. (source: biomejs-v2-announcement-2025.md)

## Related pages

- [[biome]]
- [[biome-configuration]]
- [[biome-formatter]]
- [[biome-migration]]
