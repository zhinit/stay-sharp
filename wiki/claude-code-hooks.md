# Claude Code Hooks

Hooks are user-defined handlers that execute automatically at specific points in Claude Code's lifecycle. They run wherever Claude Code runs: terminal, IDE extensions, Desktop app, and the web (source: claude-code-hooks-reference-2026.md).

Hooks provide deterministic control: certain actions always happen rather than relying on the LLM to choose to run them. Use hooks to enforce project rules, automate repetitive tasks, and integrate Claude Code with existing tools (source: claude-code-hooks-guide-2026.md).

## Handler types

Five handler types are available (source: claude-code-hooks-reference-2026.md):

- **command** -- a shell command or executable. Receives JSON on stdin. Supports `async: true` to run in the background without blocking, and `asyncRewake: true` to run in the background and wake Claude when the hook exits with code 2. Uses exec form (with `args`) for direct execution or shell form (without `args`) for pipes, `&&`, globs, and variable expansion.
- **http** -- POSTs JSON to a URL endpoint. Supports header interpolation with `$VAR` and an `allowedEnvVars` whitelist.
- **mcp_tool** -- calls a tool on a configured MCP server. Supports `${path}` substitution in the input.
- **prompt** -- sends a text prompt to a model for evaluation. Supports `$ARGUMENTS` placeholder. Default timeout 30s.
- **agent** -- spawns a subagent to evaluate the event. Default timeout 60s.

## Hook events

31 events across three cadences (source: claude-code-hooks-reference-2026.md):

**Once per session:** `SessionStart`, `Setup`, `SessionEnd`.

**Once per turn:** `UserPromptSubmit`, `UserPromptExpansion`, `Stop`, `StopFailure`, `TeammateIdle`.

**Per tool call:** `PreToolUse`, `PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`.

**Subagent/task lifecycle:** `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`.

**File/directory:** `FileChanged`, `DirectoryAdded`, `CwdChanged`, `WorktreeCreate`, `WorktreeRemove`.

**Configuration:** `ConfigChange`, `InstructionsLoaded`, `PreCompact`, `PostCompact`.

**MCP/display:** `Elicitation`, `ElicitationResult`, `Notification`, `MessageDisplay`.

## Blocking and decisions

Some events support blocking (exit code 2 stops the action). Events like `PreToolUse` and `PermissionRequest` support `permissionDecision` fields in JSON output to allow or deny tool calls. Exit code 0 means success with optional JSON on stdout. Other exit codes are non-blocking errors (source: claude-code-hooks-reference-2026.md).

For events that support it, stdout is added as context Claude can see (`UserPromptSubmit`, `UserPromptExpansion`, `SessionStart`). For most other events, stdout is logged but not shown in the transcript (source: claude-code-hooks-reference-2026.md).

## Configuration

Hooks are configured in (highest priority first): user settings (`~/.claude/settings.json`), project settings (`.claude/settings.json`), project-local settings (`.claude/settings.local.json`), managed policy, plugin `hooks/hooks.json`, and skill/agent frontmatter (source: claude-code-hooks-reference-2026.md).

### JSON structure

