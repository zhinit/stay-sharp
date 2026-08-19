# Claude Code Headless / Programmatic Mode

Claude Code can run non-interactively as a subprocess using `claude -p`. This provides a simpler alternative to the [[claude-agent-sdk]] for programmatic use when you do not need the full SDK's callback hooks, streaming message objects, or multi-turn session management (source: claude-code-headless-2026.md).

## Basic usage

Pass `-p` (or `--print`) with a prompt to run non-interactively. Claude Code executes the prompt and exits (source: claude-code-headless-2026.md):

```bash
claude -p "What does the auth module do?"
```

Exit code 0 on success, non-zero on failure.

## Bare mode

`--bare` reduces startup time by skipping auto-discovery of hooks, skills, plugins, MCP servers, auto memory, and CLAUDE.md. Useful for CI and scripts where you need consistent results across machines. `--bare` is the recommended mode for scripted and SDK calls, and will become the default for `-p` in a future release (source: claude-code-headless-updated-2026.md).

In bare mode, Claude Code never reads OAuth credentials or the system keychain. Requires `ANTHROPIC_API_KEY` or an `apiKeyHelper` via `--settings`. Cloud provider credentials (Bedrock, Vertex, Foundry) still work. `CLAUDE_CODE_OAUTH_TOKEN` and subscription OAuth from `/login` are not available in bare mode (source: claude-code-headless-updated-2026.md, claude-code-authentication-2026.md).

This means subscription-based auth and bare mode are mutually exclusive. To use a subscription in headless mode, run `claude -p` without `--bare`, accepting the full project context load. See [[claude-code-authentication]] for the complete credential precedence chain.

Flags available in bare mode to load context: `--append-system-prompt`, `--append-system-prompt-file`, `--settings`, `--mcp-config`, `--agents`, `--plugin-dir`, `--plugin-url` (source: claude-code-headless-updated-2026.md).

## Output formats

Three formats via `--output-format` (source: claude-code-headless-2026.md):

- `text` (default) -- plain text
- `json` -- structured JSON with result, session ID, cost metadata. With `--json-schema`, the `structured_output` field conforms to the given schema.
- `stream-json` -- newline-delimited JSON for real-time streaming

## Piping data

Non-interactive mode reads stdin. Piped input is capped at 10MB (source: claude-code-headless-2026.md):

```bash
cat build-error.txt | claude -p 'explain the root cause' > output.txt
```

## Auto-approve tools

Use `--allowedTools` to pre-approve tools so calls complete without prompts (source: claude-code-headless-2026.md):

```bash
claude -p "Fix the bug" --allowedTools "Read,Edit,Bash"
```

## Continuing conversations

`--continue` resumes the most recent session. `--resume <session-id>` resumes a specific session. Both carry forward the full conversation context (source: claude-code-headless-2026.md).

## Background tasks at exit

If Claude starts a background Bash task during a `-p` run (e.g. a dev server), the shell is terminated about 5 seconds after the final result. Background subagents and workflows are waited on (capped at 10 minutes by default, configurable via `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`) (source: claude-code-headless-2026.md).

## Related pages

[[claude-agent-sdk]] | [[claude-code-hooks]] | [[claude-code-plugins]]
