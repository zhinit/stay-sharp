# Claude Agent SDK

The Agent SDK is Anthropic's library for building autonomous AI agents in Python and TypeScript. It provides the same tools, agent loop, and context management that power Claude Code, programmable as a library that runs in your own process (source: claude-agent-sdk-overview-2026.md).

## When to use it vs. alternatives

| Scenario | Tool |
|---|---|
| Building an agent without implementing the tool loop yourself | Agent SDK |
| Interactive development or one-off terminal tasks | Claude Code CLI |
| Calling the API directly, implementing the tool loop yourself | Client SDK |
| Long-running agents without managing sandbox/session infrastructure | Managed Agents |

The SDK is available for Python and TypeScript only. Other languages can drive the same agent loop by running the CLI as a subprocess with `-p` and `--output-format json` (source: claude-agent-sdk-overview-2026.md).

## Capabilities

The SDK exposes everything Claude Code has (source: claude-agent-sdk-overview-2026.md):

- **Built-in tools**: Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch.
- **Hooks**: custom code at key lifecycle points (callback functions or shell commands).
- **Subagents**: specialized agents for focused subtasks.
- **MCP**: external tools and data sources via Model Context Protocol.
- **Permissions**: control which tools auto-approve and which need approval.
- **Sessions**: maintain context across exchanges, resume or fork.
- **Skills, commands, memory**: loaded from `.claude/` and `~/.claude/`.
- **Plugins**: package and load skills, agents, hooks, MCP servers.

## Installation

TypeScript: `npm install @anthropic-ai/claude-agent-sdk`. Python: `pip install claude-agent-sdk` or `uv add claude-agent-sdk`. Both SDKs bundle a native Claude Code binary. Requires Node.js 18+ or Python 3.10+ (source: claude-agent-sdk-quickstart-2026.md).

## Authentication

The SDK uses Claude Code's auth infrastructure. The quickstart directs developers to use `ANTHROPIC_API_KEY` from the Claude Console. Also supports Amazon Bedrock, Claude Platform on AWS, Google Cloud's Agent Platform, and Microsoft Foundry (source: claude-agent-sdk-quickstart-updated-2026.md).

For first-party/personal use, subscription OAuth works with the SDK. Use `claude setup-token` to generate a long-lived token and set `CLAUDE_CODE_OAUTH_TOKEN`. `apiKeyHelper`, `ANTHROPIC_API_KEY`, and `ANTHROPIC_AUTH_TOKEN` all apply to the SDK (source: claude-code-authentication-2026.md).

Third-party developers are not allowed to offer claude.ai login or rate limits for their products unless previously approved by Anthropic (source: claude-agent-sdk-overview-2026.md, claude-agent-sdk-quickstart-updated-2026.md).

Bare mode (`--bare`) does not read OAuth credentials. To use subscription auth in headless mode, run without `--bare`, which loads full project context (source: claude-code-authentication-2026.md).

A planned separate credit pool for Agent SDK usage ($20-$200/mo depending on plan) was paused indefinitely as of June 2026. SDK usage currently draws from subscription limits (source: claude-agent-sdk-plan-billing-2026.md).

See [[claude-code-authentication]] for the full credential precedence chain and details.

## The agent loop

Every session follows the same cycle (source: claude-agent-sdk-agent-loop-2026.md):

1. **Receive prompt** -- Claude receives prompt, system prompt, tool definitions, and conversation history. SDK yields a `SystemMessage` with subtype `"init"`.
2. **Evaluate and respond** -- Claude evaluates current state, responds with text and/or tool call requests. SDK yields an `AssistantMessage`.
3. **Execute tools** -- SDK runs each requested tool and collects results. Hooks can intercept, modify, or block tool calls.
4. **Repeat** -- Steps 2-3 repeat. Each full cycle is one turn.
5. **Return result** -- SDK yields a final `AssistantMessage` (no tool calls), followed by a `ResultMessage` with final text, token usage, cost, and session ID.

Cap the loop with `max_turns`/`maxTurns` (tool-use turns only) or `max_budget_usd`/`maxBudgetUsd` (source: claude-agent-sdk-agent-loop-2026.md).

## Message types

Five core types yielded during the loop (source: claude-agent-sdk-agent-loop-2026.md):

- **SystemMessage** -- session lifecycle (`init`, `compact_boundary`, `informational`, `worker_shutting_down`).
- **AssistantMessage** -- Claude's response per turn (text + tool calls).
- **UserMessage** -- tool results sent back to Claude.
- **StreamEvent** -- raw API streaming events (when partial messages enabled).
- **ResultMessage** -- end of agent loop with final text, cost, usage, session ID.

## Core API

### Python

Two entry points (source: claude-agent-sdk-python-api-detail-2026.md):

