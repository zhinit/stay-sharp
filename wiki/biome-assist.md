# Biome Assist

Biome Assist provides actions that improve code quality and developer experience. Unlike [[biome-linter|linter]] rules, assist actions always offer a code fix and do not emit diagnostics. They sort properties, simplify expressions, perform refactorings, and similar improvements. Assist fixes are generally safe to apply. There are currently 10 assist actions available. (source: biomejs-assist-overview-2026.md)

## History

Before Biome v2, the Import Organizer existed as a special case, neither part of the linter nor the formatter. In v2, Biome generalized such use cases into the Assist framework. The Import Organizer became an assist action alongside new actions like `useSortedKeys` and `useSortedAttributes`. (source: biomejs-v2-announcement-2025.md)

## Source group

All current assist actions belong to the `source` group. These actions can be safely applied to a document on save because they typically do not change program functionality. (source: biomejs-assist-overview-2026.md)

## Import organizer

The Import Organizer was revamped in v2 with three improvements over v1. (source: biomejs-v2-announcement-2025.md)

**Blank-line-separated groups**: In v1, imports separated by blank lines were sorted independently and could not be moved across blank lines. In v2, imports sort correctly across blank line boundaries while preserving intentional group separators.

**Duplicate merging**: Imports from the same module are now merged:

```js
// before
import { util1 } from "./utils.js";
import { util2 } from "./utils.js";

// after
import { util1, util2 } from "./utils.js";
```

**Custom ordering**: Users can configure import ordering by distance, namespace, or custom patterns (e.g., node builtins first, then organization packages, then third-party).

Additional improvements include support for organizing `export` statements, "detached" comments to explicitly separate import chunks, and import attribute sorting. (source: biomejs-v2-announcement-2025.md)

## useSortedKeys

Sorts keys in object literals alphabetically. In v2.4, a `groupByNesting` option was added: simple values (primitives, single-line arrays/objects) sort first, followed by nested values (multi-line arrays/objects). (source: biomejs-v2-announcement-2025.md, biomejs-v2-4-release-2026.md)

```json
{
  "assist": {
    "actions": {
      "source": {
        "useSortedKeys": {
          "level": "on",
          "options": { "groupByNesting": true }
        }
      }
    }
  }
}
```

(source: biomejs-v2-4-release-2026.md)

## useSortedAttributes

Sorts attributes in JSX elements. (source: biomejs-v2-announcement-2025.md)

## v2.4 additions

**Duplicate CSS class removal**: Removes duplicate CSS classes from JSX and HTML class attributes. (source: biomejs-v2-4-release-2026.md)

**TypeScript interface member sorting**: Sorts members within TypeScript interfaces, grouping call signatures separately from property signatures. (source: biomejs-v2-4-release-2026.md)

## Configuration

Assist is enabled by default with some actions in the recommended set. (source: biomejs-assist-overview-2026.md)

```json
{
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "useSortedKeys": "on"
      }
    }
  }
}
```

## IDE integration

In LSP-compatible editors, assist actions execute on save using code action codes. The general code action is `source.fixAll.biome`. Individual actions have specific codes, for example `source.action.useSortedKeys.biome`. (source: biomejs-assist-overview-2026.md)

VS Code configuration:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "explicit"
  }
}
```

Zed configuration:

```json
{
  "code_actions_on_format": {
    "source.fixAll.biome": true
  }
}
```

(source: biomejs-assist-overview-2026.md)

## CLI enforcement

Assist actions can be enforced via the `check` command:

```bash
biome check ./src
```

To check only assist actions, disable other tools:

```bash
biome check --formatter-enabled=false --linter-enabled=false ./src
```

To run `check` without enforcing assists:

```bash
biome check --enforce-assist=false ./src
```

(source: biomejs-assist-overview-2026.md)

## Related pages

- [[biome]]
- [[biome-configuration]]
- [[biome-linter]]
- [[biome-editor-integration]]
