# Rust Pattern Matching

## match expressions

`match` compares a value against a series of patterns and executes the code for the first matching arm. The match value can be any type (not limited to Booleans like `if`). Each arm has the form `PATTERN => EXPRESSION`, separated by commas. The arm code is an expression whose value becomes the return value of the entire `match`. Multi-line arm bodies use curly brackets. (source: rust-book-ch06-02-match.md)

Matches are exhaustive: every possible value must be covered or the compiler rejects the code. (source: rust-book-ch06-02-match.md)

**Binding to values**: patterns can bind to parts of the matched value. `Coin::Quarter(state)` binds the inner value to `state`. (source: rust-book-ch06-02-match.md)

**Matching `Option<T>`**: `Some(i) => Some(i + 1)` extracts the inner value. The `None` arm must be handled. (source: rust-book-ch06-02-match.md)

**Catch-all and `_`**: a variable name as the last arm catches all remaining values and binds them. `_` matches anything without binding. `_ => ()` ignores the value and does nothing. (source: rust-book-ch06-02-match.md)

## if let

`if let PATTERN = EXPRESSION` is syntax sugar for a `match` with one arm. Useful when only one variant matters. Loses exhaustive checking. Can include `else` (equivalent to the `_` arm). Can be chained with `else if` and `else if let`. (source: rust-book-ch06-03-if-let.md)

## let...else

`let PATTERN = EXPRESSION else { diverge }`. If the pattern matches, binds variables in the outer scope. If not, the `else` block must diverge (return, break, continue, or panic). Keeps the code on the "happy path" without nesting. (source: rust-book-ch06-03-if-let.md)

## while let

`while let PATTERN = EXPRESSION { body }` runs as long as the pattern matches. Useful for iterating over `Result` or `Option` values, e.g., channel receivers: `while let Ok(msg) = rx.recv()`. (source: rust-book-ch19-01-all-the-places-for-patterns.md)

## Patterns in other places

**let statements**: `let (x, y, z) = (1, 2, 3);` destructures a tuple. The variable count must match. (source: rust-book-ch19-01-all-the-places-for-patterns.md)

**for loops**: `for (index, value) in v.iter().enumerate()` destructures the tuple produced by `enumerate`. (source: rust-book-ch19-01-all-the-places-for-patterns.md)

**Function parameters**: `fn foo(&(x, y): &(i32, i32))` destructures a tuple reference. Closure parameters work the same way. (source: rust-book-ch19-01-all-the-places-for-patterns.md)

## Refutability

**Irrefutable patterns** match any possible value (e.g., `x` in `let x = 5;`). Required by `let`, `for`, and function parameters. (source: rust-book-ch19-02-refutability.md)

**Refutable patterns** can fail to match (e.g., `Some(x)`). Used with `if let`, `while let`, and `let...else`. The compiler warns if a refutable construct receives an irrefutable pattern (the else branch would be unreachable). (source: rust-book-ch19-02-refutability.md)

In `match`, all arms except the last must be refutable. The last arm is typically irrefutable (catch-all). (source: rust-book-ch19-02-refutability.md)

## Pattern syntax

**Literals**: match concrete values directly. `1 => "one"`. (source: rust-book-ch19-03-pattern-syntax.md)

**Named variables**: irrefutable, match anything and bind the value. Variables inside `match`/`if let`/`while let` shadow outer variables of the same name. (source: rust-book-ch19-03-pattern-syntax.md)

**Multiple patterns**: `|` (or) operator: `1 | 2 => "one or two"`. (source: rust-book-ch19-03-pattern-syntax.md)

**Ranges**: `..=` for inclusive ranges: `1..=5 => "one through five"`. Works with numeric and `char` values only. (source: rust-book-ch19-03-pattern-syntax.md)

**Destructuring structs**: `let Point { x, y } = p;` (shorthand) or `let Point { x: a, y: b } = p;` (rename). Can mix with literals: `Point { x, y: 0 }` matches points on the x-axis. (source: rust-book-ch19-03-pattern-syntax.md)

**Destructuring enums**: pattern matches the variant's data shape. `Message::Move { x, y }` for struct-like variants, `Message::Write(text)` for tuple-like, `Message::Quit` for unit-like. Nested destructuring works: `Message::ChangeColor(Color::Rgb(r, g, b))`. (source: rust-book-ch19-03-pattern-syntax.md)

**Destructuring structs and tuples**: can be nested arbitrarily: `((feet, inches), Point { x, y })`. (source: rust-book-ch19-03-pattern-syntax.md)

## Ignoring values

**`_`**: matches any value, does not bind. Can be used in function parameters, nested in patterns (`Some(_)`), or multiple times in one pattern (`(_, second, _, fourth, _)`). (source: rust-book-ch19-03-pattern-syntax.md)

**`_name`**: prefixing with underscore suppresses unused warnings but still binds (and can move ownership). Plain `_` never binds and never moves. (source: rust-book-ch19-03-pattern-syntax.md)

**`..`**: ignores remaining fields or elements. `Point { x, .. }` ignores `y` and `z`. `(first, .., last)` matches first and last of a tuple. Can only appear once in a pattern (ambiguous uses rejected). (source: rust-book-ch19-03-pattern-syntax.md)

## Match guards

An additional `if` condition after the pattern: `Some(x) if x % 2 == 0 => ...`. Only available in `match`, not `if let` or `while let`. The guard applies to the entire pattern when combined with `|`: `4 | 5 | 6 if y` is `(4 | 5 | 6) if y`, not `4 | 5 | (6 if y)`. Match guards can reference outer variables without shadowing. The compiler does not check exhaustiveness when guards are present. (source: rust-book-ch19-03-pattern-syntax.md)

## @ bindings

`id @ 3..=7` tests a value against a range and binds it to `id` simultaneously. Without `@`, a range pattern does not capture the matched value. (source: rust-book-ch19-03-pattern-syntax.md)

## Related pages

- [[rust-type-system]]
- [[rust-ownership]]
- [[rust-error-handling]]
