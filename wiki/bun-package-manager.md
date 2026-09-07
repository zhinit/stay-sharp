# Bun Package Manager

[[bun|Bun]] includes a Node.js-compatible package manager that replaces npm, yarn, and pnpm. It reports installation speeds up to 25x faster than npm through optimized system-level operations (source: bun-docs-install-2026.md).

## Commands

Core commands follow npm conventions (source: deployhq-bun-cheatsheet-2026.md):

- `bun install` installs all project dependencies
- `bun add react react-dom` adds packages
- `bun add -d typescript` adds dev dependencies
- `bun add -g typescript` installs globally
- `bun remove lodash` uninstalls a package
- `bun update` updates within semver ranges
- `bun outdated` shows outdated packages

Non-npm sources are supported: `bun add github:facebook/react` for GitHub repos, `bun add jsr:@std/path` for the JSR registry, plus git URLs, tarballs, and local file paths (source: deployhq-bun-cheatsheet-2026.md).

## Linker strategies

Two `node_modules` layout strategies are available (source: bun-docs-install-2026.md):

- `--linker hoisted` uses the traditional npm-style flattened structure where all dependencies are lifted to the top level.
- `--linker isolated` uses pnpm-style isolation, preventing "phantom dependencies" where code accidentally imports packages not listed in its own package.json.

## Lockfile

Bun generates a text-based `bun.lock` file. This replaced the older binary `bun.lockb` format (source: deployhq-bun-cheatsheet-2026.md). The text format is diffable and should be committed to version control. Running `bun install --lockfile-only` updates only the lockfile without modifying `node_modules` (source: deployhq-bun-cheatsheet-2026.md).

Bun can auto-convert from pnpm's `pnpm-lock.yaml` to `bun.lock` during migration (source: bun-docs-install-2026.md).

## Workspaces

Monorepos use the standard `package.json` `"workspaces"` field (source: deployhq-bun-cheatsheet-2026.md):

```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

The `--filter` flag targets specific packages: `bun run --filter '*' build` runs the build script across all workspaces, and `bun add lodash --filter @scope/some-package` installs to a specific workspace (source: deployhq-bun-cheatsheet-2026.md).

## Security

Bun executes lifecycle scripts only for explicitly trusted packages, protecting against supply-chain attacks from postinstall scripts in untrusted dependencies (source: bun-docs-install-2026.md). The `--minimum-release-age` flag filters packages by how recently they were published, adding another supply-chain defense layer (source: bun-docs-install-2026.md).

## Performance

Installation performance comes from platform-specific file operations: `clonefile` on macOS, `hardlink` on Linux and Windows, with `copyfile` as a fallback (source: bun-docs-install-2026.md). A global cache avoids redundant downloads across projects.

## CI/CD

For reproducible builds, `--frozen-lockfile` fails if the lockfile would need updating, and `--production` skips dev dependencies (source: bun-docs-install-2026.md). The `bun ci` command enforces locked versions strictly (source: bun-docs-install-2026.md).

A typical CI setup with GitHub Actions (source: deployhq-bun-cheatsheet-2026.md):

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: 1.1.34
- run: bun install --frozen-lockfile
```

## Environment variables

Bun auto-loads `.env` files in this order: `.env`, `.env.local`, `.env.${NODE_ENV}`, `.env.${NODE_ENV}.local` (source: deployhq-bun-cheatsheet-2026.md). Override with `--env-file=.env.staging` for a specific file.

## Configuration

Package manager behavior is configurable through the `[install]` section of [[bun-configuration|bunfig.toml]] or environment variables like `BUN_CONFIG_REGISTRY` and `BUN_CONFIG_TOKEN` (source: bun-docs-install-2026.md).

**Related pages:** [[bun]], [[bun-configuration]], [[bun-runtime]]