- **`query()`** -- creates a new session per call. Returns `AsyncIterator[Message]`. For one-shot tasks.
- **`ClaudeSDKClient`** -- tracks session state internally. `client.query()` continues the same session. For multi-turn conversations.

```python
async def query(
    *,
    prompt: str | AsyncIterable[dict[str, Any]],
    options: ClaudeAgentOptions | None = None,
    transport: Transport | None = None
) -> AsyncIterator[Message]
```

`ClaudeSDKClient` supports async context manager, multi-turn conversation, streaming input, interrupts, dynamic permission mode changes (`set_permission_mode()`), model switching (`set_model()`), MCP status queries, and file rewinding (source: claude-agent-sdk-python-api-detail-2026.md).

Additional functions: `tool()` decorator for MCP tool definitions, `create_sdk_mcp_server()` for in-process MCP servers, `list_sessions()`, `get_session_messages()`, `get_session_info()`, `rename_session()`, `tag_session()` (source: claude-agent-sdk-python-api-detail-2026.md).

### TypeScript

Entry points (source: claude-agent-sdk-typescript-2026.md):

- **`query()`** -- returns a `Query` async generator with methods for runtime control (`interrupt()`, `setPermissionMode()`, `setModel()`, `close()`, etc.).
- **`startup()`** -- pre-warms the CLI subprocess before a prompt is available.

Additional functions: `tool()` for type-safe MCP tools (uses Zod schemas), `createSdkMcpServer()`, `listSessions()`, `getSessionMessages()`, `getSessionInfo()`, `renameSession()`, `tagSession()`, `resolveSettings()` (source: claude-agent-sdk-typescript-2026.md).

## ClaudeAgentOptions (Python)

The central configuration dataclass. All fields are optional with sensible defaults (source: claude-agent-sdk-python-api-detail-2026.md).

### System prompt

Three forms (source: claude-agent-sdk-python-api-detail-2026.md):

```python
# Raw string
ClaudeAgentOptions(system_prompt="You are an expert Python developer")

# Preset (uses Claude Code's built-in prompt, optionally appending text)
ClaudeAgentOptions(system_prompt={
    "type": "preset",
    "preset": "claude_code",
    "append": "Focus on security.",
    "exclude_dynamic_sections": False,
})

# File reference
ClaudeAgentOptions(system_prompt={"type": "file", "path": "./prompts/agent.md"})
```

Type union: `str | SystemPromptPreset | SystemPromptFile | None`. `SystemPromptPreset` is a `TypedDict` with keys `type` (literal `"preset"`), `preset` (literal `"claude_code"`), optional `append` (str), and optional `exclude_dynamic_sections` (bool). `SystemPromptFile` is a `TypedDict` with `type` (literal `"file"`) and `path` (str) (source: claude-agent-sdk-python-api-detail-2026.md).

### Tool control

`allowed_tools` and `disallowed_tools` are both `list[str]`, defaulting to empty. `tools` controls what Claude sees; `allowed_tools`/`disallowed_tools` control permissions. A separate `tools` field accepts `list[str] | ToolsPreset | None` where `ToolsPreset` is `{"type": "preset", "preset": "claude_code"}` (source: claude-agent-sdk-python-api-detail-2026.md).

```python
# Auto-approve Read, Write, Bash; deny rm commands; leave everything else to permission_mode
ClaudeAgentOptions(
    allowed_tools=["Read", "Write", "Bash(ls *)"],
    disallowed_tools=["Bash(rm *)"],
    permission_mode="acceptEdits",
)
```

`allowed_tools` is a permission allowlist, not a tool filter. Listed tools are auto-approved at step 5 of the evaluation chain. Unlisted tools still exist and fall through to permission mode and `canUseTool`. To remove a tool entirely from Claude's context, use `disallowed_tools` with a bare name (e.g., `"Bash"`). To block specific invocations while keeping the tool available, use a scoped deny rule (e.g., `"Bash(rm *)"`) (source: claude-agent-sdk-permissions-detail-2026.md).

Glob patterns in allow rules require a literal `mcp__<server>__` prefix: `mcp__puppeteer__*` works, bare `*` is ignored with a warning (source: claude-agent-sdk-permissions-detail-2026.md).

For a locked-down agent, pair `allowed_tools` with `permission_mode="dontAsk"`. Listed tools are approved, everything else denied without prompting (source: claude-agent-sdk-permissions-detail-2026.md).

`allowed_tools` does not constrain `bypassPermissions`. Setting `allowed_tools=["Read"]` alongside `permission_mode="bypassPermissions"` still approves every tool. Use `disallowed_tools` if you need bypass but want specific tools blocked (source: claude-agent-sdk-permissions-detail-2026.md).

### Permission mode

`permission_mode: PermissionMode | None`, where (source: claude-agent-sdk-python-api-detail-2026.md):

