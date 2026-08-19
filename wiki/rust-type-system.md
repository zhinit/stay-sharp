# Rust Type System

Rust is statically typed. The compiler can usually infer types, but type annotations are required when multiple types are possible. (source: rust-book-ch03-02-data-types.md)

## Scalar types

Four primary scalar types: integers, floating-point numbers, Booleans, and characters. (source: rust-book-ch03-02-data-types.md)

**Integers**: signed (`i8`, `i16`, `i32`, `i64`, `i128`, `isize`) and unsigned (`u8`, `u16`, `u32`, `u64`, `u128`, `usize`). Default is `i32`. `isize`/`usize` depend on architecture (32 or 64 bit). Literals support decimal, hex (`0xff`), octal (`0o77`), binary (`0b1111_0000`), and byte (`b'A'`, `u8` only). Underscores are visual separators (`1_000`). Integer overflow panics in debug mode and wraps in release mode. Explicit overflow handling via `wrapping_*`, `checked_*`, `overflowing_*`, and `saturating_*` methods. (source: rust-book-ch03-02-data-types.md)

**Floating-point**: `f32` and `f64`. Default is `f64`. IEEE-754 representation. (source: rust-book-ch03-02-data-types.md)

**Boolean**: `bool`, one byte, values `true` and `false`. (source: rust-book-ch03-02-data-types.md)

**Character**: `char`, 4 bytes, represents a Unicode scalar value (`U+0000` to `U+D7FF` and `U+E000` to `U+10FFFF`). Specified with single quotes. (source: rust-book-ch03-02-data-types.md)

## Compound types

**Tuples**: fixed-length, heterogeneous. Created with parentheses: `let tup: (i32, f64, u8) = (500, 6.4, 1);`. Destructured with `let (x, y, z) = tup;` or accessed by index: `tup.0`. The unit type `()` is an empty tuple, the implicit return of expressions with no other value. (source: rust-book-ch03-02-data-types.md)

**Arrays**: fixed-length, homogeneous, stack-allocated. Type annotation: `[i32; 5]`. Fill syntax: `[3; 5]` creates `[3, 3, 3, 3, 3]`. Indexed with brackets: `a[0]`. Out-of-bounds access panics at runtime. For growable collections, use `Vec`. (source: rust-book-ch03-02-data-types.md)

## Structs

Three forms of structs. (source: rust-book-ch05-01-defining-structs.md)

**Named-field structs**: defined with `struct Name { field: Type }`. Instances created with `Name { field: value }`. Field init shorthand: if variable name matches field name, write just `field` instead of `field: field`. Struct update syntax: `..other_instance` fills remaining fields (follows move rules for non-Copy fields). The entire instance must be mutable; individual fields cannot be selectively mutable. (source: rust-book-ch05-01-defining-structs.md)

**Tuple structs**: `struct Color(i32, i32, i32);`. Named types with unnamed fields. Two tuple structs with the same field types are different types. Destructured with `let Color(r, g, b) = color;`. (source: rust-book-ch05-01-defining-structs.md)

**Unit-like structs**: `struct AlwaysEqual;`. No fields. Useful for implementing traits on a type with no data. (source: rust-book-ch05-01-defining-structs.md)

Structs that hold references require [[rust-ownership|lifetime]] annotations. (source: rust-book-ch05-01-defining-structs.md)

## Methods and associated functions

Methods are defined in `impl` blocks. The first parameter is `self` (ownership: `self`, immutable borrow: `&self`, mutable borrow: `&mut self`). `Self` is an alias for the impl block's type. Rust has automatic referencing and dereferencing for method calls, so no `->` operator is needed. (source: rust-book-ch05-03-method-syntax.md)

Associated functions without `self` (often constructors) are called with `::` syntax: `Rectangle::square(3)`. A struct can have multiple `impl` blocks. (source: rust-book-ch05-03-method-syntax.md)

## Enums

Enums define a type by enumerating its possible variants. Variants are namespaced under the enum: `IpAddr::V4`. Each variant can hold different types and amounts of data, including named fields, tuples, or nothing. Methods can be defined on enums with `impl`. (source: rust-book-ch06-01-defining-an-enum.md)

**`Option<T>`**: defined as `enum Option<T> { Some(T), None }`. Included in the prelude. Rust has no null; `Option<T>` encodes presence or absence. `Option<T>` and `T` are different types, forcing explicit handling of the `None` case. Extract values with [[rust-pattern-matching|match or if let]]. (source: rust-book-ch06-01-defining-an-enum.md)

