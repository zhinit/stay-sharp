# Rust Modules

Rust's module system consists of packages, crates, and modules. It controls code organization, scope, and privacy. (source: rust-book-ch07-01-packages-and-crates.md)

## Packages, Crates, and Modules

A **crate** is the smallest unit the compiler considers. Two forms: binary crates (have a `main` function, compile to an executable) and library crates (no `main`, define shared functionality). (source: rust-book-ch07-01-packages-and-crates.md)

The **crate root** is the source file the compiler starts from. By convention, `src/main.rs` is the crate root for a binary crate, `src/lib.rs` for a library crate. (source: rust-book-ch07-01-packages-and-crates.md)

A **package** is one or more crates bundled with a `Cargo.toml`. A package can have at most one library crate and any number of binary crates (additional binaries go in `src/bin/`, each file becoming a separate crate). Must contain at least one crate. (source: rust-book-ch07-01-packages-and-crates.md)

**Modules** organize code within a crate. They control privacy and create namespaces. Defined with `mod name { ... }` (inline) or `mod name;` (loads from file). Modules can nest. (source: rust-book-ch07-02-defining-modules-to-control-scope-and-privacy.md)

## Module Tree

The contents of the crate root form an implicit module named `crate` at the root of the module tree. All other modules nest under it. Sibling modules are defined in the same parent module. (source: rust-book-ch07-02-defining-modules-to-control-scope-and-privacy.md)

```
crate
 └── front_of_house
     ├── hosting
     └── serving
```

## Paths

Paths refer to items in the module tree. Two forms:

- **Absolute path**: starts with `crate::` for the current crate, or the crate name for an external crate.
- **Relative path**: starts from the current module. Use `self::` for the current module, `super::` for the parent module.

Separated by `::`. Absolute paths are generally preferred because they remain valid when the calling code moves. (source: rust-book-ch07-03-paths-for-referring-to-an-item-in-the-module-tree.md)

## Privacy and pub

All items (functions, structs, enums, modules, constants) are **private to their parent module by default**. Child modules can see ancestor items, but parents cannot see private children. (source: rust-book-ch07-03-paths-for-referring-to-an-item-in-the-module-tree.md)

`pub` makes an item visible to ancestor modules. Making a module `pub` exposes the module itself but not its contents. Each item inside must also be marked `pub` individually. (source: rust-book-ch07-03-paths-for-referring-to-an-item-in-the-module-tree.md)

Struct fields are private by default even if the struct is `pub`. Each field must be individually marked `pub`. A struct with private fields requires a public constructor function (since external code cannot set private fields). (source: rust-book-ch07-03-paths-for-referring-to-an-item-in-the-module-tree.md)

Enum variants are all public if the enum is `pub`. (source: rust-book-ch07-03-paths-for-referring-to-an-item-in-the-module-tree.md)

## use Keyword

`use` creates a shortcut to a path within the current scope. Equivalent to a symbolic link. (source: rust-book-ch07-04-bringing-paths-into-scope-with-the-use-keyword.md)

### Idiomatic Paths

For functions, `use` the parent module, then call `module::function()`. This makes it clear the function is not locally defined. For structs and enums, `use` the full path: `use std::collections::HashMap;`. (source: rust-book-ch07-04-bringing-paths-into-scope-with-the-use-keyword.md)

When two types share a name, `use` their parent modules to disambiguate, or rename one with `as`: `use std::io::Result as IoResult;`. (source: rust-book-ch07-04-bringing-paths-into-scope-with-the-use-keyword.md)

### Re-exporting with pub use

`pub use` re-exports a name: it brings an item into scope and makes it available for external code to import. Useful for presenting a simpler public API than the internal module structure. (source: rust-book-ch07-04-bringing-paths-into-scope-with-the-use-keyword.md)

### Nested Paths

Combine imports sharing a prefix: `use std::{cmp::Ordering, io};`. To import a module and one of its children: `use std::io::{self, Write};`. (source: rust-book-ch07-04-bringing-paths-into-scope-with-the-use-keyword.md)

### Glob Operator

`use std::collections::*;` imports all public items. Use sparingly (makes it hard to tell what is in scope). Common in test modules. (source: rust-book-ch07-04-bringing-paths-into-scope-with-the-use-keyword.md)

### External Packages

Add the crate to `[dependencies]` in Cargo.toml, then `use` its items. The standard library (`std`) is shipped with Rust and does not need a Cargo.toml entry but still requires `use` statements. (source: rust-book-ch07-04-bringing-paths-into-scope-with-the-use-keyword.md)

## Separating Modules into Files

Declare a module with `mod name;` (no body). The compiler looks for the code in:
- `src/name.rs` (preferred)
- `src/name/mod.rs` (older style, still supported)

For submodules, files go in a directory named after the parent module: `src/parent/child.rs`. Do not mix both styles for the same module. (source: rust-book-ch07-05-separating-modules-into-different-files.md)

`mod` is a declaration, not an include. A file is loaded once via `mod`; all other references use paths. `use` does not affect which files are compiled. (source: rust-book-ch07-05-separating-modules-into-different-files.md)

## Related pages

- [[rust-cargo]]
- [[rust-ownership]]
- [[rust-type-system]]
