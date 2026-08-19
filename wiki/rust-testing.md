# Rust Testing

## Writing tests

A test is a function annotated with `#[test]`. Run all tests with `cargo test`. Rust builds a test runner binary that executes annotated functions and reports pass/fail (source: rust-book-ch11-01-writing-tests.md).

Tests fail when they panic. Each test runs in its own thread; if the thread dies, the test is marked failed (source: rust-book-ch11-01-writing-tests.md).

## Assertion macros

`assert!(expr)` passes if `expr` is true, panics otherwise. Only reports that the condition was false, not the values involved (source: rust-book-ch11-01-writing-tests.md).

`assert_eq!(left, right)` and `assert_ne!(left, right)` test equality/inequality and print both values on failure. The compared types must implement `PartialEq` and `Debug`. For custom types, derive both: `#[derive(PartialEq, Debug)]` (source: rust-book-ch11-01-writing-tests.md).

All three macros accept optional format arguments after the required parameters for custom failure messages: `assert!(result.contains("Carol"), "Greeting did not contain name, value was `{result}`")` (source: rust-book-ch11-01-writing-tests.md).

## should_panic

The `#[should_panic]` attribute marks a test that is expected to panic. The test passes if the code panics, fails if it does not (source: rust-book-ch11-01-writing-tests.md).

Add `expected = "substring"` for precision: `#[should_panic(expected = "less than or equal to 100")]`. The test passes only if the panic message contains the given substring (source: rust-book-ch11-01-writing-tests.md).

## Result in tests

Test functions can return `Result<T, E>` instead of panicking. Return `Ok(())` for pass, `Err(msg)` for fail. This enables using `?` in test bodies. Cannot be combined with `#[should_panic]`; use `assert!(value.is_err())` instead (source: rust-book-ch11-01-writing-tests.md).

## Controlling test execution

Arguments before `--` go to `cargo test`; arguments after `--` go to the test binary (source: rust-book-ch11-02-running-tests.md).

**Parallelism**: Tests run in parallel by default. Use `cargo test -- --test-threads=1` for sequential execution when tests share state (source: rust-book-ch11-02-running-tests.md).

**Output capture**: Passing tests suppress stdout. Use `cargo test -- --show-output` to see `println!` output from passing tests (source: rust-book-ch11-02-running-tests.md).

**Filtering by name**: `cargo test one_hundred` runs only tests matching the string. Partial matches work: `cargo test add` runs all tests with "add" in the name. Module names are part of the test name, so filtering on a module name runs all its tests (source: rust-book-ch11-02-running-tests.md).

**Ignoring tests**: Annotate with `#[ignore]` after `#[test]`. Run ignored tests with `cargo test -- --ignored`. Run all tests including ignored with `cargo test -- --include-ignored` (source: rust-book-ch11-02-running-tests.md).

## Unit tests

Convention: a `tests` module in the same file as the code, annotated with `#[cfg(test)]`. The `cfg(test)` attribute tells Cargo to compile this module only during `cargo test`, not `cargo build` (source: rust-book-ch11-03-test-organization.md).

Use `use super::*;` to bring the parent module's items into scope. Rust allows testing private functions this way (source: rust-book-ch11-03-test-organization.md).

## Integration tests

Place integration tests in a top-level `tests/` directory. Each file compiles as a separate crate and can only access the library's public API. No `#[cfg(test)]` needed (source: rust-book-ch11-03-test-organization.md).

Run a specific integration test file with `cargo test --test integration_test` (source: rust-book-ch11-03-test-organization.md).

Shared helpers go in `tests/common/mod.rs` (not `tests/common.rs`). Files in subdirectories of `tests/` are not compiled as standalone test crates (source: rust-book-ch11-03-test-organization.md).

Binary-only crates (no `src/lib.rs`) cannot have integration tests because there is nothing to `use`. The workaround: put logic in `src/lib.rs` and keep `src/main.rs` thin (source: rust-book-ch11-03-test-organization.md).

## Documentation tests

Code blocks in `///` doc comments are compiled and run as tests by `cargo test`. They appear in a separate "Doc-tests" section of the output (source: rust-book-ch14-02-publishing-to-crates-io.md).

## Related pages

- [[rust-cargo]]
- [[rust-error-handling]]
- [[rust-modules]]
