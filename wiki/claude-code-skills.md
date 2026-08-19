# Claude Code Skills

Skills are prompt-based instructions that extend what Claude can do inside a Claude Code session. A skill is a `SKILL.md` file with YAML frontmatter and markdown content. Claude loads the skill when relevant (model-invoked) or when the user types `/skill-name` (user-invoked) (source: claude-code-skills-reference-2026.md).

## How they work

Skills load into the active session's context. When invoked, Claude Code reads the `SKILL.md`, runs any dynamic context injection commands, and passes the resulting instructions to Claude. Claude then follows the instructions using its tools. Unlike CLAUDE.md content, a skill's body loads only when used, so long reference material costs almost nothing until needed (source: claude-code-skills-reference-2026.md).

Custom commands (`.claude/commands/`) have been merged into skills. A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` (source: claude-code-skills-reference-2026.md).

Skills follow the Agent Skills open standard (agentskills.io), which works across multiple AI tools. Claude Code extends the standard with invocation control, subagent execution, and dynamic context injection (source: claude-code-skills-reference-2026.md).

## Skill locations

| Location | Path | Scope |
|---|---|---|
| Enterprise | Managed settings | All users in org |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where plugin is enabled |

Enterprise overrides personal, personal overrides project. Any of these overrides a bundled skill with the same name. Plugin skills use a `plugin-name:skill-name` namespace. Nested `.claude/skills/` in subdirectories are loaded when Claude reads or edits files in that subdirectory (source: claude-code-skills-reference-2026.md).

## Skill directory structure

```
my-skill/
├── SKILL.md           # Main instructions (required)
├── template.md        # Template for Claude to fill in
├── examples/
│   └── sample.md      # Example output
└── scripts/
    └── validate.sh    # Script Claude can execute
```

(source: claude-code-skills-reference-2026.md)

## Dynamic context injection

The `` !`command` `` syntax runs a shell command and inlines its output before Claude sees the skill content. This grounds the instructions in live data (e.g. `` !`git diff HEAD` ``). Commands run in the project directory (source: claude-code-skills-reference-2026.md).

## Subagent execution

Skills can run in a subagent for isolation, configured via frontmatter. The subagent runs in its own context and returns a summary (source: claude-code-skills-reference-2026.md).

## Bundled skills

Claude Code includes built-in skills: `/doctor`, `/code-review`, `/batch`, `/debug`, `/loop`, `/run`, `/verify`, `/run-skill-generator`, and `/claude-api`. These are prompt-based and use Claude's tools. `/run` and `/verify` work together to launch the app and confirm changes against the running app. `/run-skill-generator` records the launch recipe as a project skill. All can be disabled with `disableBundledSkills` (source: claude-code-skills-reference-2026.md).

## Live change detection

Claude Code watches skill directories for file changes. Adding, editing, or removing a skill under `~/.claude/skills/` or the project `.claude/skills/` is picked up within the current session without a restart (source: claude-code-skills-reference-2026.md).

## Related pages

[[claude-code-hooks]] | [[claude-code-plugins]] | [[claude-agent-sdk]] | [[claude-code-headless]]