The `hooks` key in `settings.json` is an object with three levels of nesting (source: claude-code-hooks-reference-2026.md):

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<string>",
        "hooks": [
          { "type": "command", "command": "...", ... }
        ]
      }
    ]
  }
}
```

1. **Event key** -- a hook event name (e.g. `"PreToolUse"`, `"Stop"`, `"SessionStart"`).
2. **Matcher group array** -- each element has a `"matcher"` string and a `"hooks"` array. The matcher filters when the hooks fire (see [[#Matchers]]).
3. **Hook handler array** -- each element has a required `"type"` field plus type-specific fields (see [[#Handler types]]). All matching hooks run in parallel. Duplicate handlers across settings files run once; plugin/skill copies stay separate.

### Top-level settings keys

These are siblings of `"hooks"` in the same settings file (source: claude-code-hooks-reference-2026.md):

- `"disableAllHooks": true` -- temporarily disables all hooks without removing them. Respects the managed settings hierarchy: user/project/local `disableAllHooks` cannot disable managed hooks.
- `"allowedHttpHookUrls"` -- URL allowlist for HTTP hooks. When defined at any settings level, an HTTP hook only runs if its URL matches the merged allowlist.
- `"httpHookAllowedEnvVars"` -- env var allowlist for HTTP header interpolation. When defined, only listed variables are interpolated.
- `"allowManagedHooksOnly"` -- enterprise admin setting. Blocks user, project, local, and plugin hooks (except plugins force-enabled in managed `enabledPlugins`).

### Common handler fields

All five handler types accept these fields (source: claude-code-hooks-reference-2026.md):

| Field | Required | Description |
|---|---|---|
| `type` | yes | `"command"`, `"http"`, `"mcp_tool"`, `"prompt"`, or `"agent"` |
| `if` | no | Permission rule syntax for secondary filtering (e.g. `"Bash(git *)"`, `"Edit(*.ts)"`). Only evaluated on tool events (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`). One rule per field, no `&&`/`||`. |
| `timeout` | no | Seconds before canceling. Defaults: 600 (command/http/mcp_tool), 30 (prompt, also UserPromptSubmit command), 60 (agent), 10 (MessageDisplay command). SessionEnd hooks share a 1.5s budget (raised up to 60s if a per-hook timeout is set). |
| `statusMessage` | no | Custom spinner text while running. |
| `once` | no | If `true`, runs once per session then is removed. Only honored in skill frontmatter, ignored in settings files and agent frontmatter. |

### Command handler fields

In addition to common fields (source: claude-code-hooks-reference-2026.md):

| Field | Required | Description |
|---|---|---|
| `command` | yes | Shell command (shell form) or executable path (exec form, when `args` is present). |
| `args` | no | Argument list. When present, `command` is spawned directly with no shell. |
| `async` | no | If `true`, runs in background without blocking. |
| `asyncRewake` | no | If `true`, runs in background and wakes Claude on exit code 2. Implies `async`. |
| `shell` | no | `"bash"` or `"powershell"`. Ignored when `args` is set. |

**Exec form** (with `args`): `command` is resolved as an executable and spawned directly. Path placeholders like `${CLAUDE_PROJECT_DIR}` are substituted into `command` and each `args` element as plain strings. No shell tokenization.

**Shell form** (without `args`): `command` is passed to `sh -c` (macOS/Linux) or Git Bash/PowerShell (Windows). The shell interprets pipes, `&&`, globs, and variable expansion.

### HTTP handler fields

In addition to common fields (source: claude-code-hooks-reference-2026.md):

| Field | Required | Description |
|---|---|---|
| `url` | yes | POST target URL. |
| `headers` | no | Key-value pairs. Values support `$VAR_NAME` / `${VAR_NAME}` interpolation for variables listed in `allowedEnvVars`. |
| `allowedEnvVars` | no | List of env var names allowed in header interpolation. Unlisted references resolve to empty strings. |

### MCP tool handler fields

In addition to common fields (source: claude-code-hooks-reference-2026.md):

| Field | Required | Description |
|---|---|---|
| `server` | yes | Name of a configured MCP server. Plugin-bundled servers use scoped name `plugin:<plugin-name>:<server-name>`. |
| `tool` | yes | Tool name on that server. |
| `input` | no | Arguments passed to the tool. String values support `${path}` substitution from hook JSON input (e.g. `"${tool_input.file_path}"`). |

### Prompt and agent handler fields

In addition to common fields (source: claude-code-hooks-reference-2026.md):

| Field | Required | Description |
|---|---|---|
| `prompt` | yes | Prompt text. `$ARGUMENTS` is replaced with the hook input JSON. Escape with `\$` for literal `$`. |
| `model` | no | Model for evaluation. Defaults to a fast model. |

The `if` field adds a secondary filter on top of the matcher. Example: `"if": "Bash(rm *)"` narrows a `Bash` matcher to only `rm` commands (source: claude-code-hooks-guide-2026.md).

