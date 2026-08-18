# Claude Code Plugins

Plugins are self-contained directories that extend Claude Code with custom functionality. They provide a distribution and installation mechanism for sharing tooling across projects and teams (source: claude-code-plugins-readme-2026.md).

## Components

A plugin can bundle any combination of (source: claude-code-plugins-reference-2026.md):

- **Skills** -- prompt-based instructions in `skills/` or flat `.md` files in `commands/`
- **Agents** -- specialized subagents in `agents/`
- **Hooks** -- event handlers in `hooks/hooks.json`
- **MCP servers** -- external tool configuration in `.mcp.json`
- **LSP servers** -- language server protocol for code intelligence in `.lsp.json`
- **Monitors** -- background processes delivering notifications in `monitors/monitors.json`
- **Executables** -- binaries in `bin/` added to the Bash tool's PATH
- **Themes** -- color theme definitions (experimental)

## Plugin structure

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest (optional, only `name` required)
├── skills/                   # Skill definitions
├── commands/                 # Flat skill files
├── agents/                   # Subagent definitions
├── hooks/
│   └── hooks.json           # Hook configurations
├── .mcp.json                # MCP server definitions
├── .lsp.json                # LSP server configurations
├── monitors/
│   └── monitors.json        # Background monitors
├── bin/                     # Executables added to PATH
└── scripts/                 # Utility scripts
```

(source: claude-code-plugins-reference-2026.md)

## Plugin manifest

The `.claude-plugin/plugin.json` file defines metadata. Only `name` is required. Key fields include `displayName`, `version` (semver for update tracking), `skills`, `commands`, `agents`, `hooks`, `mcpServers`, `lspServers`, `userConfig` (user-configurable values prompted at enable time), and `dependencies` (other required plugins with optional semver constraints) (source: claude-code-plugins-reference-2026.md).

## Installation scopes

| Scope | Settings file | Use case |
|---|---|---|
| `user` | `~/.claude/settings.json` | Personal, all projects (default) |
| `project` | `.claude/settings.json` | Team plugins via version control |
| `local` | `.claude/settings.local.json` | Project-specific, gitignored |
| `managed` | Managed settings | Org-controlled, read-only |

(source: claude-code-plugins-reference-2026.md)

## Installation and distribution

Plugins are installed via `claude plugin install <name>` from a marketplace, or loaded locally with `--plugin-dir ./path` or `--plugin-url https://...`. The `/plugin` command in Claude Code also manages installation (source: claude-code-plugins-create-2026.md).

Marketplaces are Git repositories with a `.claude-plugin/marketplace.json` manifest. They can be official, community, or private team/repo-based (source: claude-code-plugin-marketplaces-2026.md).

## Skills-directory plugins

Any folder with `.claude-plugin/plugin.json` under a skills directory loads automatically as `<name>@skills-dir`. Personal scope (`~/.claude/skills/`) loads in every project. Project scope (`.claude/skills/`) loads after workspace trust dialog. Use `claude plugin init <name>` to scaffold one (source: claude-code-plugins-reference-2026.md).

## User configuration

Define configurable options in `plugin.json` under `userConfig`. Values are prompted at enable time and available as `${user_config.KEY}` in MCP/LSP configs and skill content, and as `CLAUDE_PLUGIN_OPTION_<KEY>` environment variables (source: claude-code-plugins-reference-2026.md).

## Environment variables

`${CLAUDE_PLUGIN_ROOT}` (plugin install dir), `${CLAUDE_PLUGIN_DATA}` (persistent data dir surviving updates at `~/.claude/plugins/data/{id}/`), `${CLAUDE_PROJECT_DIR}` (project root) (source: claude-code-plugins-reference-2026.md).

## CLI commands

`claude plugin init`, `install`, `uninstall`, `enable`, `disable`, `update`, `list`, `details`, `prune`, `tag`, `validate` (source: claude-code-plugins-reference-2026.md).

## When to use plugins vs standalone config

| Approach | Skill names | Best for |
|---|---|---|
| Standalone (`.claude/` directory) | `/hello` | Personal workflows, project-specific, quick experiments |
| Plugins | `/plugin-name:hello` | Sharing with teammates, community distribution, versioned releases, reuse across projects |

Start with standalone, convert to plugin when ready to share (source: claude-code-plugins-create-2026.md).

## Relevance to StaySharp

A plugin is the right distribution wrapper if StaySharp is meant to be installed by others in one step. It can bundle a CLI executable (in `bin/`), hooks (to trigger on session events), skills, agents, and MCP servers together. The `userConfig` feature could prompt for preferences at install time. The plugin itself does not add new runtime capabilities beyond what [[claude-code-hooks]], [[claude-code-skills]], and [[claude-agent-sdk]] provide individually.

## Related pages

[[claude-code-hooks]] | [[claude-code-skills]] | [[claude-agent-sdk]] | [[claude-code-headless]]
