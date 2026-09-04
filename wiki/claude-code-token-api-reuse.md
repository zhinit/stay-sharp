# Claude Code Token API Reuse

An OAuth access token obtained from Claude Code can be used to call the Anthropic `/v1/messages` API directly, the same way a Console API key can. This is useful for personal automation and scripting. Anthropic does not officially support this use case for third-party applications (source: alif-claude-oauth-api-key-2025.md).

## Extracting the token

On macOS, read from the Keychain (source: gist-prajwalsrinvas-claude-code-credentials-2025.md):

```bash
security find-generic-password -s "Claude Code-credentials" -w
```

This returns the full credential JSON. Extract the `accessToken` field from the `claudeAiOauth` object.

On Linux, read the file directly (source: gist-prajwalsrinvas-claude-code-credentials-2025.md):

```bash
cat ~/.claude/.credentials.json
```

Parse the `claudeAiOauth.accessToken` value from the JSON.

## Calling the API

Send the access token as a Bearer token in the `Authorization` header. The standard `X-Api-Key` header used with Console API keys is not used here (source: alif-claude-oauth-api-key-2025.md).

```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-ant-oat01-your-token" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-5",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello, Claude!"}]
  }'
```

Key differences from API key authentication:

| | API Key | OAuth Token |
|---|---|---|
| Header | `X-Api-Key: sk-ant-api03-...` | `Authorization: Bearer sk-ant-oat01-...` |
| Source | Claude Console | Claude Code login / `setup-token` |
| Billing | Console organization | User's subscription (Pro/Max/Team/Enterprise) |
| Expiry | No expiry (unless revoked) | 8 hours (access token), refresh token longer |

(source: alif-claude-oauth-api-key-2025.md, claude-code-authentication-2026.md)

## Token refresh

Access tokens expire after 8 hours (`expires_in: 28800`). Refresh by posting to the token endpoint (source: alif-claude-oauth-api-key-2025.md):

```bash
curl -X POST https://console.anthropic.com/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "sk-ant-ort01-your-refresh-token",
    "client_id": "9d1c250a-e61b-44d9-88ed-5944d1962f5e"
  }'
```

The response includes a new `access_token` and `expires_in`. See [[claude-code-oauth-flow]] for the full token exchange details.

Note: the refresh endpoint URL varies across sources. The alif.web.id source uses `https://console.anthropic.com/api/oauth/token`, the shubcodes gist uses `https://platform.claude.com/v1/oauth/token`, and the opencode-claude-auth project uses `https://claude.ai/v1/oauth/token` (source: alif-claude-oauth-api-key-2025.md, gist-shubcodes-claude-code-oauth-login-2025.md, github-opencode-claude-auth-2025.md). `platform.claude.com` appears to be the canonical endpoint based on the official docs and binary extraction.

## Programmatic extraction and use

The opencode-claude-auth project demonstrates continuous token reuse: it reads credentials from the Keychain or `.credentials.json`, caches them in memory with a 30-second TTL, and refreshes proactively before expiry. On macOS it enumerates all `Claude Code-credentials*` Keychain entries for multi-account support (source: github-opencode-claude-auth-2025.md).

## Caveats

- **Unsupported by Anthropic.** OAuth tokens may be client-scoped to Claude Code. Third-party reuse works in practice for personal automation but is not an officially supported flow (source: alif-claude-oauth-api-key-2025.md).
- **Rate limits.** Requests made with an OAuth token count against the user's subscription rate limits, not Console API limits.
- **8-hour expiry.** Unlike API keys, access tokens require periodic refresh. Automation must handle the refresh flow or use `claude setup-token` for a one-year token.
- **`setup-token` alternative.** For long-lived use, `claude setup-token` generates a one-year token that can be set as `CLAUDE_CODE_OAUTH_TOKEN`. This is the officially supported path for CI/scripts (source: claude-code-authentication-2026.md).
- **Bare mode incompatibility.** `CLAUDE_CODE_OAUTH_TOKEN` does not work with `--bare` mode. Use `ANTHROPIC_API_KEY` or `apiKeyHelper` for bare mode (source: claude-code-authentication-2026.md).

## Related pages

[[claude-code-authentication]] | [[claude-code-oauth-flow]]
