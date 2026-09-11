# Claude Agent SDK Runtime

Runtime costs and deployment constraints of the TypeScript Agent SDK: package size, the bundled CLI binary, subprocess startup latency, Bun compatibility, and `bun build --compile` behavior.

## Package size

The core package (`@anthropic-ai/claude-agent-sdk`) is ~5 MB unpacked. It contains the JS wrapper (`sdk.mjs`), type definitions, the `extractFromBunfs` helper, and a browser SDK entry point. It has zero runtime `dependencies` and three `peerDependencies`: `zod ^4.0.0`, `@anthropic-ai/sdk >=0.93.0`, `@modelcontextprotocol/sdk ^1.29.0` (source: claude-agent-sdk-issue-329-binary-size-serverless-2026.md).

Platform-specific native binaries are delivered via `optionalDependencies`. npm/pnpm install only the one matching the host platform (via `os`/`cpu`/`libc` fields). Eight variants exist (source: claude-agent-sdk-issue-329-binary-size-serverless-2026.md):

| Package | Unpacked size |
|---|---|
| `claude-agent-sdk-darwin-arm64` | ~193 MB |
| `claude-agent-sdk-darwin-x64` | ~201 MB |
| `claude-agent-sdk-linux-x64` | ~209 MB |
| `claude-agent-sdk-linux-arm64` | ~208 MB |
| `claude-agent-sdk-linux-x64-musl` | ~203 MB |
| `claude-agent-sdk-linux-arm64-musl` | ~208 MB |
| `claude-agent-sdk-win32-x64` | ~211 MB |
| `claude-agent-sdk-win32-arm64` | ~211 MB |

Total install footprint on any one platform: ~205 MB (source: claude-agent-sdk-issue-329-binary-size-serverless-2026.md).

Before v0.2.110 (April 2026), the CLI shipped as a ~13 MB JS bundle (`cli.js`). The ~17x growth is the embedded Bun runtime inside the native binary (source: claude-agent-sdk-issue-34-query-overhead-2025.md).

### Yarn 1.x pitfall

Yarn 1 does not honor npm's `libc` field. On Linux, both glibc and musl packages install, roughly doubling the footprint to ~410 MB (source: claude-agent-sdk-issue-329-binary-size-serverless-2026.md).

## Bundled CLI binary

Each platform package contains a native Claude Code CLI binary compiled with Bun's single-executable builder. It includes a native Rust streaming component embedded via `Bun.embeddedFiles` that provides the faster token output used by "fast mode" (Opus 4.6 with faster output). The SDK's JS layer spawns this binary as a subprocess and communicates over stdio JSON-lines (source: claude-agent-sdk-hosting-2026.md, buildwithaws-claude-agent-sdk-architecture-2026.md).

SDK version numbers track CLI versions: e.g., SDK v0.3.191 bundles Claude Code v2.1.191. Updating the SDK is how you update the CLI (source: claude-agent-sdk-hosting-2026.md).

The binary path is resolved via `require.resolve()` against the platform-specific optional dependency. It can be overridden with `options.pathToClaudeCodeExecutable` (source: claude-agent-sdk-ts-reference-2026.md).

## Subprocess startup latency

Every `query()` call spawns a fresh CLI subprocess. There is no hot process reuse between calls. One agent session = one subprocess with its own process tree and transcript file (source: claude-agent-sdk-hosting-2026.md).

### Cold start (no pre-warming)

~12s overhead per `query()` call. Benchmarked on Node.js (source: claude-agent-sdk-issue-34-query-overhead-2025.md):

| Call | Duration |
|---|---|
| Query 1 | 13.41s |
| Query 2 | 12.44s |
| Query 3 | 11.80s |

For comparison, the direct Anthropic Messages API returns in 1-3s (source: claude-agent-sdk-issue-34-query-overhead-2025.md).

### Pre-warming with `startup()`

Available since v0.2.89. Spawns the subprocess and completes the initialize handshake before a prompt is available. Subsequent `.query()` calls on the warm handle write directly to a ready process with no subprocess startup latency (source: claude-agent-sdk-ts-reference-2026.md).

```typescript
import { startup } from "@anthropic-ai/claude-agent-sdk";

const warm = await startup({ options: { maxTurns: 3 } });
// Later, near-instant:
for await (const msg of warm.query("prompt")) { ... }
```

Default `initializeTimeoutMs`: 60,000ms (source: claude-agent-sdk-ts-reference-2026.md).

