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

## Anthropic profiles and federation credentials

Credential precedence level 6 covers Anthropic profiles and Workload Identity Federation. A profile is a named credential configuration file in the Anthropic configuration directory (default `~/.config/anthropic` on macOS/Linux, `%APPDATA%\Anthropic` on Windows). Auth mode is either `oidc_federation` (WIF) or `user_oauth` (`ant auth login` or Console sign-in without API key) (source: claude-code-authentication-sept-2026.md).

Claude Code checks three profile sources in order and stops at the first one set:

| Source | Set by | Rank vs. `/login` |
|---|---|---|
| Named profile | `ANTHROPIC_PROFILE` | Above (either auth mode) |
| Federation variables | `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` | Above |
| Active profile | `active_config` file or `default` profile | Above if `oidc_federation`; below working `/login` if `user_oauth` |

The `user_oauth` rule prevents a leftover `ant auth login` profile from overriding the account signed in via `/login`. Profiles are not read in bare mode, Claude Desktop, or cloud sessions (source: claude-code-authentication-sept-2026.md).

Features requiring a claude.ai login (claude.ai connectors, `/schedule`) are not available while a profile or federation credential is selected (source: claude-code-authentication-sept-2026.md).

## Console sign-in without API key

Console users can sign in without creating an API key (v2.1.242+). Claude Code stores the OAuth token as an Anthropic profile. Unlike a static API key, the profile login refreshes automatically; when refresh fails, requests fail with "Anthropic profile login expired" (source: claude-code-authentication-sept-2026.md).

This option is not offered when `forceLoginOrgUUID` is set, `forceLoginMethod` is `"claudeai"` or `"console"`, or when running against a cloud provider (source: claude-code-authentication-sept-2026.md).

## Subscription auth and the Agent SDK

The official docs state that `apiKeyHelper`, `ANTHROPIC_API_KEY`, and `ANTHROPIC_AUTH_TOKEN` apply to "the CLI and the surfaces that wrap it, including the VS Code extension, the Agent SDK, and GitHub Actions." `CLAUDE_CODE_OAUTH_TOKEN` is not in that explicit list but likely works via the shared auth infrastructure (source: claude-code-authentication-sept-2026.md).

Anthropic does not allow third-party developers to offer claude.ai login or rate limits for Agent SDK products unless previously approved. The quickstart directs developers to use API key authentication (source: claude-agent-sdk-overview-sept-2026.md).

For first-party/personal use, subscription OAuth works with the SDK since it shares Claude Code's auth layer.

## Agent SDK credit pool (paused)

Anthropic planned separate monthly credits for Agent SDK usage starting June 15, 2026. Eligible amounts: Pro $20/mo, Max 5x $100/mo, Max 20x $200/mo, Team Standard $20/mo, Team Premium $100/mo, Enterprise usage-based $20/mo, Enterprise Premium $200/mo. Credits would cover `claude -p`, Agent SDK usage, and GitHub Actions integration (source: claude-agent-sdk-plan-billing-2026.md).

This launch was paused indefinitely. Agent SDK and `claude -p` usage currently draws from normal subscription limits. Nothing changed about billing as of the pause date (source: claude-agent-sdk-plan-billing-2026.md).

## Credential storage

On macOS, credentials are stored in the encrypted macOS Keychain under the service name `"Claude Code-credentials"` with the account set to `$USER`. On Linux, credentials are stored in `~/.claude/.credentials.json` with mode `0600`. On Windows, in `%USERPROFILE%\.claude\.credentials.json`. The `CLAUDE_CONFIG_DIR` environment variable overrides the default `.claude` directory on all platforms; the macOS Keychain entry is also keyed to that directory, so a different `CLAUDE_CONFIG_DIR` reads a different entry (source: claude-code-authentication-2026.md, gist-prajwalsrinvas-claude-code-credentials-2025.md).

When the macOS Keychain rejects a write (e.g. locked in an SSH session), Claude Code falls back to `~/.claude/.credentials.json` with mode `0600`, the same storage it uses on Linux (source: claude-code-authentication-2026.md).