```python
PermissionMode = Literal[
    "default",           # no auto-approvals; unmatched tools trigger canUseTool
    "dontAsk",           # deny instead of prompting; canUseTool never called
    "acceptEdits",       # auto-approve file edits + filesystem commands in cwd
    "bypassPermissions", # approve everything (except ask rules, hooks, deny rules)
    "plan",              # read-only; file edits prompt through canUseTool
    "auto",              # model classifier decides
]
```

Can be set at query time or changed dynamically during a `ClaudeSDKClient` session via `await client.set_permission_mode("acceptEdits")` (source: claude-agent-sdk-permissions-detail-2026.md).

### canUseTool callback

Called at step 6 of the permission chain, only when no earlier step resolved the request. Skipped entirely in `dontAsk` mode (source: claude-agent-sdk-permissions-detail-2026.md).

```python
CanUseTool = Callable[
    [str, dict[str, Any], ToolPermissionContext],
    Awaitable[PermissionResultAllow | PermissionResultDeny]
]
```

`PermissionResultAllow` can modify tool input via `updated_input` and persist permission changes via `updated_permissions`. `PermissionResultDeny` can optionally set `interrupt=True` to abort the agent loop (source: claude-agent-sdk-python-api-detail-2026.md).

```python
async def custom_permission_handler(
    tool_name: str, input_data: dict, context: ToolPermissionContext
) -> PermissionResultAllow | PermissionResultDeny:
    if tool_name == "Write" and input_data.get("file_path", "").startswith("/system/"):
        return PermissionResultDeny(message="System directory write not allowed", interrupt=True)
    return PermissionResultAllow(updated_input=input_data)

options = ClaudeAgentOptions(can_use_tool=custom_permission_handler)
```

### Other notable fields

| Field | Type | Description |
|:------|:-----|:------------|
| `model` | `str \| None` | Claude model alias or full name |
| `fallback_model` | `str \| None` | Fallback if primary model fails |
| `max_turns` | `int \| None` | Cap on agentic turns (tool-use turns only) |
| `max_budget_usd` | `float \| None` | Stop when estimated cost reaches this |
| `cwd` | `str \| Path \| None` | Working directory |
| `add_dirs` | `list[str \| Path]` | Additional directories Claude can access |
| `cli_path` | `str \| Path \| None` | Custom path to Claude Code CLI binary |
| `env` | `dict[str, str]` | Environment variables passed to CLI |
| `mcp_servers` | `dict[str, McpServerConfig] \| str \| Path` | MCP server configurations |
| `strict_mcp_config` | `bool` | Ignore project `.mcp.json`, use only passed servers |
| `hooks` | `dict[HookEvent, list[HookMatcher]] \| None` | Python callback hooks |
| `agents` | `dict[str, AgentDefinition] \| None` | Programmatic subagent definitions |
| `setting_sources` | `list[SettingSource] \| None` | Which filesystem settings to load (`"user"`, `"project"`, `"local"`) |
| `skills` | `list[str] \| Literal["all"] \| None` | Skills available to session |
| `plugins` | `list[SdkPluginConfig]` | Custom plugins from local paths |
| `thinking` | `ThinkingConfig \| None` | Extended thinking (`adaptive`, `enabled` with `budget_tokens`, or `disabled`) |
| `effort` | `EffortLevel \| None` | Effort level (`low`, `medium`, `high`, `xhigh`, `max`) |
| `output_format` | `dict[str, Any] \| None` | Structured output via JSON Schema |
| `continue_conversation` | `bool` | Continue most recent session |
| `resume` | `str \| None` | Session ID to resume |
| `session_id` | `str \| None` | Use specific session ID (must be valid UUID) |
| `fork_session` | `bool` | Fork to new session when resuming |
| `include_partial_messages` | `bool` | Yield partial streaming events |
| `enable_file_checkpointing` | `bool` | Track file changes for rewinding |
| `session_store` | `SessionStore \| None` | Mirror transcripts to external backend |
| `task_budget` | `TaskBudget \| None` | API-side token budget |
| `sandbox` | `SandboxSettings \| None` | Sandbox behavior configuration |

(source: claude-agent-sdk-python-api-detail-2026.md)

### AgentDefinition

For programmatic subagents passed via the `agents` field. Uses camelCase field names (source: claude-agent-sdk-python-api-detail-2026.md):

```python
@dataclass
class AgentDefinition:
    description: str
    prompt: str
    tools: list[str] | None = None
    disallowedTools: list[str] | None = None
    model: str | None = None
    skills: list[str] | None = None
    memory: Literal["user", "project", "local"] | None = None
    mcpServers: list[str | dict[str, Any]] | None = None
    initialPrompt: str | None = None
    maxTurns: int | None = None
    background: bool | None = None
    effort: EffortLevel | int | None = None
    permissionMode: PermissionMode | None = None
```

