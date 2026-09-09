# Biome CLI

The Biome CLI runs as a standalone executable or via package managers (`npx @biomejs/biome`, `pnpx`, `bunx --bun`, `deno run -A npm:@biomejs/biome`, `yarn exec biome`). It does not require Node.js when installed standalone. (source: biomejs-cli-reference-2026.md)

## Commands

### biome check

Checks files for formatting, linting, and assist actions. The primary all-in-one command.

Key flags: `--write`/`--fix` (apply fixes), `--unsafe` (allow unsafe fixes), `--formatter-enabled`, `--linter-enabled`, `--assist-enabled` (toggle tools), `--enforce-assist` (fail if actions not applied, default true), `--staged` (staged files only), `--changed` (committed changes vs default branch), `--since=REF` (override default branch for `--changed`), `--watch` (reprocess on file changes), `--only`/`--skip` (filter rules/groups/domains), `--profile-rules` (rule timing), `--stdin-file-path=PATH` (read from stdin). (source: biomejs-cli-reference-2026.md)

### biome lint

Runs the linter only. Same filtering flags as `check` plus `--suppress` (write suppression comments instead of fixes) and `--reason=STRING` (explanation for suppressions). (source: biomejs-cli-reference-2026.md)

### biome format

Formats files. Flags: `--write`/`--fix`, `--staged`, `--changed`, `--since`, `--watch`, `--stdin-file-path`. (source: biomejs-cli-reference-2026.md)

### biome ci

Runs formatting checks, linting, and assist in CI without modifying files. No `--write` flag. Integrates with platform-specific reporters (GitHub annotations, GitLab Code Quality). Accepts `--threads=NUMBER` (or `BIOME_THREADS` env var) for resource-limited environments. When VCS is enabled, uses `--changed` instead of `--staged` since remotes lack staged files. (source: biomejs-cli-reference-2026.md)

### biome init

Creates a default `biome.json` (or `biome.jsonc` with `--jsonc`). (source: biomejs-cli-reference-2026.md)

### biome migrate

Previews config updates for breaking changes. Subcommands:
- `biome migrate prettier` imports Prettier config and ignores
- `biome migrate eslint` imports ESLint config (flags: `--include-inspired`, `--include-nursery`)
- `--write`/`--fix` applies changes

(source: biomejs-cli-reference-2026.md)

### biome search

Experimental. Finds code matching a GritQL pattern. Read-only (no rewrites). Use `--language=<css|javascript|json>` to select grammar (default: `javascript`). (source: biomejs-cli-reference-2026.md)

```bash
biome search '`console.log($message)`' ./src
```

### biome explain

Prints documentation for a lint rule or `daemon-logs` path. (source: biomejs-cli-reference-2026.md)

```bash
biome explain noDebugger
```

### biome rage

Prints troubleshooting info: CLI, platform, environment, config, workspace, and daemon details. Flags: `--daemon-logs`, `--formatter`, `--linter`. (source: biomejs-cli-reference-2026.md)

### biome version

Prints CLI version and daemon connection info. (source: biomejs-cli-reference-2026.md)

### biome upgrade

Upgrades standalone or Homebrew installations. Set `BIOME_DISTRIBUTION` to override detection. Cannot update npm-installed Biome. (source: biomejs-cli-reference-2026.md)

### biome start / biome stop

Start or stop the Biome daemon server for editor integration. (source: biomejs-cli-reference-2026.md)

### biome lsp-proxy

Starts the daemon and forwards LSP messages between the server and stdio. (source: biomejs-cli-reference-2026.md)

### biome clean

Removes daemon server log files. (source: biomejs-cli-reference-2026.md)

## Global flags

| Flag | Description | Default |
|------|-------------|---------|
| `--colors=<off\|force>` | ANSI styling control | auto |
| `--use-server` | Connect to running daemon | off |
| `--verbose` | Show additional diagnostics | off |
| `--config-path=PATH` | Override config file discovery (`BIOME_CONFIG_PATH`) | auto |
| `--max-diagnostics=<none\|NUMBER>` | Limit displayed diagnostics | `20` |
| `--skip-parse-errors` | Skip files with syntax errors | off |
| `--no-errors-on-unmatched` | No error when no files match | off |
| `--error-on-warnings` | Exit with error on warnings | off |
| `--diagnostic-level=<info\|warn\|error>` | Minimum severity to display | `info` |

(source: biomejs-cli-reference-2026.md)

## Reporter formats

Set with `--reporter=FORMAT`. Use `--reporter-file=PATH` to write to a file. Multiple `--reporter` flags produce multiple outputs. (source: biomejs-cli-reference-2026.md)

| Format | Description |
|--------|-------------|
| `default` | Full diagnostics and summary |
| `concise` | One line per diagnostic |
| `summary` | Diagnostics grouped by category |
| `json` | Machine-readable JSON (experimental) |
| `json-pretty` | Pretty-printed JSON (experimental) |
| `github` | GitHub workflow annotations |
| `gitlab` | GitLab Code Quality report |
| `junit` | JUnit XML |
| `checkstyle` | Checkstyle XML |
| `rdjson` | Reviewdog diagnostic JSON |
| `sarif` | SARIF static analysis format |

(source: biomejs-cli-reference-2026.md)

## Configuration override flags

CLI flags override `biome.json` settings. Global formatter options: `--indent-style`, `--indent-width`, `--line-width`, `--line-ending`, `--bracket-spacing`, `--delimiter-spacing`, `--expand`, `--attribute-position`, `--trailing-newline`, `--use-editorconfig`. (source: biomejs-cli-reference-2026.md)

Language-specific flags follow the pattern `--<language>-formatter-<option>` (e.g. `--javascript-formatter-quote-style=single`, `--css-formatter-enabled=false`, `--html-formatter-whitespace-sensitivity=strict`). Language-specific linter and assist toggles: `--<language>-linter-enabled`, `--<language>-assist-enabled`. (source: biomejs-cli-reference-2026.md)

JS-specific: `--trailing-commas`, `--semicolons`, `--arrow-parentheses`, `--quote-properties`, `--jsx-quote-style`, `--bracket-same-line`, `--jsx-everywhere`. (source: biomejs-cli-reference-2026.md)

## Daemon server flags

`--watcher-kind=<polling|recommended|none>` (default `recommended`, env `BIOME_WATCHER_KIND`). `--watcher-polling-interval=NUMBER` (default `2000`ms, env `BIOME_WATCHER_POLLING_INTERVAL`). (source: biomejs-cli-reference-2026.md)

## Logging flags

| Flag | Env var | Default |
|------|---------|---------|
| `--log-file=PATH` | `BIOME_LOG_FILE` | stdout |
| `--log-level=<none\|tracing\|debug\|info\|warn\|error>` | `BIOME_LOG_LEVEL` | `none` |
| `--log-kind=<pretty\|compact\|json>` | `BIOME_LOG_KIND` | `pretty` |
| `--log-path=PATH` | `BIOME_LOG_PATH` | platform cache dir |
| `--log-prefix-name=STRING` | `BIOME_LOG_PREFIX_NAME` | `server.log` |

(source: biomejs-cli-reference-2026.md)

## Related pages

- [[biome]]
- [[biome-configuration]]
- [[biome-ci-hooks]]
