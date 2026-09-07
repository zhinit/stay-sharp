# Bun Configuration

[[bun|Bun]] is configured through `bunfig.toml`, an optional TOML file placed in the project root alongside `package.json` (source: bun-docs-configuration-2026.md).

## Configuration hierarchy

Settings resolve in this order, with earlier entries taking precedence: CLI flags, local `bunfig.toml`, global `~/.bunfig.toml` (or `$XDG_CONFIG_HOME/.bunfig.toml`), built-in defaults (source: bun-docs-configuration-2026.md). The global config applies only to package manager commands.

## Runtime settings

Top-level keys in `bunfig.toml` control runtime behavior (source: bun-docs-configuration-2026.md):

- `preload` lists scripts or plugins to run before the main entry point
- `jsx` configures JSX compilation (also settable via `tsconfig.json`)
- `smol` enables reduced memory mode with more frequent garbage collection
- `logLevel` sets output verbosity: `"debug"`, `"warn"`, or `"error"`
- `define` replaces global identifiers with compile-time constants
- `loader` maps file extensions to built-in loaders
- `telemetry` controls crash reports (enabled by default)
- `env` controls automatic `.env` file loading
- `console.depth` sets the default object inspection depth (default 2)

## Server settings

The `[serve]` section configures `Bun.serve()` defaults (source: bun-docs-configuration-2026.md):

- `port` sets the default listening port (default 3000, overridable via `BUN_PORT`, `PORT`, or `--port`)

## Test runner settings

The `[test]` section configures `bun test` (source: bun-docs-configuration-2026.md):

- `root` sets the test directory (default `.`)
- `preload` lists test-specific setup files
- `pathIgnorePatterns` excludes directories via globs
- `coverage` enables coverage reporting
- `coverageThreshold` requires minimum coverage percentages
- `coverageReporter` sets output format (`"text"`, `"lcov"`, etc.)
- `randomize` runs tests in random order
- `seed` sets a reproducible randomization value
- `retry` configures failed test retry count
- `concurrentTestGlob` sets a pattern for concurrent test execution
- `reporter.dots` enables dot-notation output
- `reporter.junit` specifies a JUnit XML output file

## Package manager settings

The `[install]` section configures `bun install` behavior (source: bun-docs-configuration-2026.md):

**Dependency control:** `optional`, `dev`, and `peer` toggle which dependency types are installed. `production` skips dev dependencies and freezes the lockfile.

**Version resolution:** `exact` uses exact versions instead of caret ranges. `prefer` sets the resolution strategy: `"online"`, `"offline"`, or `"latest"`. `minimumReleaseAge` filters packages by publication recency in seconds.

**Module layout:** `auto` controls `node_modules` resolution. `linker` sets the layout strategy to `"hoisted"` (npm-style) or `"isolated"` (pnpm-style). `globalStore` enables a shared store across projects.

**Registry and auth:** `registry` sets the default registry URL and credentials. `scopes` configures per-scope registries with token/password authentication. `ca` and `cafile` set SSL certificates.

**Advanced:** `ignoreScripts` skips lifecycle scripts. `concurrentScripts` limits parallel script execution. `frozenLockfile` prevents lockfile modifications. `dryRun` resolves without installing. `cache` configures the cache directory. `globalDir` and `globalBinDir` set global installation paths. `security.scanner` names the vulnerability scanning package. `hoist` enables a fallback directory in isolated linker mode.

## Script execution settings

The `[run]` section configures `bun run` (source: bun-docs-configuration-2026.md):

- `shell` chooses `"bun"` (cross-platform) or `"system"` shell
- `bun` auto-aliases `node` to `bun` in scripts
- `silent` suppresses command output reporting
- `elide-lines` truncates output to the last N lines
- `noOrphans` terminates child processes when the parent exits

## TypeScript integration

JSX and path alias configuration can live in `tsconfig.json` or `jsconfig.json` instead of `bunfig.toml`. See [[bun-modules]] for path alias details.

**Related pages:** [[bun]], [[bun-runtime]], [[bun-package-manager]], [[bun-test-runner]], [[bun-modules]]
