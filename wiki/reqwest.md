# Reqwest

Reqwest is an ergonomic, batteries-included HTTP client for Rust. It provides both async and blocking clients with support for JSON, form data, multipart uploads, proxies, TLS, cookies, and configurable redirect policies (source: reqwest-readme-2026.md). Current version is 0.13.4 (source: reqwest-api-docs-2026.md).

## Async client

The default client is async and requires a [[tokio]] runtime. For one-off requests, `reqwest::get()` is a convenience function (source: reqwest-api-docs-2026.md):

```rust
let body = reqwest::get("https://www.rust-lang.org")
    .await?
    .text()
    .await?;
```

For multiple requests, create and reuse a `Client`. This shares connection pools and configuration across requests (source: reqwest-api-docs-2026.md):

```rust
let client = reqwest::Client::new();
```

## Making requests

`Client` provides methods for each HTTP verb. Each returns a `RequestBuilder` that is finalized with `.send().await` (source: reqwest-api-docs-2026.md).

**POST with plain body**:
```rust
let res = client.post("http://httpbin.org/post")
    .body("the exact body that is sent")
    .send()
    .await?;
```

**POST with form data**:
```rust
let params = [("foo", "bar"), ("baz", "quux")];
let res = client.post("http://httpbin.org/post")
    .form(&params)
    .send()
    .await?;
```

**POST with JSON** (requires `json` feature):
```rust
let mut map = HashMap::new();
map.insert("lang", "rust");
let res = client.post("http://httpbin.org/post")
    .json(&map)
    .send()
    .await?;
```

(source: reqwest-api-docs-2026.md)

## Response handling

The `Response` type provides methods to extract the body in various formats (source: reqwest-api-docs-2026.md):

- `.text().await?` returns the body as a `String`
- `.json::<T>().await?` deserializes JSON into type `T` (requires `json` feature, uses [[serde]])
- `.bytes().await?` returns raw bytes
- `.status()` returns the HTTP status code

## Blocking client

The `reqwest::blocking` module provides a synchronous client that blocks the current thread. It mirrors the async API with the same types: `Client`, `ClientBuilder`, `Request`, `RequestBuilder`, `Response`, `Body` (source: reqwest-blocking-docs-2026.md).

The blocking client must not be called within an async runtime or it will panic. For async contexts, use the async client or wrap blocking calls with `tokio::task::spawn_blocking` (source: reqwest-blocking-docs-2026.md).

## Configuration

`ClientBuilder` configures the client before construction (source: reqwest-api-docs-2026.md):

**Redirect policy**: Default allows up to 10 hops. Customizable via `redirect::Policy`.

**Cookies**: Enabled with `ClientBuilder::cookie_store()` (requires `cookies` feature).

**Proxies**: System proxies are enabled by default via environment variables: `HTTP_PROXY`/`http_proxy`, `HTTPS_PROXY`/`https_proxy`, `ALL_PROXY`/`all_proxy`. Specific proxy variables override general ones.

**TLS**: Uses rustls by default. Enable `native-tls` feature to use the OS TLS framework (Windows/macOS), or `native-tls-vendored` to compile OpenSSL on Linux (source: reqwest-readme-2026.md).

## Feature flags

(source: reqwest-api-docs-2026.md)

| Category | Features |
|----------|----------|
| Compression | `gzip`, `brotli`, `zstd`, `deflate` |
| Serialization | `json`, `form`, `query`, `multipart` |
| Protocols | `http2` (default enabled) |
| TLS | `default-tls` (enabled), `rustls`, `native-tls` variants |
| Other | `blocking`, `cookies`, `socks`, `hickory-dns`, `system-proxy` (default) |

Unstable: `http3` requires `RUSTFLAGS="--cfg reqwest_unstable"` (source: reqwest-api-docs-2026.md).

## Key types

| Type | Purpose |
|------|---------|
| `Client` | Async HTTP client (source: reqwest-api-docs-2026.md) |
| `ClientBuilder` | Configurable client constructor (source: reqwest-api-docs-2026.md) |
| `Request` | Executable request object (source: reqwest-api-docs-2026.md) |
| `RequestBuilder` | Request configuration builder (source: reqwest-api-docs-2026.md) |
| `Response` | Server response container (source: reqwest-api-docs-2026.md) |
| `Body` | Async request body (source: reqwest-api-docs-2026.md) |
| `Error` | Error type for operations (source: reqwest-api-docs-2026.md) |

## WebAssembly

The WASM implementation activates automatically for `wasm32` targets. TLS, cookies, and blocking APIs are unavailable (handled by the browser). `ClientBuilder` configuration is limited (source: reqwest-api-docs-2026.md).

## Cargo.toml example

```toml
[dependencies]
reqwest = { version = "0.13", features = ["json"] }
tokio = { version = "1", features = ["full"] }
```

(source: reqwest-readme-2026.md)

## Related pages

- [[tokio]]
- [[serde]]
- [[serde-json]]
- [[rust-error-handling]]
