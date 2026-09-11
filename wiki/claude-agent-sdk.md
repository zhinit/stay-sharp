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
- **AssistantMessage** -- one content block per message (text or tool_use). Messages from one response share a message ID.
- **UserMessage** -- tool results sent back to Claude. Also emitted for user inputs streamed mid-loop.
- **StreamEvent** -- raw API streaming events (when partial messages enabled). TypeScript type: `SDKPartialAssistantMessage` with `type: "stream_event"`.
- **ResultMessage** -- end of agent loop with final text, cost, usage, session ID. Trailing system events (e.g. `prompt_suggestion`) can arrive after it, so iterate the stream to completion (source: claude-agent-sdk-agent-loop-2026.md).

In TypeScript, check `message.type` as a string discriminant. `AssistantMessage` and `UserMessage` wrap the raw API message in `.message`, so content blocks are at `message.message.content`, not `message.content` (source: claude-agent-sdk-agent-loop-2026.md).

### SDKMessage union (TypeScript)

```typescript
type SDKMessage =
  | SDKAssistantMessage    // type: "assistant"
  | SDKUserMessage         // type: "user"
  | SDKUserMessageReplay   // replayed user message on resume
  | SDKResultMessage       // type: "result"
  | SDKSystemMessage       // type: "system", subtype: "init" only
  | SDKPartialAssistantMessage // type: "stream_event"
  | SDKCompactBoundaryMessage  // type: "compact_boundary"
  | SDKRateLimitEvent      // type: "rate_limit"
  | SDKPromptSuggestionMessage // type: "prompt_suggestion"
  | SDKHookStartedMessage  // type: "hook_started"
  | SDKHookProgressMessage // type: "hook_progress"
  | SDKHookResponseMessage // type: "hook_response"
  | SDKTaskProgressMessage // type: "task_progress"
```

In Python, `SystemMessage` with `subtype` handles all system events. In TypeScript, each subtype other than `"init"` is its own type in the union (source: claude-agent-sdk-agent-loop-2026.md, claude-agent-sdk-typescript-reference-2026.md).

**Known bug (v0.3.267)**: `SDKRateLimitEvent` and `SDKPromptSuggestionMessage` are missing type declarations in `sdk.d.ts`. With `skipLibCheck: true` (the default), the entire `SDKMessage` union silently degrades to `any`. With `skipLibCheck: false`, TypeScript reports `TS2304: Cannot find name` errors. This cascades through `Query` (which extends `AsyncGenerator<SDKMessage, void>`), so all messages in `for await` loops lose type safety (source: github-claude-agent-sdk-ts-issue-206-2026.md).

### SDKAssistantMessage

Each `AssistantMessage` carries a single content block. A response with text and a tool call yields two `AssistantMessage` objects sharing the same message ID (source: claude-agent-sdk-streaming-output-2026.md).

```typescript
type SDKAssistantMessage = {
  type: "assistant";
  uuid: string;
  session_id: string;
  message: {
    id: string;          // shared across blocks from same response
    content: ContentBlock[];  // text or tool_use blocks
    stop_reason: string;
  };
  parent_tool_use_id: string | null;  // set for subagent messages
  parent_agent_id: string | null;
};
```

Extracting text from content blocks (source: claude-agent-sdk-agent-loop-2026.md):

```typescript
if (message.type === "assistant") {
  for (const block of message.message.content) {
    if (block.type === "text") {
      console.log(block.text);
    } else if (block.type === "tool_use") {
      console.log(`Tool: ${block.name}`);
    }
  }
}
```

### SDKResultMessage

The final message from the agent loop. Always check `subtype` before reading `result` (source: claude-agent-sdk-agent-loop-2026.md, agnt-claude-agent-sdk-cheatsheet-2026.md).

