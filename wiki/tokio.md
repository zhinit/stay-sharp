# Tokio

Tokio is an event-driven, non-blocking I/O platform for writing asynchronous applications in Rust. It provides a multithreaded, work-stealing task scheduler, a reactor backed by OS event queues (epoll, kqueue, IOCP), and asynchronous TCP/UDP sockets (source: tokio-readme-2026.md). Current version is 1.53.1 (source: tokio-readme-2026.md).

## When to use Tokio

Tokio is the most widely used async runtime, surpassing all other Rust runtimes in usage combined. It provides building blocks for writing networking applications, and handling many concurrent connections is cheap due to async/await scalability (source: tokio-tutorial-2026.md).

Do not use Tokio for CPU-bound parallel computations (use Rayon), reading many files (OS lacks async file APIs), or sending a single web request where blocking is fine (source: tokio-tutorial-2026.md).

## Runtime and `#[tokio::main]`

The `#[tokio::main]` macro transforms an `async fn main()` into synchronous code that initializes the runtime and calls `block_on`. It is equivalent to manually constructing `tokio::runtime::Runtime::new().unwrap()` and calling `rt.block_on(async { ... })` (source: tokio-hello-2026.md).

```rust
#[tokio::main]
async fn main() -> Result<()> {
    // async code here
}
```

The runtime provides three capabilities: task management via `tokio::task`, I/O operations for TCP/UDP/filesystem/process/signal, and an executor with task scheduling and timers (source: tokio-api-docs-2026.md).

## Spawning tasks

`tokio::spawn` creates asynchronous green threads. Each task requires a single allocation and 64 bytes of memory. It returns a `JoinHandle` that can be awaited (source: tokio-spawning-2026.md).

```rust
tokio::spawn(async move {
    process(socket).await;
});
```

Two constraints on spawned tasks:

**`'static` bound**: The spawned future must not contain references to data owned outside the task. Use `move` to transfer ownership into the closure (source: tokio-spawning-2026.md).

**`Send` bound**: Data held across `.await` points must be `Send` because the runtime may move the task between threads. Types like `Rc` cannot be held across `.await` points, but can be used and dropped before an `.await` (source: tokio-spawning-2026.md).

## Channels

Tokio provides four channel types in `tokio::sync` (source: tokio-channels-2026.md):

**mpsc** (`tokio::sync::mpsc`): Multiple producers, single consumer. Created with a capacity: `let (tx, mut rx) = mpsc::channel(32)`. Senders can be cloned; receivers cannot. The common pattern is spawning a dedicated manager task that owns a resource and receives commands through the channel (source: tokio-channels-2026.md).

**oneshot** (`tokio::sync::oneshot`): Sends a single value. Calling `send` completes immediately without `.await`. Used for returning responses from a manager task by embedding a `oneshot::Sender` in each command message (source: tokio-channels-2026.md).

**broadcast** (`tokio::sync::broadcast`): All receivers see every message (source: tokio-channels-2026.md).

**watch** (`tokio::sync::watch`): Only the most recent value is retained (source: tokio-channels-2026.md).

## `select!` macro

`tokio::select!` waits on multiple async computations concurrently and returns when the first one completes. It supports up to 64 branches (source: tokio-select-2026.md).

```rust
tokio::select! {
    val = rx1 => { println!("rx1 completed: {:?}", val); }
    val = rx2 => { println!("rx2 completed: {:?}", val); }
}
```

When a branch completes, the other branches are dropped and their futures cancelled. Futures are lazy, so dropping stops polling and cancels the operation (source: tokio-select-2026.md).

Unlike `tokio::spawn`, `select!` runs all branches on the same task. Data does not need to be `Send` (source: tokio-select-2026.md).

Branches support `if` guards as preconditions and an `else` branch for when no patterns match. `select!` is commonly used in loops with `tokio::pin!()` to resume operations across iterations (source: tokio-select-2026.md).

## Async I/O

Tokio provides `AsyncRead` and `AsyncWrite` [[rust-async|traits]] implemented by `TcpStream`, `File`, and `Stdout`. In practice, use the extension traits `AsyncReadExt` and `AsyncWriteExt` for utility methods (source: tokio-io-2026.md).

Core methods: `read()` reads into a buffer and returns bytes read (`Ok(0)` means stream closed), `read_to_end()` reads all bytes until EOF, `write()` writes a buffer, `write_all()` writes the entire buffer (source: tokio-io-2026.md).

`TcpStream::split()` separates a socket into reader and writer handles for simultaneous operations. `tokio::io::copy()` transfers all data from a reader to a writer (source: tokio-io-2026.md).

Heap-allocated buffers (`Vec<u8>`) are preferred over stack arrays for data persisting across `.await` points, because stack data in tasks increases the task structure size (source: tokio-io-2026.md).

## Key modules

| Module | Purpose |
|--------|---------|
| `tokio::sync` | Channels, Mutex, Barrier (source: tokio-api-docs-2026.md) |
| `tokio::time` | Timeouts, sleep, interval (source: tokio-api-docs-2026.md) |
| `tokio::net` | Non-blocking TCP, UDP, Unix sockets (source: tokio-api-docs-2026.md) |
| `tokio::fs` | Async filesystem operations (source: tokio-api-docs-2026.md) |
| `tokio::process` | Child process spawning (source: tokio-api-docs-2026.md) |
| `tokio::signal` | OS signal handling (source: tokio-api-docs-2026.md) |
| `tokio::task` | Task spawning and utilities (source: tokio-api-docs-2026.md) |
| `tokio::io` | AsyncRead, AsyncWrite traits (source: tokio-api-docs-2026.md) |

## Feature flags

Tokio uses modular feature flags to minimize compile time and binary size (source: tokio-api-docs-2026.md):

- `full` enables all public APIs
- `rt` enables the runtime (required for `tokio::spawn`)
- `rt-multi-thread` enables the multi-threaded scheduler
- `io-util` enables `AsyncReadExt`/`AsyncWriteExt`
- `io-std` enables stdin/stdout/stderr
- `net` enables TCP, UDP, Unix sockets
- `time` enables sleep, interval, timeout
- `process` enables process spawning
- `signal` enables signal handling
- `sync` enables channels, Mutex
- `fs` enables filesystem operations
- `macros` enables `#[tokio::main]` and `#[tokio::test]`

For applications, `features = ["full"]` is typical. Library authors should enable only what they need (source: tokio-hello-2026.md).

## Backpressure

Tokio prevents implicit queuing through lazy evaluation. Operations do not run without `.await`. Bounded channel capacities (e.g., `mpsc::channel(32)`) enforce backpressure. Developers must explicitly introduce concurrency while maintaining bounded limits (source: tokio-channels-2026.md).

## Platform support

Guaranteed: Linux, Windows, Android (API 21+), macOS, iOS, FreeBSD. Limited WebAssembly support exists (source: tokio-api-docs-2026.md).

## Related projects

axum (web framework), hyper (HTTP), tonic (gRPC), tower (middleware), tracing (diagnostics), mio (low-level I/O), bytes (byte buffers) (source: tokio-readme-2026.md).

## Related pages

- [[rust-async]]
- [[reqwest]]
- [[crossterm]]
