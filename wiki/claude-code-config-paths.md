# Claude Code Config Paths

Where Claude Code stores configuration, state, and managed policy files across platforms.

## User-level paths

On all platforms, user-level configuration lives in `~/.claude/` (on Windows, `%USERPROFILE%\.claude\`). The main files (source: claude-code-settings-docs-2026.md):

| File | Contents |
|------|----------|
| `~/.claude/settings.json` | User settings (permissions, hooks, env vars, preferences) |
| `~/.claude/agents/` | User-scoped subagent definitions |
| `~/.claude/CLAUDE.md` | User-scoped project instructions |
| `~/.claude.json` | OAuth session, MCP server configs, per-project state, caches |

The `~/.claude.json` file also stores metadata: startup count, tips history, install method, auto-update preferences (source: claude-code-xdg-issue-11343-2025.md).

## Project-level paths

Project settings live in the repository (source: claude-code-settings-docs-2026.md):

| File | Shared | Purpose |
|------|--------|---------|
| `.claude/settings.json` | Yes (git) | Team-shared settings |
| `.claude/settings.local.json` | No (gitignored) | Personal project overrides |
| `.claude/agents/` | Yes (git) | Project subagent definitions |
| `.mcp.json` | Yes (git) | Project MCP server configs |
| `CLAUDE.md` or `.claude/CLAUDE.md` | Yes (git) | Project instructions |
| `CLAUDE.local.md` | No | Personal project instructions |

When Claude Code writes to `.claude/settings.local.json`, it adds the file to the global git excludes, checking `core.excludesFile`, then `$XDG_CONFIG_HOME/git/ignore`, then `~/.config/git/ignore` (source: claude-code-settings-docs-2026.md).

## Managed settings paths

Managed settings are enforced by IT/DevOps and cannot be overridden by any other scope (source: claude-code-settings-docs-2026.md).

| Platform | File path | Other mechanisms |
|----------|-----------|-----------------|
| macOS | `/Library/Application Support/ClaudeCode/managed-settings.json` | MDM via `com.anthropic.claudecode` managed preferences domain |
| Linux/WSL | `/etc/claude-code/managed-settings.json` | None |
| Windows | `C:\Program Files\ClaudeCode\managed-settings.json` | Registry: `HKLM\SOFTWARE\Policies\ClaudeCode` (admin) or `HKCU\SOFTWARE\Policies\ClaudeCode` (user) |

A drop-in directory `managed-settings.d/` alongside the base file allows merging multiple policy files. Files are sorted alphabetically and merged on top of the base. Numeric prefixes control order (e.g., `10-telemetry.json`, `20-security.json`) (source: claude-code-settings-docs-2026.md).

## Settings precedence

From highest to lowest priority (source: claude-code-settings-docs-2026.md):

1. Managed (cannot be overridden)
2. Command-line arguments
3. Local (`.claude/settings.local.json`)
4. Project (`.claude/settings.json`)
5. User (`~/.claude/settings.json`)

Permission rules merge across scopes rather than overriding. Arrays concatenate and de-duplicate. Objects deep-merge. Scalar values are overridden by higher-priority scopes (source: claude-code-settings-docs-2026.md).

## XDG compliance

Claude Code does not follow the [[xdg-base-directory]] specification. Config and state files go to `~/.claude/` and `~/.claude.json` rather than `$XDG_CONFIG_HOME/claude/`, `$XDG_DATA_HOME/claude/`, or `$XDG_CACHE_HOME/claude/` (source: claude-code-xdg-issue-1455-2025.md).

A `CLAUDE_CONFIG_DIR` environment variable exists for partial relocation, but the default behavior does not respect XDG variables (source: claude-code-xdg-issue-1455-2025.md).

Open issues requesting XDG support: #1455 (open, May 2025), #11343 (closed as duplicate, November 2025) (source: claude-code-xdg-issue-1455-2025.md, claude-code-xdg-issue-11343-2025.md).

Rationale for XDG compliance includes: home directory cleanliness, container/Flatpak/snap compatibility, backup/migration separation of config vs. cache, and alignment with modern CLI tools like ripgrep, fd, bat, and starship that already support XDG (source: claude-code-xdg-issue-1455-2025.md, claude-code-xdg-issue-11343-2025.md).

Related pages: [[xdg-base-directory]], [[windows-known-folders]], [[claude-code-hooks]]
