# Rust Ownership

## Ownership rules

Every value in Rust has exactly one owner. There can only be one owner at a time. When the owner goes out of scope, the value is dropped. (source: rust-book-ch04-01-what-is-ownership.md)

Memory is managed through this ownership system, with rules checked at compile time. None of the ownership features incur runtime cost. (source: rust-book-ch04-01-what-is-ownership.md)

When a variable goes out of scope, Rust calls `drop` automatically. This pattern is equivalent to C++ RAII. (source: rust-book-ch04-01-what-is-ownership.md)

## Stack and heap

Stack-allocated data must have a known, fixed size at compile time. Heap allocation returns a pointer stored on the stack. Stack access is faster due to locality. The primary purpose of ownership is to manage heap data. (source: rust-book-ch04-01-what-is-ownership.md)

## Move semantics

Assigning a heap-allocated value (like `String`) to another variable moves it. The original variable is invalidated and can no longer be used. This prevents double-free errors. Rust never automatically creates deep copies. (source: rust-book-ch04-01-what-is-ownership.md)

Reassigning a variable calls `drop` on the original value immediately. (source: rust-book-ch04-01-what-is-ownership.md)

To deep-copy heap data, call `.clone()` explicitly. A `clone` call signals potentially expensive operations. (source: rust-book-ch04-01-what-is-ownership.md)

## Copy trait

Types with a known size at compile time that live entirely on the stack implement the `Copy` trait. `Copy` types are trivially copied on assignment rather than moved. A type cannot implement both `Copy` and `Drop`. (source: rust-book-ch04-01-what-is-ownership.md)

Types that implement `Copy`: all integer types, `bool`, all floating-point types, `char`, and tuples containing only `Copy` types (e.g. `(i32, i32)` but not `(i32, String)`). (source: rust-book-ch04-01-what-is-ownership.md)

## Ownership and functions

Passing a value to a function moves or copies it, following the same rules as assignment. Returning a value from a function transfers ownership to the caller. (source: rust-book-ch04-01-what-is-ownership.md)

## References and borrowing

A reference (`&T`) is an address that points to a valid value owned by another variable. References do not take ownership. Creating a reference is called borrowing. References are immutable by default. (source: rust-book-ch04-02-references-and-borrowing.md)

A mutable reference (`&mut T`) allows modifying the borrowed value. Both the variable and the reference must be declared `mut`. (source: rust-book-ch04-02-references-and-borrowing.md)

## Borrowing rules

At any given time, you can have either one mutable reference or any number of immutable references to the same value. You cannot have a mutable reference while immutable references exist to the same value. References must always be valid. (source: rust-book-ch04-02-references-and-borrowing.md)

This restriction prevents data races at compile time. A data race occurs when two or more pointers access the same data simultaneously, at least one writes, and there is no synchronization. (source: rust-book-ch04-02-references-and-borrowing.md)

A reference's scope extends from its introduction to its last use (non-lexical lifetimes), not to the end of the enclosing block. This allows an immutable reference to go out of scope before a mutable reference is created. (source: rust-book-ch04-02-references-and-borrowing.md)

## Dangling references

The compiler guarantees that references never dangle. If a function tries to return a reference to a local variable, the compiler rejects it because the data would be dropped when the function ends. The fix is to return the owned value directly, transferring ownership. (source: rust-book-ch04-02-references-and-borrowing.md)

## Slices

A slice is a reference to a contiguous sequence of elements in a collection. Slices do not have ownership. (source: rust-book-ch04-03-slices.md)

A string slice (`&str`) references a portion of a `String` using range syntax: `&s[0..5]`, `&s[..5]`, `&s[3..]`, `&s[..]`. Internally, a slice stores a pointer to the starting element and a length. String slice indices must fall on valid UTF-8 character boundaries. (source: rust-book-ch04-03-slices.md)

String literals are slices (`&str`) pointing into the program binary. They are immutable. (source: rust-book-ch04-03-slices.md)

Idiomatic Rust prefers `&str` over `&String` in function parameters. This works with both `String` references and string literals via deref coercion. (source: rust-book-ch04-03-slices.md)

Array slices work the same way: `&a[1..3]` has type `&[i32]`. (source: rust-book-ch04-03-slices.md)

## Related pages

- [[rust-type-system]]
- [[rust-error-handling]]
- [[rust-collections]]
