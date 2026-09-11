# Anthropic API Rate Limits

The Anthropic Messages API enforces rate limits at the organization level using a token bucket algorithm. Limits are set by usage tier (Start, Build, Scale, Custom) and apply per model class. Organizations advance tiers based on usage history and account standing (source: anthropic-api-rate-limits-2026.md).

## Limit types

Three rate limit dimensions, all per-minute (source: anthropic-api-rate-limits-2026.md):

- **RPM** (requests per minute)
- **ITPM** (input tokens per minute) -- only uncached input tokens and cache-creation tokens count. Cache-read tokens do not count (except on Claude Haiku 3.5). This makes prompt caching an effective throughput multiplier.
- **OTPM** (output tokens per minute) -- evaluated in real time as tokens are produced. The `max_tokens` parameter does not factor in.

Exceeding any of the three returns a 429 with a description of which limit was hit and a `retry-after` header (source: anthropic-api-rate-limits-2026.md).

## Spend limits

Each tier carries a monthly spend cap: Start $500, Build $1,000, Scale $200,000, Custom uncapped. Organizations can also set their own lower spend limits per workspace. Reaching the tier cap returns a 429 with **no** `retry-after` header and a message naming the reset date. The error includes `error_code: enforced_spend_limit_reached` in `error.details` (source: anthropic-api-rate-limits-2026.md).

Reaching a self-set spend limit returns a 400 `invalid_request_error`, not a 429 (source: anthropic-api-rate-limits-2026.md). Exception: limits on the Claude Code workspace can return a 429 with a `retry-after` header instead (source: anthropic-api-rate-limits-2026.md).

## Response headers

Every API response includes rate limit headers. On a 429, these show which limit was hit (source: anthropic-api-rate-limits-2026.md):

| Header | Description |
|---|---|
| `retry-after` | Seconds to wait before retrying. Absent on spend-cap 429s. |
| `anthropic-ratelimit-requests-limit` | Max RPM in current period |
| `anthropic-ratelimit-requests-remaining` | RPM remaining |
| `anthropic-ratelimit-requests-reset` | RFC 3339 time when RPM fully replenishes |
| `anthropic-ratelimit-tokens-limit` | Max tokens (most restrictive of input/output) |
| `anthropic-ratelimit-tokens-remaining` | Tokens remaining (rounded to nearest 1000) |
| `anthropic-ratelimit-tokens-reset` | RFC 3339 time when token limit replenishes |
| `anthropic-ratelimit-input-tokens-limit` | Max ITPM |
| `anthropic-ratelimit-input-tokens-remaining` | ITPM remaining |
| `anthropic-ratelimit-input-tokens-reset` | RFC 3339 ITPM reset time |
| `anthropic-ratelimit-output-tokens-limit` | Max OTPM |
| `anthropic-ratelimit-output-tokens-remaining` | OTPM remaining |
| `anthropic-ratelimit-output-tokens-reset` | RFC 3339 OTPM reset time |

The `anthropic-ratelimit-tokens-*` headers display values for the most restrictive limit currently in effect (e.g. workspace limit if that is tighter than org limit) (source: anthropic-api-rate-limits-2026.md).

## 429 error variants

Not all 429s mean the same thing (source: anthropic-api-rate-limits-2026.md, anthropic-api-errors-2026.md):

**Rate limit exceeded.** Standard rate limit hit on RPM, ITPM, or OTPM. Includes `retry-after` header and all `anthropic-ratelimit-*` headers. Wait the indicated duration (source: anthropic-api-rate-limits-2026.md).

**Tier spend cap reached.** The organization crossed its monthly spend threshold. The 429 has `error.details.error_code: enforced_spend_limit_reached`, **no** `retry-after` header, and fails until access resumes on the first of the next month or a tier upgrade. The SDKs' automatic retries will not help (source: anthropic-api-rate-limits-2026.md).

**Acceleration limit.** A sharp increase in usage can trigger 429s even below the stated limits. Ramp traffic gradually to avoid this (source: anthropic-api-rate-limits-2026.md).

**Subscription billing misclassification.** OAuth token requests routed to the wrong billing lane. Returns a 429 with a "monthly spend limit" message even though subscription tokens use 5-hour/weekly rate windows. No `retry-after` header. Caused by missing Claude Code identity block or excess system prompt content. See [[claude-code-token-api-reuse]] for details (source: hermes-agent-issue-53212-billing-classifier-2026.md).

## Error response format

All errors follow this JSON shape (source: anthropic-api-errors-2026.md):

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "Description of which limit was exceeded."
  },
  "request_id": "req_018EeWyXxfu5pfWkrYcMdjWG"
}
```

The spend-cap variant adds a `details` field:

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "You have reached your API usage limits: your organization has crossed its monthly API usage threshold...",
    "details": { "error_code": "enforced_spend_limit_reached" }
  },
  "request_id": "req_018EeWyXxfu5pfWkrYcMdjWG"
}
```

(source: anthropic-api-rate-limits-2026.md)

## SDK retry behavior

The official SDKs automatically retry transient failures (connection errors, rate limits, 5xx) with exponential backoff, twice by default, honoring `retry-after` when present. Each client accepts a max-retries option. Spend-cap 429s are not retryable (source: anthropic-api-errors-2026.md).

## Other HTTP errors relevant to auth

| Code | Type | Meaning |
|---|---|---|
| 400 | `invalid_request_error` | Bad request format, or self-set spend limit reached |
| 401 | `authentication_error` | API key malformed, revoked, or expired |
| 402 | `billing_error` | Payment issue |
| 403 | `permission_error` | API key lacks permission for the resource |
| 529 | `overloaded_error` | API temporarily overloaded (distinct from 429) |

(source: anthropic-api-errors-2026.md)

## Related pages

[[claude-code-token-api-reuse]] | [[claude-code-authentication]]