### Credential file format

All platforms use the same JSON structure (source: gist-prajwalsrinvas-claude-code-credentials-2025.md, gist-shubcodes-claude-code-oauth-login-2025.md):

```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt": 1748276587173,
    "scopes": ["user:inference", "user:profile", "user:sessions:claude_code", "user:mcp_servers"]
  }
}
```

The `accessToken` uses the prefix `sk-ant-oat01-`. The `refreshToken` uses the prefix `sk-ant-ort01-`. `expiresAt` is Unix epoch in milliseconds. The `scopes` array lists the OAuth scopes the token was granted (source: gist-shubcodes-claude-code-oauth-login-2025.md).

Additional fields `subscriptionType` and `rateLimitTier` may appear in the `claudeAiOauth` object, both nullable (source: gist-shubcodes-claude-code-oauth-login-2025.md).

The config file `~/.claude.json` stores account metadata separately (not credentials): an `oauthAccount` object with `accountUuid`, `emailAddress`, and `organizationUuid` (source: gist-shubcodes-claude-code-oauth-login-2025.md).

### Reading credentials

On macOS (source: gist-prajwalsrinvas-claude-code-credentials-2025.md):
```bash
security find-generic-password -s "Claude Code-credentials" -w
```

On Linux (source: gist-prajwalsrinvas-claude-code-credentials-2025.md):
```bash
cat ~/.claude/.credentials.json
```

On Windows PowerShell (source: gist-prajwalsrinvas-claude-code-credentials-2025.md):
```powershell
Get-Content "$env:USERPROFILE\.claude\.credentials.json"
```

### Environment variable overrides

`CLAUDE_CODE_OAUTH_TOKEN` silently overrides stored credentials when set. This is the primary env var for CI/scripts. `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` and `CLAUDE_CODE_OAUTH_SCOPES` can also be set for print mode (source: claude-code-authentication-2026.md, gist-shubcodes-claude-code-oauth-login-2025.md).

If `/login` is run while `CLAUDE_CODE_OAUTH_TOKEN` is set, Claude Code switches the current session to the new login, but reads the variable again in every new session until it is removed from the shell profile or settings `env` block (source: claude-code-authentication-2026.md).

## Login expiry

Access tokens expire after 8 hours. Claude Code refreshes them automatically using the stored refresh token. Logins created with `/login` show a warning three days before expiry. Once expired and unrefreshable, requests fail until you run `/login` again. `/status` shows a `Login: Expired` row when the saved credential is expired (source: claude-code-authentication-2026.md, alif-claude-oauth-api-key-2025.md).

## Rate limit systems

Subscription auth and API key auth hit entirely separate rate-limiting systems (source: claude-code-authentication-sept-2026.md, anthropic-api-rate-limits-sept-2026.md):

**Subscription (OAuth) rate limits** apply to requests made via `/login` credentials or `CLAUDE_CODE_OAUTH_TOKEN`. These use a rolling 5-hour window with a fixed message quota, plus a weekly allowance on paid plans. Anthropic does not publish exact numbers for these limits. Hitting the limit yields a cooldown period.

**Console/API rate limits** apply to requests made via `ANTHROPIC_API_KEY` from the Claude Console. These are measured in RPM, ITPM, and OTPM per model class, organized into usage tiers (Start, Build, Scale, Custom). Limits use a token bucket algorithm with continuous replenishment. Spend caps apply per calendar month ($500 Start, $1,000 Build, $200,000 Scale). Cached input tokens (except on Haiku 3.5) do not count toward ITPM (source: anthropic-api-rate-limits-sept-2026.md).

The two systems do not interact. A user can be rate-limited on their subscription while having ample API key headroom, or vice versa.

## Related pages

[[claude-code-oauth-flow]] | [[claude-code-token-api-reuse]] | [[claude-agent-sdk]] | [[claude-code-headless]] | [[claude-code-config-paths]]