```typescript
type SDKResultMessage = {
  type: "result";
  subtype: "success" | "error_max_turns" | "error_max_budget_usd"
    | "error_during_execution" | "error_max_structured_output_retries";
  uuid: string;
  session_id: string;
  duration_ms: number;
  duration_api_ms: number;
  is_error: boolean;
  num_turns: number;
  result: string;              // final text, only present on "success"
  total_cost_usd: number;
  usage: NonNullableUsage;     // main agent loop only
  modelUsage: Record<string, ModelUsage>;  // whole-tree accounting
  permission_denials: SDKPermissionDenial[];
  structured_output?: unknown; // present when outputFormat used
  stop_reason: string | null;  // "end_turn", "max_tokens", "refusal", null on crash
  errors?: unknown[];          // validation errors for structured output
};
```

| Subtype | Meaning | `result` present? |
|---|---|---|
| `success` | Task completed normally | Yes |
| `error_max_turns` | Hit `maxTurns` limit | No |
| `error_max_budget_usd` | Hit `maxBudgetUsd` limit | No |
| `error_during_execution` | API failure, cancelled request, or crash | No |
| `error_max_structured_output_retries` | Structured output validation exhausted retries | No |

All subtypes carry `total_cost_usd`, `usage`, `num_turns`, and `session_id`. After a session crash, cost fields may be zeroed and `stop_reason` is `null` (source: claude-agent-sdk-agent-loop-2026.md).

### SDKPartialAssistantMessage (streaming)

Yielded when `includePartialMessages: true`. Contains raw Claude API streaming events, not accumulated text. Accumulate text deltas yourself (source: claude-agent-sdk-streaming-output-2026.md).

```typescript
type SDKPartialAssistantMessage = {
  type: "stream_event";
  event: BetaRawMessageStreamEvent;  // from @anthropic-ai/sdk
  parent_tool_use_id: string | null; // always null
  uuid: string;
  session_id: string;
  ttft_ms?: number;              // time to first token, on message_start only
  user_message_uuid?: string;
};
```

Stream events are emitted for the main session only. Subagent token deltas are not forwarded. Use complete `AssistantMessage` objects (which carry `parent_tool_use_id`) to attribute output to subagents (source: claude-agent-sdk-streaming-output-2026.md).

Message flow with streaming enabled (source: claude-agent-sdk-streaming-output-2026.md):

```
StreamEvent (message_start)
StreamEvent (content_block_start) - text block
StreamEvent (content_block_delta) - text chunks...
AssistantMessage - complete text block
StreamEvent (content_block_stop)
StreamEvent (content_block_start) - tool_use block
StreamEvent (content_block_delta) - tool input chunks...
AssistantMessage - complete tool_use block
StreamEvent (content_block_stop)
StreamEvent (message_delta)
StreamEvent (message_stop)
... tool executes ...
ResultMessage - final result
```

Streaming text extraction (source: claude-agent-sdk-streaming-output-2026.md):

```typescript
if (message.type === "stream_event") {
  const event = message.event;
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    process.stdout.write(event.delta.text);
  }
}
```

### Structured output on ResultMessage

Pass `outputFormat: { type: "json_schema", schema }` in options. The result carries `structured_output` with validated data. Use Zod with `z.toJSONSchema(schema, { target: "draft-7" })` for type-safe parsing. The SDK validates against JSON Schema draft-07 (source: claude-agent-sdk-structured-outputs-2026.md).

```typescript
if (message.type === "result" && message.subtype === "success" && message.structured_output) {
  const data = message.structured_output;
}
```

A result can have `subtype: "success"` but no `structured_output` value (the agent completed without producing structured output). Treat that as a failure (source: claude-agent-sdk-structured-outputs-2026.md).

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

Entry points (source: claude-agent-sdk-ts-reference-2026.md):

- **`query()`** -- returns a `Query` async generator (`AsyncGenerator<SDKMessage, void>`) with methods for runtime control.
- **`startup()`** -- pre-warms the CLI subprocess before a prompt is available. Returns `Promise<WarmQuery>` whose `.query(prompt)` method skips subprocess spawn cost.

```typescript
function query({
  prompt,
  options
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;

function startup(params?: {
  options?: Options;
  initializeTimeoutMs?: number; // default 60000
}): Promise<WarmQuery>;
```

