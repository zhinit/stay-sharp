# Bun Test Runner

[[bun|Bun]] includes a fast, built-in, Jest-compatible test runner with native TypeScript support (source: bun-docs-test-2026.md).

## File patterns

The test runner automatically discovers files matching these patterns (source: bun-docs-test-2026.md):

- `*.test.{js|jsx|ts|tsx|mjs|cjs|mts|cts}`
- `*_test.{js|jsx|ts|tsx|mjs|cjs|mts|cts}`
- `*.spec.*` and `*_spec.*` variants

Run with `bun test`, or `bun test ./path/to/file.test.ts` for a single file.

## Test API

Tests use Jest-compatible syntax imported from `bun:test` (source: bun-docs-test-2026.md):

```typescript
import { test, expect, describe, beforeEach, mock } from "bun:test";

describe("suite", () => {
  beforeEach(() => { /* setup */ });
  test("assertion", () => {
    expect(value).toBe(expected);
  });
});
```

Lifecycle hooks `beforeAll`, `beforeEach`, `afterEach`, and `afterAll` work as in Jest (source: bun-docs-test-2026.md).

Test variants control execution behavior: `test.concurrent()` runs the test in parallel with others, `test.serial()` forces sequential execution, and `test.todo()` marks a placeholder for unimplemented tests (source: bun-docs-test-2026.md).

Mock functions are available via `mock()` or `jest.fn()` (source: bun-docs-test-2026.md).

## CLI flags

**Execution control** (source: bun-docs-test-2026.md):
- `--timeout` sets per-test timeout in milliseconds (default 5000)
- `--concurrent` runs all tests in parallel
- `--max-concurrency` limits concurrent tests (default 20)
- `--retry` automatically retries failed tests
- `--rerun-each` executes each test multiple times
- `--randomize` and `--seed` randomize test order
- `--bail` exits after N failures

**Filtering** (source: bun-docs-test-2026.md):
- `-t` / `--test-name-pattern` filters by test name regex
- Positional arguments filter by file path

**Reporting** (source: bun-docs-test-2026.md):
- `--coverage` generates a coverage report
- `--coverage --coverage-reporter=lcov` outputs LCOV format for CI
- `--reporter=junit` with `--reporter-outfile` produces JUnit XML

**Snapshots** (source: bun-docs-test-2026.md):
- `--update-snapshots` / `-u` refreshes snapshot files

## CI integration

On GitHub Actions, Bun auto-detects the environment and emits inline annotations for failed tests (source: bun-docs-test-2026.md). For GitLab and other platforms, use `--reporter=junit` for standard XML reports.

Test sharding with `--shard=i/n` splits the test suite across CI machines. Combine with `--timings` and `--update-timings` to balance shards by duration rather than file count (source: bun-docs-test-2026.md).

## Large codebase optimization

For projects with thousands of test files, stack these techniques (source: bun-docs-test-2026.md):

1. `--parallel` assigns one worker per CPU core
2. `--no-isolate` reuses global scope across tests when safe
3. `--shard=i/n` splits across CI machines
4. `--timings` balances by measured duration
5. `test.concurrent()` parallelizes I/O-bound tests within a file

## AI agent output

Setting environment variables suppresses passing/skipped test output while preserving failures and summaries (source: bun-docs-test-2026.md): `CLAUDECODE=1` for Claude Code, `REPL_ID=1` for Replit, or `AGENT=1` as a generic flag.

## Configuration

Test runner settings live in the `[test]` section of [[bun-configuration|bunfig.toml]], covering root directory, preload scripts, path ignore patterns, coverage thresholds, and reporter options (source: bun-docs-configuration-2026.md).

**Related pages:** [[bun]], [[bun-configuration]], [[bun-runtime]]