**`Result<T, E>`**: `enum Result<T, E> { Ok(T), Err(E) }`. Used for operations that can fail. See [[rust-error-handling]]. (source: rust-book-ch10-01-syntax.md)

## Generics

Generic type parameters are declared in angle brackets: `fn largest<T>(list: &[T]) -> &T`. Used in functions, structs (`Point<T>`), enums (`Option<T>`, `Result<T, E>`), and methods. Multiple generics: `Point<T, U>`. (source: rust-book-ch10-01-syntax.md)

Methods on generic types declare `T` after `impl`: `impl<T> Point<T>`. Methods can also be constrained to specific types: `impl Point<f32>` defines methods only for `Point<f32>`. (source: rust-book-ch10-01-syntax.md)

Generics have zero runtime cost. The compiler performs monomorphization, generating specialized code for each concrete type used. (source: rust-book-ch10-01-syntax.md)

## Traits

A trait defines shared behavior as a set of method signatures. Similar to interfaces in other languages. Defined with `trait Name { fn method(&self) -> Type; }`. (source: rust-book-ch10-02-traits.md)

Implemented with `impl TraitName for TypeName { ... }`. Either the trait or the type must be local to the crate (orphan rule / coherence). (source: rust-book-ch10-02-traits.md)

**Default implementations**: trait methods can have default bodies. Default methods can call other methods in the same trait, even without defaults. An overriding implementation cannot call the default it replaces. (source: rust-book-ch10-02-traits.md)

**Traits as parameters**: `fn notify(item: &impl Summary)` accepts any type implementing `Summary`. Equivalent trait bound syntax: `fn notify<T: Summary>(item: &T)`. Trait bounds enforce that parameters have the same concrete type. Multiple bounds with `+`: `impl Summary + Display`. Complex bounds use `where` clauses. (source: rust-book-ch10-02-traits.md)

**Returning traits**: `fn foo() -> impl Summary` returns some type implementing the trait, but only one concrete type per function. (source: rust-book-ch10-02-traits.md)

**Conditional implementation**: `impl<T: Display> ToString for T` is a blanket implementation, implementing `ToString` for all types that implement `Display`. (source: rust-book-ch10-02-traits.md)

## Trait objects

`dyn Trait` enables dynamic dispatch. A trait object (`Box<dyn Draw>`, `&dyn Draw`) is a pointer to a type plus a vtable for looking up trait methods at runtime. Unlike generics (static dispatch via monomorphization), trait objects allow heterogeneous collections. (source: rust-book-ch18-02-trait-objects.md)

Trade-off: dynamic dispatch incurs a small runtime cost and prevents inlining optimizations. Use generics for homogeneous collections and trait objects for heterogeneous ones. (source: rust-book-ch18-02-trait-objects.md)

## Lifetimes

Every reference has a lifetime: the scope for which it is valid. Most lifetimes are inferred. Explicit annotations are needed when the compiler cannot determine how multiple reference lifetimes relate. (source: rust-book-ch10-03-lifetime-syntax.md)

**Syntax**: `'a` after `&`: `&'a i32`, `&'a mut i32`. Annotations describe relationships between lifetimes, they do not change how long references live. (source: rust-book-ch10-03-lifetime-syntax.md)

**In functions**: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` means the returned reference lives at least as long as the shorter of the two input lifetimes. (source: rust-book-ch10-03-lifetime-syntax.md)

**In structs**: `struct ImportantExcerpt<'a> { part: &'a str }`. The struct cannot outlive the reference it holds. (source: rust-book-ch10-03-lifetime-syntax.md)

**Lifetime elision rules** (applied by the compiler automatically): (1) each reference parameter gets its own lifetime; (2) if there is exactly one input lifetime, it is assigned to all output lifetimes; (3) if one parameter is `&self` or `&mut self`, its lifetime is assigned to all output lifetimes. (source: rust-book-ch10-03-lifetime-syntax.md)

**`'static`**: the reference can live for the entire program duration. All string literals have `'static` lifetime. Usually, a compiler suggestion to use `'static` indicates a different underlying problem. (source: rust-book-ch10-03-lifetime-syntax.md)

## Related pages

- [[rust-ownership]]
- [[rust-pattern-matching]]
- [[rust-error-handling]]
- [[rust-collections]]