The `Query` interface extends `AsyncGenerator<SDKMessage, void>` with runtime control methods (source: agnt-claude-agent-sdk-cheatsheet-2026.md, claude-agent-sdk-typescript-reference-2026.md):

```typescript
interface Query extends AsyncGenerator<SDKMessage, void> {
  interrupt(): Promise<void>;
  rewindFiles(userMessageUuid: string): Promise<void>;
  setPermissionMode(mode: PermissionMode): Promise<void>;
  setModel(model?: string): Promise<void>;
  setMaxThinkingTokens(maxThinkingTokens: number | null): Promise<void>;
  supportedCommands(): Promise<SlashCommand[]>;
  supportedModels(): Promise<ModelInfo[]>;
  mcpServerStatus(): Promise<McpServerStatus[]>;
  accountInfo(): Promise<AccountInfo>;
}
```

Additional functions: `tool()` for type-safe MCP tools (uses Zod schemas, supports Zod 3 & 4), `createSdkMcpServer()` (with optional `timeout` for tool calls, v0.3.248+), `listSessions()`, `getSessionMessages()`, `getSessionInfo()`, `renameSession()`, `tagSession()`, `resolveSettings()` (source: claude-agent-sdk-typescript-reference-2026.md).

Plain chat with no tools: call `query({ prompt: "..." })` with no options. The minimal default system prompt covers only tool calling (source: claude-agent-sdk-system-prompts-2026.md).

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

## Options (TypeScript)

The central configuration object for `query()`. All fields are optional with sensible defaults (source: claude-agent-sdk-ts-reference-2026.md).

### System prompt

Four forms (source: claude-agent-sdk-system-prompts-2026.md, claude-agent-sdk-ts-reference-2026.md):

```typescript
// 1. Omit entirely: minimal default (tool-calling only, no coding guidelines)
query({ prompt: "..." })

// 2. Raw string: replaces the default entirely
query({ prompt: "...", options: { systemPrompt: "You are an expert Python developer" } })

// 3. Preset object: uses Claude Code's built-in prompt, optionally appending text
query({ prompt: "...", options: {
  systemPrompt: {
    type: "preset",
    preset: "claude_code",
    append: "Focus on security.",
    excludeDynamicSections: false,  // true moves env context to first user message for cache sharing
    snapshot: false,                // true (default): record prompt once per session; false: rebuild every request
  }
}})

// 4. Array with cache boundary: split static instructions from per-request context
import { SYSTEM_PROMPT_DYNAMIC_BOUNDARY } from "@anthropic-ai/claude-agent-sdk";
query({ prompt: "...", options: {
  systemPrompt: [staticInstructions, SYSTEM_PROMPT_DYNAMIC_BOUNDARY, perRequestContext]
}})
```

Type union: `string | SystemPromptPreset | string[] | undefined`.

The preset form is the only way to get Claude Code's full system prompt (tool guidance, safety rules, environment context). A custom string replaces everything. The array form splits the prompt into two cache-breakpoint blocks, only when calling the Claude API directly or on Claude Platform on AWS. On Bedrock, Agent Platform, Foundry, or LLM gateways, the array is joined into one block (source: claude-agent-sdk-system-prompts-2026.md).

`excludeDynamicSections` (v0.2.98+) moves working directory, git-repo flag, platform, shell, OS version, and auto memory paths from the system prompt to the first user message, enabling cross-session cache sharing. Instructions in the user message carry marginally less weight (source: claude-agent-sdk-system-prompts-2026.md).

`snapshot` (v0.3.257+) controls whether the system prompt is recorded once per session (default) or rebuilt every request. Set `false` when iterating on prompt wording or changing `append` between resumed calls (source: claude-agent-sdk-system-prompts-2026.md).

CLAUDE.md loading is controlled by `settingSources`, not the system prompt. Default `query()` loads both `'project'` and `'user'` sources. Set `settingSources: []` to suppress all filesystem settings including CLAUDE.md (source: claude-agent-sdk-system-prompts-2026.md).

