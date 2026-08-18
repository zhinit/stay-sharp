# Claude Code Sessions

Claude Code persists every session as an append-only JSONL file on the local
filesystem. The format records every user prompt, assistant response, tool call,
tool result, thinking block, token usage, and git state snapshot.
(source: claude-code-sessions-docs-2026.md)

## Storage location

Transcripts live at `~/.claude/projects/<project>/<session-id>.jsonl`, where
`<project>` is the working directory path with non-alphanumeric characters
replaced by `-`. Paths longer than 200 characters are truncated and
hash-suffixed. (source: claude-code-sessions-docs-2026.md)

The location is configurable via `CLAUDE_CONFIG_DIR`. Retention defaults to
30 days, configurable via `cleanupPeriodDays` in `settings.json`. Transcript
writes can be suppressed entirely with `CLAUDE_CODE_SKIP_PROMPT_HISTORY` or
per-run with `--no-session-persistence`. (source: claude-code-sessions-docs-2026.md)

The format is internal to Claude Code and changes between versions. Scripts
that parse it directly can break on any release. (source: claude-code-sessions-docs-2026.md)

## JSONL record envelope

Each line is a JSON object. All entry types share these fields
(source: medium-session-file-format-2026.md):

```
type         string    Entry type identifier
uuid         string    Unique message ID
parentUuid   string    Parent message UUID (creates a DAG)
timestamp    string    ISO 8601
sessionId    string    Session identifier
cwd          string    Working directory at time of entry
message      object    Type-specific payload
```

The `parentUuid` field links entries into a directed acyclic graph, enabling
branching conversations and subagent tracking.
(source: medium-session-file-format-2026.md)

## Entry types

Seven core types plus one snapshot type
(source: medium-session-file-format-2026.md, deepwiki-jsonl-format-2026.md):

### `system`

First record in every session. Contains the complete system prompt: tool
definitions, permission modes, project context, and injected CLAUDE.md content.
(source: medium-session-file-format-2026.md)

### `user`

User prompts, hook-injected context, system notes, and tool results returned to
Claude. `message.role` is `"user"`. Content is either a string (for prompts) or
an array of `tool_result` blocks. Optional fields include `cwd`, `gitBranch`,
and `isCompactSummary` (boolean, marks compaction continuations).
(source: deepwiki-jsonl-format-2026.md, medium-session-file-format-2026.md)

### `assistant`

The densest entry type. Contains model selection, text responses, tool calls,
internal reasoning, and token usage. (source: medium-session-file-format-2026.md)

```
message.role       "assistant"
message.model      string          Model identifier (e.g. "claude-opus-4-6")
message.content    array           Content blocks (see below)
message.usage      object          Per-turn token accounting
```

### `tool_result`

Tool execution output, keyed back to the originating tool call:
(source: medium-session-file-format-2026.md)

```
toolUseResult.tool_use_id    string     Matches the tool_use block's id
toolUseResult.content        string     Full output
toolUseResult.is_error       boolean
```

### `summary`

Marks conversation compaction checkpoints when the context window fills. The
`summary` field contains a human-readable session description, and `leafUuid`
identifies the session. (source: deepwiki-jsonl-format-2026.md,
medium-session-file-format-2026.md)

### `result`

Final record in a session. Indicates completion status, cost summary, and
structured output. (source: medium-session-file-format-2026.md)

### `file-history-snapshot`

Captured at session start. Records git state (staged changes, unstaged changes,
untracked files) to establish the baseline for diff calculations. Not included
in conversation output. (source: deepwiki-jsonl-format-2026.md,
medium-session-file-format-2026.md)

## Content blocks

Assistant `message.content` is an array of typed blocks
(source: medium-session-file-format-2026.md):

**`text`** -- visible response text from Claude.

**`tool_use`** -- tool invocation:
```
type     "tool_use"
id       string       Unique tool call ID (referenced by tool_result)
name     string       Tool name (e.g. "Read", "Bash", "Edit")
input    object       Exact parameters passed
```

**`thinking`** -- extended thinking scratchpad, recorded verbatim.

## Token usage

Each assistant turn includes per-turn token accounting in `message.usage`
(source: medium-session-file-format-2026.md):

```
input_tokens                              int
output_tokens                             int
cache_read_input_tokens                   int
cache_creation.ephemeral_5m_input_tokens  int
cache_creation.ephemeral_1h_input_tokens  int
```

Cache read tokens are billed at ~10% of the base input price. Cache creation
tokens are split between 5-minute and 1-hour ephemeral tiers.

## Subagent tracking

When Claude Code spawns a subagent, that subagent runs in its own JSONL file
with a complete message history. The parent-child relationship is tracked via
(source: medium-session-file-format-2026.md):

```
parentToolUseId    string    The tool_use id that spawned the subagent
agentId            string    Identifier for the agent
agentType          string    Classification (Explore, Bash, general-purpose, etc.)
teamName           string    Team membership identifier
```

## Extracting session data

