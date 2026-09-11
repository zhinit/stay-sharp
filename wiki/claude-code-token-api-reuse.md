# Claude Code Token API Reuse

Using a Claude Code OAuth token (`sk-ant-oat01-*`) to call `/v1/messages` directly. The token works if you replicate the headers and system prompt conventions Claude Code uses. Without them, the API rejects the token. Third-party use of subscription tokens is a Terms of Service violation as of January 2026 (source: webcoda-anthropic-blocks-subscriptions-2026.md).

## Required headers

Three things distinguish an OAuth token request from a standard API key request (source: promptfoo-anthropic-provider-2026.md, hermes-agent-pr-1097-anthropic-provider-2026.md):

1. **`Authorization: Bearer sk-ant-oat01-...`** replaces the standard `X-Api-Key` header. Only tokens prefixed `sk-ant-api*` use `X-Api-Key`; everything else uses Bearer auth (source: hermes-agent-pr-1097-anthropic-provider-2026.md).

2. **`anthropic-beta: claude-code-20250219,oauth-2025-04-20`** -- two beta feature flags, comma-separated. The `oauth-2025-04-20` flag enables OAuth token authentication on the Messages endpoint. Without it, the API returns `"OAuth authentication is currently not supported."` (source: promptfoo-anthropic-provider-2026.md, claude-code-issue-13770-oauth-beta-header-2025.md).

3. **`anthropic-version: 2023-06-01`** -- standard API version header (unchanged from API key auth).

The `oauth-2025-04-20` beta flag is specific to Anthropic's own API. Sending it to third-party gateways (LiteLLM routing to Vertex AI, etc.) causes a `400 invalid_request_error` with `"Unexpected value(s) oauth-2025-04-20 for the anthropic-beta header"`. This was filed as a Claude Code regression in v2.0.65 (source: claude-code-issue-13770-oauth-beta-header-2025.md).

## Claude Code identity system block

The first system block in the request must be the Claude Code identity string (source: promptfoo-anthropic-provider-2026.md, hermes-agent-issue-53212-billing-classifier-2026.md):

```
You are Claude Code, Anthropic's official CLI for Claude.
```

This 57-character string signals Anthropic's billing classifier to route the request through the included subscription lane. Your own system prompt goes in the next system block. The identity block must be type `text` in the system array (source: hermes-agent-issue-53212-billing-classifier-2026.md).

Without the identity block, requests using a subscription token are classified as overage/extra-usage billing. If overage is disabled or exhausted on the account, this causes a 429 (source: hermes-agent-issue-53212-billing-classifier-2026.md).

## Billing classifier behavior

Even with the identity block present, Anthropic's billing classifier can still route requests to the overage lane based on the content of subsequent system blocks. Testing against the live API with the same token, model, and headers, varying only the system prompt (source: hermes-agent-issue-53212-billing-classifier-2026.md):

| Request | Result |
|---|---|
| Identity block only (57 chars) | 200 |
| Identity block + short generic prompt + 40 tools + thinking | 200 |
| Identity block + 18,900 chars generic filler | 200 |
| Identity block + real agent system prompt (18,554 chars) | 429 |
| Identity block + first 4,000 chars of real prompt | 200 |
| Identity block + first 4,500 chars of real prompt | 429 |

The trigger is cumulative agent/app-specific instruction content (skill management directives, session search parameters, Computer Use instructions), not raw character count. Generic filler passes at any length. The threshold sits around 4,000-4,500 characters of non-Claude-Code instructions (source: hermes-agent-issue-53212-billing-classifier-2026.md).

Third-party bridges that maintain subscription billing (e.g. the opencode-claude-bridge family) replace the app system prompt with the genuine Claude Code system prompt rather than sending their own (source: hermes-agent-issue-53212-billing-classifier-2026.md).

## Complete curl example

```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-ant-oat01-your-token" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: claude-code-20250219,oauth-2025-04-20" \
  -d '{
    "model": "claude-sonnet-5",
    "max_tokens": 1024,
    "system": [
      {"type": "text", "text": "You are Claude Code, Anthropic'\''s official CLI for Claude."},
      {"type": "text", "text": "Your custom instructions here (keep under ~4000 chars)."}
    ],
    "messages": [{"role": "user", "content": "Hello, Claude!"}]
  }'
```

(source: hermes-agent-issue-53212-billing-classifier-2026.md, promptfoo-anthropic-provider-2026.md, hermes-agent-pr-1097-anthropic-provider-2026.md)

## Auth header comparison

| | API Key | OAuth Token |
|---|---|---|
| Header | `X-Api-Key: sk-ant-api03-...` | `Authorization: Bearer sk-ant-oat01-...` |
| Beta header | Not required | `claude-code-20250219,oauth-2025-04-20` |
| Identity block | Not required | Required as first system block |
| Source | Claude Console | Claude Code login / `setup-token` |
| Billing | Console organization (per-token) | User's subscription (flat rate) |
| Expiry | No expiry (unless revoked) | 8 hours (access token); 1 year (`setup-token`) |

(source: alif-claude-oauth-api-key-2025.md, claude-code-authentication-2026.md, promptfoo-anthropic-provider-2026.md)

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

## 429 errors with OAuth tokens

A 429 `rate_limit_error` from an OAuth token request can mean several different things (source: hermes-agent-issue-53212-billing-classifier-2026.md, anthropic-api-rate-limits-2026.md, codexbar-issue-575-oauth-429-2026.md):

