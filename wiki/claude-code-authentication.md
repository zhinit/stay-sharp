# Claude Code Authentication

Claude Code supports multiple authentication methods for individuals, teams, and organizations. The same credential infrastructure applies to interactive sessions, headless mode (`claude -p`), and the [[claude-agent-sdk]] (source: claude-code-authentication-2026.md).

## Authentication methods

Individual users can log in with a Claude.ai account (Pro, Max, Team, or Enterprise subscription). Teams can use Claude for Teams or Enterprise, the Claude Console, or a cloud provider (Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry). On first launch, `claude` opens a browser window for login. If `ANTHROPIC_API_KEY` is set, Claude Code skips the login prompt and asks to approve the key instead (source: claude-code-authentication-2026.md).

## Credential precedence

When multiple credentials are present, Claude Code chooses one in this order (source: claude-code-authentication-2026.md):

1. **Cloud provider credentials** -- when `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX`, or `CLAUDE_CODE_USE_FOUNDRY` is set.
2. **`ANTHROPIC_AUTH_TOKEN`** -- bearer token for LLM gateway/proxy routing.
3. **`ANTHROPIC_API_KEY`** -- API key from the Claude Console. In non-interactive mode (`-p`), always used when present.
4. **`apiKeyHelper`** -- shell script that returns a key dynamically (for rotating/vault-fetched credentials).
5. **`CLAUDE_CODE_OAUTH_TOKEN`** -- long-lived OAuth token from `claude setup-token`. For CI/scripts without browser login.
6. **Anthropic profile/federation credentials** -- from `ant auth login` or Workload Identity Federation. Ranks here only when named in `ANTHROPIC_PROFILE`; otherwise ranks below `/login`.
7. **Subscription OAuth from `/login`** -- default for Pro, Max, Team, and Enterprise users.

A signed-in Claude apps gateway session outranks all of the above (source: claude-code-authentication-2026.md).

If `ANTHROPIC_API_KEY` is set alongside an active subscription, the API key takes precedence (level 3 beats level 7). Run `unset ANTHROPIC_API_KEY` to fall back to subscription auth. Use `/status` to confirm which method is active (source: claude-code-authentication-2026.md).

## Generating a long-lived subscription token

`claude setup-token` opens the same browser authorization flow as `/login` and prints a one-year OAuth token. It does not save the token anywhere. Set it as `CLAUDE_CODE_OAUTH_TOKEN` in the target environment (source: claude-code-authentication-2026.md):

```bash
claude setup-token
export CLAUDE_CODE_OAUTH_TOKEN=your-token
```

This token authenticates with your Claude subscription and requires a Pro, Max, Team, or Enterprise plan. It can only make model requests (no Remote Control sessions, no claude.ai connectors). MCP servers configured locally still work (source: claude-code-authentication-2026.md).

## Bare mode auth restrictions

`--bare` mode does not read OAuth credentials or the system keychain. It requires `ANTHROPIC_API_KEY` or an `apiKeyHelper` passed via `--settings`. Cloud provider credentials (Bedrock, Vertex, Foundry) still work in bare mode. `CLAUDE_CODE_OAUTH_TOKEN` does not work in bare mode (source: claude-code-authentication-2026.md, claude-code-headless-updated-2026.md).

This means subscription-based auth and bare mode are mutually exclusive. To use your subscription in headless mode, run `claude -p` without `--bare`, which loads the full project context (hooks, skills, plugins, MCP servers, CLAUDE.md) (source: claude-code-headless-updated-2026.md).

## Subscription auth and the Agent SDK

The Agent SDK uses the same auth infrastructure as Claude Code. `apiKeyHelper`, `ANTHROPIC_API_KEY`, and `ANTHROPIC_AUTH_TOKEN` all apply to the SDK (source: claude-code-authentication-2026.md).

Anthropic does not allow third-party developers to offer claude.ai login or rate limits for Agent SDK products unless previously approved. The quickstart directs developers to use API key authentication (source: claude-agent-sdk-quickstart-updated-2026.md, claude-agent-sdk-overview-2026.md).

For first-party/personal use, subscription OAuth works with the SDK since it shares Claude Code's auth layer.

## Agent SDK credit pool (paused)

Anthropic planned separate monthly credits for Agent SDK usage starting June 15, 2026. Eligible amounts: Pro $20/mo, Max 5x $100/mo, Max 20x $200/mo, Team Standard $20/mo, Team Premium $100/mo, Enterprise usage-based $20/mo, Enterprise Premium $200/mo. Credits would cover `claude -p`, Agent SDK usage, and GitHub Actions integration (source: claude-agent-sdk-plan-billing-2026.md).

This launch was paused indefinitely. Agent SDK and `claude -p` usage currently draws from normal subscription limits. Nothing changed about billing as of the pause date (source: claude-agent-sdk-plan-billing-2026.md).

## Credential storage

On macOS, credentials are stored in the encrypted macOS Keychain. On Linux, in `~/.claude/.credentials.json` with mode `0600`. On Windows, in `%USERPROFILE%\.claude\.credentials.json`. The `CLAUDE_CONFIG_DIR` environment variable overrides the default location on Linux and Windows (source: claude-code-authentication-2026.md).

## Login expiry

Logins created with `/login` show a warning three days before expiry. Once expired, requests fail until you run `/login` again. `/status` shows a `Login: Expired` row when the saved credential is expired (source: claude-code-authentication-2026.md).

## Related pages

[[claude-agent-sdk]] | [[claude-code-headless]] | [[claude-code-config-paths]]