Several interfaces exist for accessing session content
(source: claude-code-sessions-docs-2026.md):

| Method | Output | Use case |
| ------ | ------ | -------- |
| `/export` | Rendered plain text | Human reading |
| `claude -p --output-format json` | Structured JSON | Script: capture one run |
| `claude -p --resume <id> --output-format json` | Structured JSON | Script: query existing session |
| `transcript_path` in [[claude-code-hooks]] | File path | React to session events |
| Agent SDK | Programmatic messages | Embedded in app |

Example:
```bash
claude -p --resume <session-id> --output-format json "summarize what we changed" | jq -r '.result'
```

## Extracting recent prompts

To extract just user prompts from a JSONL transcript:

```bash
jq -c 'select(.type == "user") | {timestamp, content: .message.content}' \
  ~/.claude/projects/<project>/<session-id>.jsonl
```

To get the most recent task or prompt:

```bash
jq -c 'select(.type == "user" and (.message.content | type == "string"))' \
  <file>.jsonl | tail -1
```

These are fragile against format changes. Prefer `claude -p --resume` for
stable access.

## Third-party tooling

**claude-code-transcripts** (Simon Willison) converts local and web JSONL
sessions to paginated HTML. Commands: `local`, `web`, `json`, `all`.
(source: simonw-claude-code-transcripts-2026.md)

**claude-history** (raine) provides fuzzy-search across conversation history
with field-aware relevance scoring. Searches user messages, assistant
responses, and tool results. (source: raine-claude-history-2026.md)

## Session management

Sessions are saved continuously as you work. Resume with `claude --continue`
(most recent), `claude --resume` (picker), or `claude --resume <name>` (by
name). A resumed session restores conversation history, model, agent, permission
mode, active goal, and scheduled tasks.
(source: claude-code-sessions-docs-2026.md)

`/clear` starts fresh (previous conversation is resumable). `/compact` replaces
history with a summary. `/branch` copies the conversation to try a different
approach. (source: claude-code-sessions-docs-2026.md)

## Session naming

Sessions can be named at startup (`claude -n <name>`), during a session
(`/rename <name>`), from the session picker (`Ctrl+R`), or from claude.ai. Named
sessions are resumable by name. Unnamed sessions get an auto-generated title
from the first prompt. (source: claude-code-sessions-2026.md)

Duplicate names on live sessions are resolved by appending a two-word suffix
(e.g. `auth-refactor-graceful-unicorn`) since v2.1.232.
(source: claude-code-sessions-2026.md)

## Backgrounding sessions

Interactive sessions end when the terminal closes unless backgrounded. Three
commands move a session to the background
(source: claude-code-agent-view-2026.md):

- `/bg` or `/background` moves the current session to a background session
  managed by the supervisor daemon
- `/bg <prompt>` backgrounds with an additional instruction
- `←` on an empty prompt detaches and returns to
  [[claude-code-agent-view|agent view]]

From the shell, `claude --bg "<prompt>"` starts a new background session
directly. Pass `--name` to set a display name.
(source: claude-code-agent-view-2026.md)

Background sessions do not need a terminal. They run under a per-user supervisor
process that survives sleep, binary updates, and terminal closure. See
[[claude-code-agent-view]] for the supervisor daemon and session management UI.
(source: claude-code-agent-view-2026.md)

### What carries over

Running background shell commands, backgrounded
[[claude-code-subagents|subagents]], dynamic workflows, scheduled tasks,
MCP servers, plugins, permission mode, model, and effort level all carry over.
Running monitors and foreground shell commands stop.
(source: claude-code-agent-view-2026.md)

### Resume from summary

On Pro or Max plans, resuming a session inactive for more than about an hour and
over 100,000 tokens presents a dialog: resume from a `/compact` summary, resume
full session as-is, or suppress the dialog permanently. The tradeoff is per-
request cost vs. detail retention. (source: claude-code-sessions-2026.md)

## Session branching

`/branch [name]` copies the conversation and switches to the copy, leaving the
original intact. The copy inherits conversation history, session permission
grants, in-flight background subagents and background Bash commands, and Remote
Control connections. (source: claude-code-sessions-2026.md)

From the CLI: `claude --continue --fork-session`.
(source: claude-code-sessions-2026.md)

## Background Bash commands

`Ctrl+B` backgrounds a running Bash command (tmux users press twice). The
command runs asynchronously; output is written to a file readable via `Read`.
Background tasks are cleaned up on exit, but if you background the session
instead, they transfer to the background session and keep running.
(source: claude-code-interactive-mode-2026.md)

Output is capped at 5GB. On macOS/Linux, idle background commands are
terminated under memory pressure after 30 minutes of session inactivity.
Subagent-owned background commands are terminated after 60 minutes.
(source: claude-code-interactive-mode-2026.md)

## Related pages

- [[claude-code-subagents]]
- [[claude-code-agent-view]]
- [[claude-code-hooks]]
- [[claude-code-headless]]
- [[claude-agent-sdk]]