Subagents inherit the parent's permission mode. `bypassPermissions`, `acceptEdits`, and `auto` cannot be overridden per subagent (source: claude-agent-sdk-permissions-detail-2026.md).

## Custom tools (Python)

Define tools with the `@tool` decorator, bundle them into an in-process MCP server with `create_sdk_mcp_server()`, and pass via `mcp_servers`. Pre-approve with `allowed_tools` using the `mcp__<server>__<tool>` naming convention (source: claude-agent-sdk-github-readme-2026.md).

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeAgentOptions, ClaudeSDKClient

@tool("greet", "Greet a user", {"name": str})
async def greet_user(args):
    return {"content": [{"type": "text", "text": f"Hello, {args['name']}!"}]}

server = create_sdk_mcp_server(name="my-tools", version="1.0.0", tools=[greet_user])

options = ClaudeAgentOptions(
    mcp_servers={"tools": server},
    allowed_tools=["mcp__tools__greet"],
)

async with ClaudeSDKClient(options=options) as client:
    await client.query("Greet Alice")
    async for msg in client.receive_response():
        print(msg)
```

The `tool()` decorator accepts `name`, `description`, `input_schema` (simple type mapping like `{"name": str}` or full JSON Schema dict), and optional `ToolAnnotations` (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`). The handler receives `args: dict[str, Any]` and returns `{"content": [{"type": "text", "text": "..."}]}` (source: claude-agent-sdk-python-api-detail-2026.md).

In-process SDK MCP servers run in the same Python process with no subprocess management or IPC overhead. External stdio-based servers and SDK servers can be mixed in the same `mcp_servers` dict (source: claude-agent-sdk-github-readme-2026.md).

## Python hooks

Define hooks as async functions, wire them with `HookMatcher` objects, and pass via the `hooks` field on `ClaudeAgentOptions`. Hook events include `PreToolUse` and others from the [[claude-code-hooks]] lifecycle (source: claude-agent-sdk-github-readme-2026.md).

```python
from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient, HookMatcher

async def check_bash_command(input_data, tool_use_id, context):
    tool_name = input_data["tool_name"]
    tool_input = input_data["tool_input"]
    if tool_name == "Bash" and "rm -rf" in tool_input.get("command", ""):
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "Destructive command blocked",
            }
        }
    return {}

options = ClaudeAgentOptions(
    allowed_tools=["Bash"],
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[check_bash_command])]},
)
```

## Error types

`ClaudeSDKError` (base), `CLINotFoundError`, `CLIConnectionError`, `ProcessError` (has `exit_code`), `CLIJSONDecodeError` (source: claude-agent-sdk-github-readme-2026.md).

## Sessions

A session is the conversation history accumulated during agent work. Written to disk automatically (source: claude-agent-sdk-sessions-2026.md).

| Pattern | Mechanism |
|---|---|
| One-shot task | Single `query()` call |
| Multi-turn in one process | `ClaudeSDKClient` (Python) or `continue: true` (TypeScript) |
| Resume after restart | `continue_conversation=True` / `continue: true` |
| Resume a specific session | Capture session ID, pass to `resume` |
| Try alternative approach | Fork the session |
| Stateless, no disk writes | `persistSession: false` (TypeScript) |

(source: claude-agent-sdk-sessions-2026.md)

## Permissions

Evaluation order: hooks -> deny rules -> ask rules -> permission mode -> allow rules -> `canUseTool` callback (source: claude-agent-sdk-permissions-2026.md).

Available modes: `default`, `dontAsk`, `acceptEdits`, `bypassPermissions`, `plan`, `auto`. Subagents inherit the parent session's mode (source: claude-agent-sdk-permissions-2026.md).

For a locked-down agent, pair `allowedTools` with `permissionMode: "dontAsk"`. Listed tools approved, everything else denied without prompting (source: claude-agent-sdk-permissions-2026.md).

## Branding

Third parties may use "Claude Agent" or "{YourAgentName} Powered by Claude" but not "Claude Code" or Claude Code branded visuals (source: claude-agent-sdk-overview-2026.md).

## Relevance to StaySharp

The Agent SDK is the mechanism for building a standalone terminal CLI that uses Claude to generate context-aware exercises. It can read the repo's git state via Bash/Read/Grep, understand what the user is building, and produce relevant practice problems. It runs as an independent process, so it operates in a separate terminal pane while Claude Code is busy in another. For a simpler approach without Claude intelligence, the CLI as a subprocess (`claude -p`) can also generate exercises. See [[claude-code-headless]].

## Related pages

[[claude-code-hooks]] | [[claude-code-plugins]] | [[claude-code-skills]] | [[claude-code-headless]]
