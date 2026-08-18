# Claude Code Subagents

Subagents are specialized AI assistants that run in their own context window
within a single Claude Code session. Each gets a custom system prompt, specific
tool access, and independent permissions. The main conversation delegates a
task, the subagent works independently, and only its summary returns.
(source: claude-code-subagents-2026.md)

Subagents work within a single session. For independent parallel sessions, see
[[claude-code-agent-view]]. (source: claude-code-subagents-2026.md)

## Built-in subagents

Claude Code ships four built-in types (source: claude-code-subagents-2026.md):

**Explore** -- read-only codebase search. Inherits the session model, capped at
Opus on Claude API. Skips CLAUDE.md and git status for speed.

**Plan** -- read-only research agent used during plan mode. Inherits the session
model. Also skips CLAUDE.md and git status.

**General-purpose** -- full tool access. Used when the task requires both
exploration and modification.

**claude** -- catch-all. Also the default agent type for dispatched background
sessions in [[claude-code-agent-view]].

Additional helper agents (`statusline-setup` on Sonnet, `claude-code-guide` on
Haiku) are invoked automatically for specific tasks.

To disable built-in subagents: add to `permissions.deny` (e.g.
`Agent(Explore)`), deny the `Agent` tool entirely, or set
`CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS=1`.
(source: claude-code-subagents-2026.md)

## Custom subagent definition

Subagents are Markdown files with YAML frontmatter stored in one of five
locations, listed by priority (source: claude-code-subagents-2026.md):

1. Managed settings (organization-wide)
2. `--agents` CLI flag (current session only, JSON)
3. `.claude/agents/` (project-scoped, version-controllable)
4. `~/.claude/agents/` (user-scoped, all projects)
5. Plugin `agents/` directory

Required frontmatter fields: `name` (lowercase-hyphenated identifier) and
`description` (tells Claude when to delegate).

Optional fields: `tools`, `disallowedTools`, `model`, `permissionMode`,
`maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `effort`,
`isolation`, `color`, `initialPrompt`.
(source: claude-code-subagents-2026.md)

Claude Code watches the `agents/` directories and hot-reloads changes within
seconds. (source: claude-code-subagents-2026.md)

## Foreground and background execution

Subagents run in either foreground (blocking) or background (concurrent).
(source: claude-code-subagents-2026.md)

**Fork mode** (on by default in interactive sessions since v2.1.232) forces all
subagents Claude spawns to run in the background. Claude cannot request
foreground execution when fork mode is on. Set `CLAUDE_CODE_FORK_SUBAGENT=0` to
disable. (source: claude-code-subagents-2026.md)

**Background subagents** get a reduced built-in tool set: `Read`, `Grep`,
`Glob`, `Bash`, `PowerShell`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`,
`WebSearch`, `TodoWrite`, `Skill`, `ToolSearch`, `EnterWorktree`,
`ExitWorktree`, `Monitor`, `TaskStop`, `SendMessage`, and `Artifact`. All MCP
tools are kept. (source: claude-code-subagents-2026.md)

**Foreground subagents** inherit the full tool set minus a short deny list:
`AskUserQuestion`, `EndConversation`, `EnterPlanMode`, `ScheduleWakeup`,
`TaskOutput`, `WaitForMcpServers`, `Workflow`, and `Agent` when at the depth
limit. (source: claude-code-subagents-2026.md)

Permission prompts from background subagents surface in the main session
(since v2.1.186). Press Esc to deny a single tool call without stopping the
subagent. (source: claude-code-subagents-2026.md)

`Ctrl+B` backgrounds a running foreground task.
(source: claude-code-interactive-mode-2026.md)

## Forks

A fork is a subagent that inherits the entire conversation (system prompt,
tools, model, message history) instead of starting fresh. The fork's tool calls
stay out of the main context; only its final result returns.
(source: claude-code-subagents-2026.md)

Forks skip both tool filters and receive the main session's exact tool pool.
Because the system prompt and tool definitions are identical, a fork's first
request reuses the parent's prompt cache, making it cheaper than a fresh
subagent. (source: claude-code-subagents-2026.md)

Start a fork with `/subtask <task>` (v2.1.212+). On earlier versions, use
`/fork`. A fork cannot spawn further forks.
(source: claude-code-subagents-2026.md)

As of v2.1.212, `/fork` copies the whole session into a new background session
in [[claude-code-agent-view]] instead of creating an in-session subagent.
(source: claude-code-subagents-2026.md)

| | Fork | Named subagent |
| --- | --- | --- |
| Context | Full conversation history | Fresh, task prompt only |
| System prompt/tools | Same as main session | From definition file |
| Model | Same as main session | From `model` field |
| Prompt cache | Shared with main session | Separate cache |

(source: claude-code-subagents-2026.md)

## Nesting and concurrency limits

Subagents can spawn their own subagents up to 3 layers deep by default
(configurable via `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). At the depth limit,
the `Agent` tool is withheld. (source: claude-code-subagents-2026.md)

Maximum concurrent subagents defaults to 20 (configurable via
`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`). Sessions with ultracode active are
exempt. (source: claude-code-subagents-2026.md)

## Resuming subagents

Claude uses `SendMessage` with the agent's ID or name to resume a completed
subagent. The subagent retains its full conversation history. Explore and Plan
are one-shot and cannot be resumed. (source: claude-code-subagents-2026.md)

A user-stopped subagent (via `x` in `/tasks`) does not auto-resume. Type into
its transcript in the subagent panel to resume manually.
(source: claude-code-subagents-2026.md)

## Subagent context at startup

A non-fork subagent starts with (source: claude-code-subagents-2026.md):

- Its own system prompt (not the full Claude Code system prompt)
- The delegation message from Claude
- CLAUDE.md files (except Explore and Plan, which skip these)
- Git status snapshot (except Explore and Plan)
- Preloaded skills (if any in the `skills` field)
- Sibling roster (if `SendMessage` is available, since v2.1.206)

State that never reaches a non-fork subagent: output style, auto memory,
parent's context window size. (source: claude-code-subagents-2026.md)

Subagent transcripts are stored at
`~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl` and
persist independently of main conversation compaction.
(source: claude-code-subagents-2026.md)

## Related pages

- [[claude-code-agent-view]]
- [[claude-code-sessions]]
- [[claude-code-hooks]]
- [[claude-code-skills]]