**Billing misclassification (no `retry-after` header).** The request was routed to the overage billing lane instead of subscription billing. The message says "monthly spend limit" even though subscription tokens have no monthly spend limit (they use 5-hour/weekly rate windows). Causes: missing identity block, wrong beta headers, or too much app-specific system prompt content. This 429 has no `retry-after` header and will not resolve by waiting (source: hermes-agent-issue-53212-billing-classifier-2026.md, anthropic-api-rate-limits-2026.md).

**Actual rate limit (has `retry-after` header).** The subscription's per-model rate limit (RPM, ITPM, or OTPM) was exceeded. The response includes `retry-after` and the full set of `anthropic-ratelimit-*` headers. Wait the indicated duration (source: anthropic-api-rate-limits-2026.md).

**Spend cap reached (no `retry-after` header).** The account's monthly spend cap was hit. The error includes `error_code: enforced_spend_limit_reached` in the `details` field and a message naming the reset date. Does not resolve until the next month or a tier upgrade (source: anthropic-api-rate-limits-2026.md).

**Degraded token state.** After crashes or repeated retries, the OAuth token can enter a degraded state causing persistent 429s even after per-minute limits reset. Fix: `claude logout && claude login` to get a fresh token bucket (source: codexbar-issue-575-oauth-429-2026.md).

**Bare "Error" message with no rate limit headers.** When the 429 message is simply "Error" with no `retry-after` or `anthropic-ratelimit-*` headers, this typically indicates billing misclassification or credential scope rejection rather than a true rate limit. The absence of rate limit headers means the request never reached the rate limiter; it was rejected at the billing/auth layer (source: hermes-agent-issue-53212-billing-classifier-2026.md, codexbar-issue-575-oauth-429-2026.md, anthropic-api-rate-limits-2026.md).

## Enforcement timeline

- **September 23, 2025.** First reports of `"This credential is only authorized for use with Claude Code and cannot be used for other API requests"` in the claude-code repo (issues #8046, #8052) (source: webcoda-anthropic-blocks-subscriptions-2026.md).
- **January 9, 2026.** Widespread enforcement across third-party tools (OpenCode, Clawdbot, Oh My OpenCode). No public announcement from Anthropic preceded the change (source: webcoda-anthropic-blocks-subscriptions-2026.md).
- **Post-January 2026.** Third-party use of subscription OAuth tokens is a Consumer Terms of Service violation. Tools that still work do so by sending the Claude Code identity block and beta headers, effectively impersonating Claude Code at the API level (source: webcoda-anthropic-blocks-subscriptions-2026.md, promptfoo-anthropic-provider-2026.md).

## Programmatic extraction and use

The opencode-claude-auth project demonstrates continuous token reuse: it reads credentials from the Keychain or `.credentials.json`, caches them in memory with a 30-second TTL, and refreshes proactively before expiry. On macOS it enumerates all `Claude Code-credentials*` Keychain entries for multi-account support (source: github-opencode-claude-auth-2025.md).

Promptfoo loads credentials automatically when `apiKeyRequired: false` is set on the provider config. It reads from the macOS Keychain or `.credentials.json`, sends the beta headers and identity block, and supports profile-specific keychain entries via `CLAUDE_CONFIG_DIR` (source: promptfoo-anthropic-provider-2026.md).

## Proxying through LiteLLM

LiteLLM can proxy OAuth token requests to Anthropic with `forward_client_headers_to_llm_api: true` in the config. The OAuth token passes through as `Authorization: Bearer`. LiteLLM adds its own `x-litellm-api-key` header for gateway tracking. Claude Code environment variables: `ANTHROPIC_BASE_URL=http://localhost:4000`, `ANTHROPIC_MODEL=anthropic-claude`, `ANTHROPIC_CUSTOM_HEADERS="x-litellm-api-key: Bearer sk-..."` (source: litellm-claude-code-max-subscription-2026.md).

## Caveats

- **ToS violation.** Using subscription OAuth tokens outside of Claude Code or Claude.ai is a Consumer Terms of Service violation as of January 2026 (source: webcoda-anthropic-blocks-subscriptions-2026.md).
- **Billing classifier fragility.** System prompt content over ~4000 chars of agent instructions can trigger billing misclassification, causing 429s even with correct headers and identity block (source: hermes-agent-issue-53212-billing-classifier-2026.md).
- **Rate limits.** Requests count against subscription rate limits (5-hour/weekly windows), not Console API limits.
- **8-hour expiry.** Access tokens expire after 8 hours. Automation must handle the refresh flow or use `claude setup-token` for a one-year token.
- **`setup-token` alternative.** `claude setup-token` generates a one-year token for `CLAUDE_CODE_OAUTH_TOKEN`. Officially supported for Claude Code and Agent SDK usage only (source: claude-code-authentication-2026.md).
- **Bare mode incompatibility.** `CLAUDE_CODE_OAUTH_TOKEN` does not work with `--bare` mode. Use `ANTHROPIC_API_KEY` or `apiKeyHelper` for bare mode (source: claude-code-authentication-2026.md).
- **Gateway incompatibility.** The `oauth-2025-04-20` beta flag is rejected by non-Anthropic endpoints (Vertex AI, Bedrock via LiteLLM). Filter it out when routing through gateways (source: claude-code-issue-13770-oauth-beta-header-2025.md).

## Related pages

[[claude-code-authentication]] | [[claude-code-oauth-flow]] | [[anthropic-api-rate-limits]]