A regression in v0.2.15 through at least v0.2.20 injected "You are a Claude agent, built on Anthropic's Claude Agent SDK." before custom string prompts, causing the model to deprioritize custom role/behavior instructions. The issue was closed (source: claude-agent-sdk-issue-237-systemprompt-2026.md).

### Tool control

`allowedTools` and `disallowedTools` are both `string[]`, defaulting to empty. `allowedTools` is a permission allowlist (auto-approves listed tools), not a tool filter. Unlisted tools still exist and fall through to `permissionMode` and `canUseTool`. To remove a tool entirely from Claude's context, use `disallowedTools` with a bare name (e.g., `"Bash"`). To block specific invocations while keeping the tool available, use a scoped deny rule (e.g., `"Bash(rm *)"`) which applies in all modes including `bypassPermissions` (source: claude-agent-sdk-ts-reference-2026.md, claude-agent-sdk-permissions-detail-2026.md).

### Permission mode

```typescript
type PermissionMode = 'default' | 'plan' | 'bypassPermissions' | 'auto';
```

- `'default'`: user approves each tool call
- `'plan'`: Claude describes plan before executing tools
- `'bypassPermissions'`: skip permissions (requires `allowDangerouslySkipPermissions: true`)
- `'auto'`: auto-select mode based on session

The TypeScript SDK does not expose `'dontAsk'` or `'acceptEdits'` in the `PermissionMode` type, unlike the Python SDK (source: claude-agent-sdk-ts-reference-2026.md).

### canUseTool callback

Called only when the permission flow falls through to prompt (source: claude-agent-sdk-ts-reference-2026.md):

```typescript
type CanUseTool = (
  request: CanUseToolRequest,
  options: { signal: AbortSignal }
) => Promise<CanUseToolResponse>;

interface CanUseToolRequest {
  toolUseId: string;
  toolName: string;
  toolInput: Record<string, unknown>;
  toolServer?: { name: string; instruction?: string };
  reason?: string;
}

interface CanUseToolResponse {
  allowed: boolean;
  reason?: string;
}
```

### Other notable fields

| Field | Type | Description |
|:------|:-----|:------------|
| `model` | `string` | Claude model alias or full name |
| `fallbackModel` | `string` | Model to use if primary fails |
| `maxTurns` | `number` | Cap on agentic turns (tool-use round trips) |
| `maxBudgetUsd` | `number` | Stop when estimated cost reaches this |
| `effort` | `'low' \| 'medium' \| 'high' \| 'xhigh' \| 'max'` | Effort level and thinking depth |
| `thinking` | `{ type: 'enabled', budget: number } \| { type: 'disabled' }` | Extended thinking config |
| `cwd` | `string` | Working directory (default: `process.cwd()`) |
| `additionalDirectories` | `string[]` | Extra directories Claude can access |
| `env` | `Record<string, string \| undefined>` | Environment variables (replaces subprocess env, not merged) |
| `continue` | `boolean` | Continue most recent conversation |
| `resume` | `string` | Session ID to resume |
| `resumeSessionAt` | `string` | Resume at specific message UUID |
| `resumeDropsTurn` | `string` | UUID of turn to discard on resume (v2.1.223+) |
| `forkSession` | `boolean` | Fork to new session ID when resuming |
| `persistSession` | `boolean` | Disable session persistence to disk when `false` (default: `true`) |
| `mcpServers` | `Record<string, McpServerConfig>` | MCP server configurations |
| `hooks` | `Partial<Record<HookEvent, HookCallbackMatcher[]>>` | Hook callbacks for events |
| `agents` | `Record<string, AgentDefinition>` | Programmatic subagent definitions |
| `subagentDefaults` | `SubagentDefaults` | Default config for spawned subagents |
| `skills` | `string[]` | Skill names to load |
| `plugins` | `SdkPluginConfig[]` | Custom plugins from local paths |
| `settings` | `Settings` | Inline settings object (same schema as settings files) |
| `settingSources` | `string[]` | Which filesystem settings to load (`"user"`, `"project"`, `"local"`) |
| `managedSettings` | `Settings` | Policy-tier settings from embedding host |
| `outputFormat` | `{ type: 'json_schema', schema: JSONSchema }` | Structured output via JSON Schema |
| `sandbox` | `SandboxSettings` | Sandbox behavior configuration |
| `sessionStore` | `SessionStore` | Alpha. Custom session storage backend |
| `enableFileCheckpointing` | `boolean` | Track file changes for rewinding |
| `includePartialMessages` | `boolean` | Yield partial streaming events |
| `forwardSubagentText` | `boolean` | Forward subagent text/thinking blocks |
| `agentProgressSummaries` | `boolean` | One-line progress summaries for subagents |
| `promptSuggestions` | `boolean` | Enable follow-up prompt suggestions |
| `permissionPrompts` | `'host' \| 'none'` | Who answers permission prompts (v2.1.259+) |
| `planModeInstructions` | `string` | Custom workflow instructions for plan mode |
| `abortController` | `AbortController` | Controller for cancelling operations |
| `debug` | `boolean` | Enable debug mode |
| `debugFile` | `string` | Write debug logs to file (implicitly enables debug) |
| `pathToClaudeCodeExecutable` | `string` | Custom path to Claude Code binary |