## Matchers

The `matcher` field controls which events a hook responds to. Evaluation depends on the characters in the string (source: claude-code-hooks-reference-2026.md):

| Matcher value | Evaluated as |
|---|---|
| `"*"`, `""`, or omitted | Matches all occurrences of the event. |
| Only letters, digits, `_`, `-`, spaces, `,`, `\|` | Exact string match. `\|` or `,` (with optional whitespace) separates alternatives. E.g. `"Edit\|Write"` or `"Edit, Write"`. |
| Contains any other character | Unanchored JavaScript regex. `Edit.*` matches both `Edit` and `NotebookEdit`. Use `^Edit$` for whole-string match. |

Each event type matches on a different field. Tool events (`PreToolUse`, `PostToolUse`, etc.) match on `tool_name`. `SessionStart` matches on start method (`startup`, `resume`, `clear`, `compact`, `fork`). `Notification` matches on notification type. `FileChanged` matches literal filenames. Events like `Stop`, `UserPromptSubmit`, and `MessageDisplay` have no matcher support and always fire (source: claude-code-hooks-reference-2026.md).

MCP tools follow the naming pattern `mcp__<server>__<tool>`. Use `mcp__<server>__.*` to match all tools from a server. The `.*` suffix is required because `mcp__memory` alone is evaluated as an exact string and matches nothing (source: claude-code-hooks-reference-2026.md).

## Common input fields

All events receive `session_id`, `prompt_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name`, `effort`, and optionally `agent_id` and `agent_type` (source: claude-code-hooks-reference-2026.md).

## Hooks in the Agent SDK

The Agent SDK supports hooks as callback functions passed in `options.hooks`, in addition to shell command hooks from settings files. Callbacks receive `(input_data, tool_use_id, context)` and return an output object with decisions (source: claude-agent-sdk-hooks-2026.md).

In Python, hooks are registered via `ClaudeAgentOptions(hooks={"PreToolUse": [HookMatcher(matcher="...", hooks=[callback])]})`. In TypeScript, via `options.hooks` in the `query()` call (source: claude-agent-sdk-hooks-2026.md).

SDK hooks support the same events as CLI hooks. `PostToolBatch` is TypeScript-only in the SDK (source: claude-agent-sdk-hooks-2026.md).

## Common patterns

**Desktop notification on idle:** A `Notification` hook using `osascript` (macOS), `notify-send` (Linux), or `New-BurntToastNotification` (Windows) alerts when Claude needs input (source: claude-code-hooks-guide-2026.md).

**Auto-format after edits:** A `PostToolUse` hook matching `Edit|Write` runs a formatter (e.g. `prettier`) on the changed file (source: claude-code-hooks-guide-2026.md).

**Block destructive commands:** A `PreToolUse` hook matching `Bash` with `"if": "Bash(rm *)"` inspects the command and returns `permissionDecision: "deny"` (source: claude-code-hooks-guide-2026.md).

## Path placeholders

`${CLAUDE_PROJECT_DIR}` (project root), `${CLAUDE_PLUGIN_ROOT}` (plugin install dir), `${CLAUDE_PLUGIN_DATA}` (plugin persistent data dir). Also exported as environment variables (source: claude-code-hooks-reference-2026.md).

## Relevance to StaySharp

There is no "agent is busy" or "long task started" event. The closest signals are:

- `Stop` fires when Claude finishes a turn (the user is needed again).
- `SubagentStart`/`SubagentStop` and `TaskCreated`/`TaskCompleted` fire around delegated work.
- A `command` hook with `async: true` can launch an external process without blocking the session.
- `asyncRewake: true` can wake Claude when the external process exits with code 2.
- `Notification` fires when Claude is waiting for input or permission, useful for knowing when to stop practicing.

## Related pages

[[claude-code-plugins]] | [[claude-code-skills]] | [[claude-agent-sdk]] | [[claude-code-headless]]
