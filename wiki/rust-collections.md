# Rust Collections

The standard library provides three commonly used collections: `Vec<T>`, `String`, and `HashMap<K, V>`. All store data on the heap and can grow at runtime. (source: rust-book-ch08-01-vectors.md)

## Vec

A `Vec<T>` stores a variable number of values of the same type, contiguous in memory. (source: rust-book-ch08-01-vectors.md)

### Creating

`Vec::new()` creates an empty vector (requires a type annotation if no values are pushed). The `vec!` macro creates a vector with initial values and infers the type: `let v = vec![1, 2, 3];` produces a `Vec<i32>`. (source: rust-book-ch08-01-vectors.md)

### Updating

`push` appends an element. The vector must be `mut`. (source: rust-book-ch08-01-vectors.md)

### Reading

Two ways to access elements: indexing with `&v[i]` (panics on out-of-bounds) or `v.get(i)` which returns `Option<&T>` (returns `None` on out-of-bounds). Use `get` when out-of-bounds access is a normal possibility. (source: rust-book-ch08-01-vectors.md)

The borrow checker prevents holding an immutable reference to an element while pushing to the vector, because `push` may reallocate and invalidate existing references. (source: rust-book-ch08-01-vectors.md)

### Iterating

Use `for val in &v` for immutable iteration, `for val in &mut v` for mutable iteration (dereference with `*val` to modify). Inserting or removing during a `for` loop is a compile error. (source: rust-book-ch08-01-vectors.md)

### Storing Multiple Types

Vectors hold one type. To store mixed types, define an enum with variants for each type and store the enum, or use trait objects. (source: rust-book-ch08-01-vectors.md)

When a vector goes out of scope, it and all its elements are dropped. (source: rust-book-ch08-01-vectors.md)

## String

`String` is a growable, owned, UTF-8 encoded string type. It is a wrapper around `Vec<u8>` with extra guarantees. The core language type is `&str` (a borrowed string slice). (source: rust-book-ch08-02-strings.md)

### Creating

`String::new()` for empty, `String::from("text")` or `"text".to_string()` from a literal. Both are equivalent. (source: rust-book-ch08-02-strings.md)

### Updating

- `push_str(&str)` appends a string slice (does not take [[rust-ownership|ownership]])
- `push(char)` appends a single character
- The `+` operator: `s1 + &s2` moves `s1`, appends a copy of `s2`. Uses `fn add(self, s: &str) -> String` under the hood. `s1` is consumed. Deref coercion converts `&String` to `&str`.
- `format!` macro: `format!("{s1}-{s2}-{s3}")` produces a `String` without taking ownership of any argument.
(source: rust-book-ch08-02-strings.md)

### Indexing

Rust does not allow indexing a `String` by integer. A `String` is bytes, not characters. A single Unicode scalar value may be multiple bytes, so `s[0]` would be ambiguous (byte? char? grapheme cluster?). The compiler rejects it. (source: rust-book-ch08-02-strings.md)

### Slicing

Use a byte range: `&s[0..4]` returns a `&str` of the first 4 bytes. Panics at runtime if the range does not fall on a character boundary. (source: rust-book-ch08-02-strings.md)

### Iterating

`s.chars()` iterates over Unicode scalar values. `s.bytes()` iterates over raw bytes. Grapheme cluster iteration requires an external crate. (source: rust-book-ch08-02-strings.md)

## HashMap

`HashMap<K, V>` maps keys of type `K` to values of type `V` using a hashing function (SipHash by default). Not in the prelude; requires `use std::collections::HashMap`. (source: rust-book-ch08-03-hash-maps.md)

### Creating and Accessing

`HashMap::new()` then `insert(key, value)`. `get(&key)` returns `Option<&V>`. Use `.copied().unwrap_or(default)` to get a plain value with a fallback. Iterate with `for (key, value) in &map`. (source: rust-book-ch08-03-hash-maps.md)

### Ownership

Types implementing `Copy` (like `i32`) are copied into the map. Owned types like `String` are moved; the map takes ownership. References inserted must remain valid for the map's lifetime. (source: rust-book-ch08-03-hash-maps.md)

### Updating

- Overwrite: calling `insert` with an existing key replaces the value.
- Insert if absent: `map.entry(key).or_insert(value)` returns a `&mut V` to the entry's value, inserting the default only if the key is missing.
- Update based on old value: use `or_insert` to get a mutable reference, then dereference and modify it (e.g. word counting with `*count += 1`).
(source: rust-book-ch08-03-hash-maps.md)

## Closures

Closures are anonymous functions that can capture values from their enclosing scope. Syntax: `|params| expression` or `|params| { body }`. Type annotations are optional; the compiler infers types from usage. Once inferred, types are locked (calling with a different type is a compile error). (source: rust-book-ch13-01-closures.md)

### Capturing

Closures capture values in three ways, chosen automatically based on what the body does:
- Immutable borrow (reading)
- Mutable borrow (mutating)
- Move (taking ownership)

The `move` keyword before the parameter list forces ownership transfer, useful when passing closures to threads. (source: rust-book-ch13-01-closures.md)

### Fn Traits

Every closure implements one or more of these traits:
- `FnOnce`: can be called at least once. All closures implement this. A closure that moves a captured value out of its body implements only `FnOnce`.
- `FnMut`: does not move values out, but may mutate captured values. Can be called multiple times.
- `Fn`: does not move or mutate. Can be called concurrently.

These are additive: an `Fn` closure also implements `FnMut` and `FnOnce`. (source: rust-book-ch13-01-closures.md)

Functions (not just closures) automatically implement whichever `Fn` traits apply, so a function name can be passed where a closure is expected (e.g. `unwrap_or_else(Vec::new)`). (source: rust-book-ch13-01-closures.md)

## Iterators

Iterators are lazy: they produce values only when consumed. (source: rust-book-ch13-02-iterators.md)

### The Iterator Trait

All iterators implement:

```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

`next` returns `Some(value)` for each element and `None` when exhausted. (source: rust-book-ch13-02-iterators.md)

### Creating Iterators

- `iter()`: iterates over `&T` (immutable references)
- `iter_mut()`: iterates over `&mut T` (mutable references)
- `into_iter()`: iterates over `T` (takes ownership)
(source: rust-book-ch13-02-iterators.md)

### Consuming Adaptors

Methods that call `next` and consume the iterator: `sum()`, `collect()`, `count()`, `for_each()`, etc. After calling a consuming adaptor, the iterator is used up. (source: rust-book-ch13-02-iterators.md)

### Iterator Adaptors

Methods that produce a new iterator from an existing one without consuming it: `map()`, `filter()`, `zip()`, `chain()`, etc. Because iterators are lazy, you must call a consuming adaptor (like `collect()`) to trigger evaluation. (source: rust-book-ch13-02-iterators.md)

`filter` takes a closure receiving `&item` and returning `bool`. Items where the closure returns `true` are included. Closures passed to adaptors can capture values from their environment. (source: rust-book-ch13-02-iterators.md)

## Related pages

- [[rust-ownership]]
- [[rust-type-system]]
- [[rust-error-handling]]
