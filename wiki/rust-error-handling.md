# Rust Error Handling

Rust groups errors into two categories: unrecoverable (handled with `panic!`) and recoverable (handled with `Result`). There are no exceptions. (source: rust-book-ch09-01-unrecoverable-errors-with-panic.md)

## panic! and Unrecoverable Errors

The `panic!` macro stops the program immediately. It prints a failure message, unwinds the stack, cleans up, and exits. Two ways to trigger a panic: call `panic!` directly, or perform an operation that panics (like out-of-bounds array access). (source: rust-book-ch09-01-unrecoverable-errors-with-panic.md)

Setting `RUST_BACKTRACE=1` displays the call stack when a panic occurs. Debug symbols (enabled by default in dev builds) are required for meaningful backtraces. (source: rust-book-ch09-01-unrecoverable-errors-with-panic.md)

### Unwinding vs Aborting

By default, panic unwinds the stack: Rust walks back up, cleaning up data from each function. This costs binary size. The alternative is aborting, which ends the program immediately and lets the OS clean up memory. To abort on panic in release mode, add `panic = 'abort'` to `[profile.release]` in Cargo.toml. (source: rust-book-ch09-01-unrecoverable-errors-with-panic.md)

## Result

The `Result<T, E>` enum has two variants: `Ok(T)` for success and `Err(E)` for failure. It is in the prelude, so `Ok` and `Err` can be used without qualification. (source: rust-book-ch09-02-recoverable-errors-with-result.md)

Handle a `Result` with [[rust-pattern-matching|match]]:

```rust
let file = match File::open("hello.txt") {
    Ok(file) => file,
    Err(error) => panic!("Problem opening: {error:?}"),
};
```

For finer control, match on error kinds via `error.kind()`. The `io::ErrorKind` enum has variants like `NotFound`, `PermissionDenied`, etc. (source: rust-book-ch09-02-recoverable-errors-with-result.md)

## unwrap and expect

`unwrap()` returns the value inside `Ok` or calls `panic!` on `Err`. `expect("msg")` does the same but uses the given message in the panic output. Production code prefers `expect` over `unwrap` because it provides context for debugging. (source: rust-book-ch09-02-recoverable-errors-with-result.md)

## The ? Operator

The `?` operator placed after a `Result` value returns the inner value from `Ok` or returns `Err` from the enclosing function. It replaces verbose `match` blocks for error propagation. (source: rust-book-ch09-02-recoverable-errors-with-result.md)

```rust
fn read_username() -> Result<String, io::Error> {
    let mut username = String::new();
    File::open("hello.txt")?.read_to_string(&mut username)?;
    Ok(username)
}
```

The `?` operator also works on `Option<T>`: returns `None` early if the value is `None`, otherwise unwraps the `Some`. You cannot mix `?` on `Result` and `Option` in the same function without explicit conversion (use `.ok()` or `.ok_or()`). (source: rust-book-ch09-02-recoverable-errors-with-result.md)

### From Trait and Error Conversion

The `?` operator calls `From::from()` on the error value, converting it to the error type in the function's return type. If you define `impl From<io::Error> for OurError`, then `?` handles the conversion automatically. This allows a function to return a single error type while calling functions that produce different error types. (source: rust-book-ch09-02-recoverable-errors-with-result.md)

### Using ? in main

`main` can return `Result<(), Box<dyn Error>>`, enabling `?` throughout the program's entry point. A `main` returning `Ok(())` exits with code 0, and `Err` exits with a nonzero code. (source: rust-book-ch09-02-recoverable-errors-with-result.md)

## When to panic vs return Result

Returning `Result` is the default choice for functions that might fail. It gives callers the option to recover or propagate. (source: rust-book-ch09-03-to-panic-or-not-to-panic.md)

Use `panic!` (or `unwrap`/`expect`) when:
- Writing examples, prototypes, or tests. In tests, `unwrap`/`expect` correctly marks a failure. (source: rust-book-ch09-03-to-panic-or-not-to-panic.md)
- You have more information than the compiler (e.g. parsing a hardcoded string that is always valid). Use `expect` with a message explaining the assumption. (source: rust-book-ch09-03-to-panic-or-not-to-panic.md)
- A broken invariant, contract, or guarantee has been violated and continuing would be unsafe or nonsensical. Contract violations are caller-side bugs, not something the callee should recover from. (source: rust-book-ch09-03-to-panic-or-not-to-panic.md)

Return `Result` when failure is expected: malformed input, rate-limited HTTP responses, missing files. (source: rust-book-ch09-03-to-panic-or-not-to-panic.md)

## Custom Types for Validation

Instead of repeating runtime checks, create a type whose constructor enforces invariants. A `Guess` struct with a `new(value: i32)` function that panics if the value is out of range ensures all `Guess` instances are valid by construction. The inner field is kept private, with a getter method, so external code cannot bypass validation. (source: rust-book-ch09-03-to-panic-or-not-to-panic.md)

## Related pages

- [[rust-type-system]]
- [[rust-pattern-matching]]
- [[rust-collections]]
