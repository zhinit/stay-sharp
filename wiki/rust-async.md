# Rust Async

## Futures and async/await

A future is a value that may not be ready yet but will become ready at some point. Rust provides the `Future` trait as a common interface for async operations (source: rust-book-ch17-01-futures-and-syntax.md). The `async` keyword marks blocks and functions as interruptible and resumable. Within async code, the `await` keyword waits for a future to resolve (source: rust-book-ch17-01-futures-and-syntax.md).

Rust's `await` is a postfix keyword: `response.text().await`, not `await response.text()`. This makes method chaining natural (source: rust-book-ch17-01-futures-and-syntax.md).

Futures in Rust are lazy. They do nothing until polled via `await`. The compiler warns if a future is created but never awaited (source: rust-book-ch17-01-futures-and-syntax.md).

An `async fn` compiles to a regular function that returns `impl Future<Output = T>`. An `async` block compiles to an anonymous type implementing `Future`. Rust generates a state machine for each async block, with each `await` point as a state transition (source: rust-book-ch17-01-futures-and-syntax.md).

## Runtimes

Async code requires a runtime (executor) to poll futures. Rust does not bundle one. The program's `main` function cannot be `async` because nothing would manage its state machine. Instead, `main` initializes a runtime that runs the top-level future to completion (source: rust-book-ch17-01-futures-and-syntax.md).

Runtime crates like [[tokio]] provide a `block_on` function (or the `#[tokio::main]` macro) to bridge sync and async worlds. Different runtimes make different tradeoffs for web servers, embedded systems, etc. (source: rust-book-ch17-01-futures-and-syntax.md).

## Concurrency with async

`spawn_task` creates a new async task, analogous to `thread::spawn`. The task handle is itself a future that can be awaited to join it (source: rust-book-ch17-02-concurrency-with-async.md).

Tasks do not require OS threads. Async blocks can be composed with `join` to run concurrently on a single thread:
- `trpl::join(fut1, fut2)` runs two futures concurrently and returns both results. It is fair, checking each future equally often (source: rust-book-ch17-02-concurrency-with-async.md).
- `join!` macro handles an arbitrary (compile-time known) number of futures (source: rust-book-ch17-02-concurrency-with-async.md).
- `select` races futures, returning whichever finishes first via an `Either` type with `Left`/`Right` variants (source: rust-book-ch17-01-futures-and-syntax.md).

## Message passing

Async channels work like `std::mpsc` but with async `recv`. The receiver's `recv` method returns a future instead of blocking. Use `while let Some(msg) = rx.recv().await` to process messages until the channel closes (source: rust-book-ch17-02-concurrency-with-async.md).

Code within a single async block runs linearly. To get true concurrency, put the sender and receiver in separate async blocks and join them (source: rust-book-ch17-02-concurrency-with-async.md).

Use `async move` blocks to transfer ownership of values (like a channel sender) into the block. This ensures the sender drops when the block finishes, which closes the channel and lets the receiver's `while let` loop terminate (source: rust-book-ch17-02-concurrency-with-async.md).

## Yielding control

Rust only yields at `await` points. Everything between `await` points runs synchronously. A future doing expensive computation without yielding will starve other futures (source: rust-book-ch17-03-more-futures.md).

`yield_now().await` explicitly hands control to the runtime without sleeping. This enables cooperative multitasking for compute-bound work, though yielding too often adds overhead (source: rust-book-ch17-03-more-futures.md).

## Building abstractions

Futures compose. A `timeout` function can be built by racing a user future against a `sleep` future using `select`, returning `Ok(output)` or `Err(duration)` (source: rust-book-ch17-03-more-futures.md).

## Streams

A stream is an asynchronous iterator. The `Stream` trait combines `Future` and `Iterator`: its `poll_next` method returns `Poll<Option<Self::Item>>` (source: rust-book-ch17-05-traits-for-async.md).

In practice, use `StreamExt` (from the `futures` crate) which provides a `next` method that can be awaited. Import `StreamExt` to call `.next().await` on streams. `stream_from_iter` converts any iterator into a stream (source: rust-book-ch17-04-streams.md).

`StreamExt` also provides utility methods similar to `Iterator` (map, filter, etc.) and is automatically implemented for all `Stream` types (source: rust-book-ch17-05-traits-for-async.md).

## The Future trait

```rust
pub trait Future {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

`Poll::Ready(T)` means the future is done. `Poll::Pending` means check again later. The `Context` parameter lets the runtime know when to re-poll. The `self: Pin<&mut Self>` receiver ensures self-referential futures are not moved in memory (source: rust-book-ch17-05-traits-for-async.md).

## Pin and Unpin

Async state machines can contain self-references between await points. Moving such a value in memory would invalidate those internal references. `Pin<P>` wraps a pointer and guarantees the pointed-to value will not move (source: rust-book-ch17-05-traits-for-async.md).

`Unpin` is a marker trait. Types that implement `Unpin` are safe to move even when pinned. Most types (numbers, String, Vec) auto-implement `Unpin`. Compiler-generated futures from async blocks are `!Unpin` because they may be self-referential (source: rust-book-ch17-05-traits-for-async.md).

When collecting futures into a `Vec` for `join_all`, use `Box::pin(future)` to pin each one. Directly awaiting a future with `.await` pins it implicitly (source: rust-book-ch17-05-traits-for-async.md).

## Tasks vs threads

Threads are OS-managed, tasks are runtime-managed. Tasks are lightweight and can be moved between threads by the runtime (work stealing). Rules of thumb (source: rust-book-ch17-06-futures-tasks-threads.md):
- CPU-bound (parallelizable) work: use threads
- I/O-bound (concurrent) work: use async
- Both: combine them freely

Threads and async channels can interoperate. Spawn a thread for blocking work, send results through an async channel, and process them in an async block (source: rust-book-ch17-06-futures-tasks-threads.md).

## Related pages

- [[tokio]]
- [[rust-error-handling]]
- [[rust-ownership]]
