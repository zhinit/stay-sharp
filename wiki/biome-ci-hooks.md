# Biome CI and Git Hooks

## Continuous integration

### biome ci vs biome check

Use `biome ci` in CI pipelines instead of `biome check`. Key differences (source: biomejs-ci-integration-2026.md):

- No `--write`/`--fix` option (CI should only check, not modify).
- Better platform integration. On GitHub, diagnostics print as GitHub annotations.
- Allows controlling thread count.
- When VCS integration is enabled, uses `--changed` instead of `--staged` (remote repositories have no staged files concept).

### GitHub Actions

Biome provides a first-party GitHub Action for setup:

```yaml
name: Code quality
on:
  push:
  pull_request:
jobs:
  quality:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          persist-credentials: false
      - name: Setup Biome
        uses: biomejs/setup-biome@v2
        with:
          version: latest
      - name: Run Biome
        run: biome ci .
```

If the [[biome-configuration|Biome configuration]] extends a config from a package, set up Node.js and install dependencies before running Biome. (source: biomejs-ci-integration-2026.md)

### Third-party actions

[reviewdog-action-biome](https://github.com/marketplace/actions/run-biome-with-reviewdog) runs Biome with reviewdog, posting comments and commit suggestions on pull requests. (source: biomejs-ci-integration-2026.md)

### GitLab CI

Use the official Docker image `ghcr.io/biomejs/biome:latest` with `entrypoint: [""]`. Output a code quality report with `--reporter=gitlab --colors=off` and collect it as a `codequality` artifact. (source: biomejs-ci-integration-2026.md)

## Git hooks

Several tools manage Git hooks for running [[biome|Biome]] on staged files before commits. (source: biomejs-git-hooks-2026.md)

### Common flags

- `--no-errors-on-unmatched`: silences errors when no files match the glob.
- `--files-ignore-unknown=true`: skips files Biome does not recognize, handling current and future supported file types.

(source: biomejs-git-hooks-2026.md)

### Lefthook

Fast, cross-platform, dependency-free hook manager installable via NPM. (source: biomejs-git-hooks-2026.md)

Check only:

```yaml
pre-commit:
  commands:
    check:
      glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc,css}"
      run: npx @biomejs/biome check --no-errors-on-unmatched --files-ignore-unknown=true {staged_files}
```

With auto-fix (use `stage_fixed: true` to re-add fixed files):

```yaml
pre-commit:
  commands:
    check:
      glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc,css}"
      run: npx @biomejs/biome check --write --no-errors-on-unmatched --files-ignore-unknown=true {staged_files}
      stage_fixed: true
```

Run `lefthook install` after configuring. (source: biomejs-git-hooks-2026.md)

### Husky + lint-staged

Husky does not provide staged file lists on its own, so it pairs with lint-staged or git-format-staged. (source: biomejs-git-hooks-2026.md)

**.husky/pre-commit:**

```shell
lint-staged
```

**package.json:**

```json
{
  "lint-staged": {
    "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc,css}": [
      "biome check --write --no-errors-on-unmatched --files-ignore-unknown=true"
    ]
  }
}
```

(source: biomejs-git-hooks-2026.md)

### Husky + git-format-staged

Unlike lint-staged, git-format-staged does not use `git stash` internally, avoiding conflicts between unstaged changes and updated staged changes. (source: biomejs-git-hooks-2026.md)

**.husky/pre-commit:**

```shell
git-format-staged --formatter 'biome check --write --files-ignore-unknown=true --no-errors-on-unmatched --stdin-file-path="{}"' '*'
```

(source: biomejs-git-hooks-2026.md)

### pre-commit framework

Biome provides hooks via the [biomejs/pre-commit](https://github.com/biomejs/pre-commit) repository:

| Hook ID | Description |
|---------|-------------|
| `biome-ci` | Check formatting, import organization, and lint |
| `biome-check` | Format, organize imports, lint, and apply safe fixes |
| `biome-format` | Format committed files |
| `biome-lint` | Lint and apply safe fixes |

**.pre-commit-config.yaml:**

```yaml
repos:
  - repo: https://github.com/biomejs/pre-commit
    rev: "v2.0.6"
    hooks:
      - id: biome-check
        additional_dependencies: ["@biomejs/biome@2.1.1"]
```

The `additional_dependencies` option specifies which Biome version to install. For projects using npm, a local hook avoids maintaining versions in two places. (source: biomejs-git-hooks-2026.md)

### Shell scripts

Direct shell hooks work but may have cross-platform issues. Use the `--staged` flag:

```shell
#!/bin/sh
set -eu
npx @biomejs/biome check --staged --files-ignore-unknown=true --no-errors-on-unmatched
```

(source: biomejs-git-hooks-2026.md)

## Related pages

- [[biome]]
- [[biome-cli]]
- [[biome-configuration]]