(source: claude-agent-sdk-ts-reference-2026.md)

### AgentDefinition (TypeScript)

```typescript
interface AgentDefinition {
  instructions: string;
  model?: string;
  skills?: string[];
  tools?: Record<string, McpServerConfig>;
  agents?: Record<string, AgentDefinition>;
  maxTurns?: number;
  thinking?: ThinkingConfig;
}
```

(source: claude-agent-sdk-ts-reference-2026.md)

### SubagentDefaults

```typescript
interface SubagentDefaults {
  model?: string;
  maxTurns?: number;
  thinking?: ThinkingConfig;
  permissionMode?: PermissionMode;
}
```

(source: claude-agent-sdk-ts-reference-2026.md)

### Hook events (TypeScript)

```typescript
type HookEvent = 'SessionStart' | 'Setup' | 'Notification' | 'SessionEnd' | 'PreCompact' | 'PostCompact';

interface HookCallbackMatcher {
  match?: (event: HookEventPayload) => boolean;
  exec: (event: HookEventPayload) => Promise<void>;
}
```

(source: claude-agent-sdk-ts-reference-2026.md)

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

## Error handling

### Exception types

`ClaudeSDKError` (base), `CLINotFoundError`, `CLIConnectionError`, `ProcessError` (has `exit_code`), `CLIJSONDecodeError` (source: claude-agent-sdk-github-readme-2026.md).

### Query error behavior

A single-shot `query()` call yields the error `ResultMessage`, then throws an error with the failure text (e.g. `Reached maximum number of turns`). Wrap the `for await` loop in try/catch if your code needs to continue past it. The underlying Claude Code process also exits with a nonzero code (source: claude-agent-sdk-agent-loop-2026.md).

A streaming input session stays alive after an error result and can accept more messages, except after a session crash (`error_during_execution`), which exits the process (source: claude-agent-sdk-agent-loop-2026.md).

```typescript
try {
  for await (const message of query({ prompt: "..." })) {
    if (message.type === "result") {
      if (message.subtype === "success") {
        console.log(message.result);
      } else {
        console.log(`Stopped: ${message.subtype}`);
      }
    }
  }
} catch (error) {
  // query() throws after yielding an error result
  console.log(`Session ended with an error: ${error}`);
}
```

Detect model refusals via `stop_reason === "refusal"` on the `ResultMessage` (source: claude-agent-sdk-agent-loop-2026.md).

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

## Related pages

[[claude-agent-sdk-runtime]] | [[claude-code-hooks]] | [[claude-code-plugins]] | [[claude-code-skills]] | [[claude-code-headless]]
