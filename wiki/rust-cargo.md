# Rust Cargo

## Basics

Cargo is Rust's build system and package manager. It handles compiling code, downloading dependencies, and building them. Packages of code are called crates (source: rust-book-ch01-03-hello-cargo.md).

Core commands (source: rust-book-ch01-03-hello-cargo.md):
- `cargo new <name>` creates a project with `Cargo.toml`, `src/main.rs`, and a git repo
- `cargo build` compiles to `target/debug/`
- `cargo run` compiles and runs in one step
- `cargo check` checks compilation without producing a binary (faster than `build`)
- `cargo build --release` compiles with optimizations to `target/release/`
- `cargo init` creates `Cargo.toml` in an existing directory

## Cargo.toml

The `[package]` section contains `name`, `version`, and `edition`. The `[dependencies]` section lists crate dependencies (source: rust-book-ch01-03-hello-cargo.md).

`Cargo.lock` tracks exact dependency versions. Managed by Cargo automatically (source: rust-book-ch01-03-hello-cargo.md).

Source files go in `src/`. The top-level directory is for README, license, config files (source: rust-book-ch01-03-hello-cargo.md).

## Release profiles

Two main profiles: `dev` (used by `cargo build`) and `release` (used by `cargo build --release`) (source: rust-book-ch14-01-release-profiles.md).

The `opt-level` setting controls optimization (0 to 3). Defaults: `dev` = 0, `release` = 3. Override in `Cargo.toml` (source: rust-book-ch14-01-release-profiles.md):

```toml
[profile.dev]
opt-level = 1
```

## Documentation comments

`///` comments generate HTML docs via `cargo doc`. They support Markdown and are placed before the item they document. Common sections: Examples, Panics, Errors, Safety (source: rust-book-ch14-02-publishing-to-crates-io.md).

`//!` comments document the containing item (the crate root or module) rather than the item that follows (source: rust-book-ch14-02-publishing-to-crates-io.md).

Code blocks in doc comments run as tests during `cargo test` (source: rust-book-ch14-02-publishing-to-crates-io.md).

`cargo doc --open` builds and opens docs in a browser (source: rust-book-ch14-02-publishing-to-crates-io.md).

## pub use re-exports

Use `pub use` to re-export deeply nested items at the crate root. This creates a convenient public API without restructuring internal modules (source: rust-book-ch14-02-publishing-to-crates-io.md).

## Publishing to crates.io

Requires a GitHub-linked account at crates.io. Run `cargo login` with your API token (stored in `~/.cargo/credentials.toml`) (source: rust-book-ch14-02-publishing-to-crates-io.md).

Required metadata in `Cargo.toml`: `description` and `license` (SPDX identifier, e.g. `"MIT OR Apache-2.0"`) (source: rust-book-ch14-02-publishing-to-crates-io.md).

`cargo publish` uploads the crate. Publishes are permanent: versions cannot be deleted, only yanked. Use semantic versioning for version numbers (source: rust-book-ch14-02-publishing-to-crates-io.md).

## Yanking

`cargo yank --vers 1.0.1` prevents new projects from depending on that version. Existing `Cargo.lock` files are unaffected. Undo with `--undo`. Does not delete code (source: rust-book-ch14-02-publishing-to-crates-io.md).

## Workspaces

A workspace is a set of packages sharing one `Cargo.lock` and one `target/` directory. The workspace root `Cargo.toml` has a `[workspace]` section with a `members` list instead of `[package]` (source: rust-book-ch14-03-cargo-workspaces.md).

Running `cargo new` inside a workspace auto-adds the package to `members`. All workspace crates share dependency versions via the single `Cargo.lock`. Each crate still needs its own dependency declarations (source: rust-book-ch14-03-cargo-workspaces.md).

Use `-p <crate>` to run, test, or publish a specific workspace member: `cargo run -p adder`, `cargo test -p add_one` (source: rust-book-ch14-03-cargo-workspaces.md).

## cargo install

Installs binary crates from crates.io to `$HOME/.cargo/bin`. Only works for crates with binary targets (a `src/main.rs`). Example: `cargo install ripgrep` (source: rust-book-ch14-04-installing-binaries.md).

## Related pages

- [[rust-modules]]
- [[rust-testing]]