### Serverless cold starts

First request after a cold deploy (image pull + tool init + subprocess cold start): 40-70s. Subsequent requests: sub-10s (source: claude-agent-sdk-hosting-2026.md).

### Resource baseline

1 GiB RAM, 5 GiB disk, 1 CPU per agent as a starting point. Memory grows with session length and tool activity. Concurrent agents = concurrent subprocesses, each with its own process tree (source: claude-agent-sdk-hosting-2026.md).

## Bun compatibility

### Running under Bun (not compiled)

The SDK works under `bun run`. The `executable` option auto-detects the runtime (`'bun'` / `'node'` / `'deno'`) (source: claude-agent-sdk-ts-reference-2026.md).

Known issues:

- **Wrong binary on Linux**: Bun installs all `optionalDependencies` regardless of `os`/`cpu`/`libc` filters. The SDK checks for the musl variant first on Linux. On glibc systems, this causes it to pick the wrong binary. Workaround: set `pathToClaudeCodeExecutable` explicitly (source: claude-agent-sdk-issue-266-bun-not-defined-2026.md).
- **Fast mode unavailable under Node.js**: Fast mode requires the native Bun binary with `Bun.embeddedFiles`. When the SDK spawns the CLI under Node.js, fast mode silently degrades to standard Opus 4.6 with a stderr warning. No exception thrown (source: claude-agent-sdk-issue-216-fast-mode-bun-2026.md).
- **`Bun is not defined` crash**: Some code paths in the CLI reference Bun globals (`Bun.which(...)`) without `typeof` guards. Under Node.js, these paths crash with `ReferenceError: Bun is not defined`. The native binary packages (v0.2.110+) embed their own Bun runtime, so this primarily affects older JS bundle versions (source: claude-agent-sdk-issue-266-bun-not-defined-2026.md).

## `bun build --compile`

Does not work out of the box. `import.meta.url` resolves to `/$bunfs/root/...` (Bun's virtual filesystem inside compiled executables), and `require.resolve()` fails there. Error: `Native CLI binary for <platform>-<arch> not found` (source: claude-agent-sdk-issue-150-bun-compile-2026.md, claude-agent-sdk-troubleshooting-2026.md).

### Official workaround (v0.3.144+)

Import the platform binary as a file asset with `{ type: "file" }`, use `extractFromBunfs()` to copy it from the virtual FS to a real temp directory at startup, and pass the result as `pathToClaudeCodeExecutable` (source: claude-agent-sdk-ts-reference-2026.md):

```typescript
import binPath from "@anthropic-ai/claude-agent-sdk-darwin-arm64/claude"
  with { type: "file" };
import { extractFromBunfs } from "@anthropic-ai/claude-agent-sdk/extract";
import { query } from "@anthropic-ai/claude-agent-sdk";

const cliPath = extractFromBunfs(binPath);

for await (const message of query({
  prompt: "Hello",
  options: { pathToClaudeCodeExecutable: cliPath },
})) {
  console.log(message);
}
```

Outside a compiled executable, `extractFromBunfs()` returns the input path unchanged (source: claude-agent-sdk-ts-reference-2026.md).

Match the platform package import to the `--target` flag of `bun build`. Windows: import from the `claude.exe` subpath (source: claude-agent-sdk-ts-reference-2026.md).

### Size implication

The ~193-211 MB platform binary gets embedded into the `$bunfs` virtual filesystem inside the compiled executable. Combined with Bun's own runtime, the resulting standalone binary will be 300+ MB (source: claude-agent-sdk-issue-150-bun-compile-2026.md).

The CLI binary must also be extracted to real disk at runtime before it can be spawned as a subprocess. The `extractFromBunfs()` helper writes it to a per-user temp directory (source: claude-agent-sdk-ts-reference-2026.md).

## Serverless deployment blocker

The ~200+ MB per-platform binary makes serverless deployment impractical (source: claude-agent-sdk-issue-329-binary-size-serverless-2026.md):

| Platform | Size limit |
|---|---|
| Vercel function | 250 MB |
| AWS Lambda (unzipped layer) | 250 MB |

The binary alone nearly exhausts these limits before application code is added. No JS-only or "lite" sub-export exists as of September 2026 (source: claude-agent-sdk-issue-329-binary-size-serverless-2026.md, issue open).

## Related pages

[[claude-agent-sdk]] | [[bun-bundler]] | [[bun]]
