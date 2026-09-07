# Bun Shell

[[bun|Bun]] provides a cross-platform shell scripting API through the `$` template literal tag, enabling bash-like operations with JavaScript interop (source: bun-docs-shell-2026.md). Introduced in version 1.1 (2024) alongside Windows support (source: wikipedia-bun-software-2026.md).

## Basic syntax

Import and use the `$` tag from `"bun"` (source: bun-docs-shell-2026.md):

```typescript
import { $ } from "bun";
await $`echo "Hello World!"`;
```

## Output methods

Command output can be consumed in several formats (source: bun-docs-shell-2026.md):

- `.text()` returns output as a string
- `.json()` parses output as JSON
- `.lines()` iterates output line by line
- `.blob()` returns output as a Blob
- `.quiet()` suppresses output to the terminal

## Piping and redirection

Standard bash pipe and redirection operators work (source: bun-docs-shell-2026.md):

- `|` pipes stdout between commands
- `>` and `>>` redirect stdout (overwrite and append)
- `2>` and `2>>` redirect stderr
- `&>` and `&>>` redirect both stdout and stderr
- `<` provides stdin input

Redirection works with JavaScript objects, not just files. A `Buffer`, `Response`, or `Bun.file()` can be used as a source or destination (source: bun-docs-shell-2026.md):

```typescript
const response = new Response("hello");
const result = await $`cat < ${response}`.text();
```

## Environment and working directory

Set environment variables and working directory per-command or globally (source: bun-docs-shell-2026.md):

```typescript
await $`echo $FOO`.env({ FOO: "bar" });

$.env({ FOO: "bar" });
$.cwd("/tmp");
```

## Error handling

Non-zero exit codes throw errors by default. Disable this with `.nothrow()` (source: bun-docs-shell-2026.md):

```typescript
try {
  await $`failing-command`.text();
} catch (err) {
  console.log(err.exitCode);
}

await $`maybe-fails`.nothrow().quiet();
```

## Security

The shell does not invoke a system shell. Interpolated JavaScript variables are treated as single, literal strings, preventing command injection attacks (source: bun-docs-shell-2026.md). Explicitly invoking a system shell (e.g., `bash -c`) bypasses this protection.

## Builtin commands

Bun implements these commands natively for cross-platform compatibility: `cd`, `ls`, `rm`, `echo`, `pwd`, `cat`, `touch`, `mkdir`, `which`, `mv`, `cp`, and others (source: bun-docs-shell-2026.md). This eliminates the need for platform-specific shell scripting.

## Utilities

`$.braces()` implements brace expansion and `$.escape()` escapes shell special characters (source: bun-docs-shell-2026.md).

**Related pages:** [[bun]], [[bun-runtime]], [[bun-file-io]]
