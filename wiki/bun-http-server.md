# Bun HTTP Server

[[bun|Bun]] provides a high-performance HTTP server through the `Bun.serve()` API (source: bun-docs-http-2026.md).

## Basic setup

A server is created by passing a configuration object with routes and a fallback fetch handler (source: bun-docs-http-2026.md):

```typescript
const server = Bun.serve({
  routes: {
    "/api/status": new Response("OK"),
    "/users/:id": req => new Response(`Hello User ${req.params.id}!`),
  },
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});
```

## Routing

The `routes` object supports static paths, dynamic parameters (`:id`), wildcards (`/api/*`), and HTTP-method-specific handlers (GET, POST, etc.). Routes can return `Response` objects directly, use `Bun.file()` for file serving, or issue redirects (source: bun-docs-http-2026.md).

## Port and hostname

The default port is 3000 and the default hostname is `0.0.0.0`. These can be set in the config object or overridden via environment variables `BUN_PORT`, `PORT`, or `NODE_PORT` (source: bun-docs-http-2026.md).

Unix domain sockets are supported via the `unix` option. On Linux, abstract namespace sockets are available by prefixing paths with null bytes (source: bun-docs-http-2026.md).

## HTTP/2 and HTTP/3

Experimental HTTP/2 is enabled with `http2: true` and requires TLS configuration. HTTP/3 over QUIC uses `http3: true` alongside TLS (source: bun-docs-http-2026.md).

## WebSocket

WebSocket support is configured through the `websocket` handler, which accepts options for message size limits, compression, ping/pong frames, and lifecycle callbacks: `open`, `message`, `close`, `ping`, and `pong` (source: bun-docs-http-2026.md).

## Idle timeout

The idle timeout defaults to 10 seconds, with a maximum value of 255. Setting it to 0 disables the timeout entirely (source: bun-docs-http-2026.md). Per-request timeouts can be set with `server.timeout(request, seconds)`, and setting 0 is appropriate for streaming responses (source: bun-docs-http-2026.md).

## Server lifecycle

`server.stop()` gracefully stops the server or force-closes connections. `server.closeIdleConnections()` drops keep-alive connections without stopping the server. `server.reload()` updates handlers without restarting. `server.ref()` and `server.unref()` control whether the server keeps the process alive (source: bun-docs-http-2026.md).

## Per-request APIs

`server.requestIP(request)` retrieves the client's IP address and port (source: bun-docs-http-2026.md).

## Metrics

Read-only properties track server activity: `pendingRequests`, `pendingWebSockets`, and `subscriberCount(topic)` for WebSocket pub/sub (source: bun-docs-http-2026.md).

## Performance

Benchmarks show Bun handling roughly 160,000 requests per second on Linux compared to Node.js at approximately 64,000 RPS, about 2.5x throughput (source: bun-docs-http-2026.md).

**Related pages:** [[bun]], [[bun-runtime]], [[bun-file-io]], [[bun-configuration]]
