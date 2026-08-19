# serde_json

serde_json is a Rust crate for converting data between JSON text, untyped `Value` representations, and strongly-typed Rust structs (source: serde-json-readme-2026.md). It achieves 500-1000 MB/s deserialization and 600-900 MB/s serialization, competitive with the fastest C/C++ JSON libraries (source: serde-json-readme-2026.md).

## Three ways to work with JSON

JSON data in Rust falls into three forms: raw text (a `&str` or byte stream), an untyped `Value` tree, or a strongly-typed data structure. serde_json converts between all three (source: serde-json-readme-2026.md).

## The Value enum

Any valid JSON maps to this recursive enum (source: serde-json-api-docs-2026.md):

```rust
enum Value {
    Null,
    Bool(bool),
    Number(Number),
    String(String),
    Array(Vec<Value>),
    Object(Map<String, Value>),
}
```

`Value` can be indexed with square brackets: string keys for objects, integer keys for arrays. If the key is missing, the type is wrong, or the index is out of bounds, the result is `Value::Null` (source: serde-json-readme-2026.md).

When printed, a `Value` renders as a JSON string. To get a plain Rust string without quotes, use `as_str()` or deserialize into a typed struct instead (source: serde-json-readme-2026.md).

## Deserialization

`from_str(s)` parses a `&str`. `from_slice(bytes)` parses a `&[u8]`. `from_reader(rdr)` parses from any `io::Read` (a file, TCP stream, etc.). `from_value(v)` converts a `Value` into a typed struct. All return `serde_json::Result<T>` (source: serde-json-api-docs-2026.md).

The same `from_str` function works for both untyped and typed deserialization. The target type is inferred from the variable binding:

```rust
// Untyped
let v: Value = serde_json::from_str(data)?;

// Typed
let p: Person = serde_json::from_str(data)?;
```

Typed deserialization gives compile-time guarantees and IDE autocomplete. Untyped is useful for validation or basic manipulation when you do not know the structure (source: serde-json-readme-2026.md).

## Serialization

`to_string(v)` serializes to a `String`. `to_string_pretty(v)` produces formatted output. `to_vec(v)` and `to_vec_pretty(v)` serialize to `Vec<u8>`. `to_writer(w, v)` and `to_writer_pretty(w, v)` write to any `io::Write` (source: serde-json-api-docs-2026.md).

Any type implementing [[serde]]'s `Serialize` trait works, including `Vec<T>`, `HashMap<K, V>`, and any struct with `#[derive(Serialize)]` (source: serde-json-readme-2026.md).

## The json! macro

Builds `Value` objects with JSON-like syntax. Variables and expressions interpolate directly; Serde checks at compile time that interpolated values can be represented as JSON (source: serde-json-readme-2026.md).

```rust
use serde_json::json;

let john = json!({
    "name": full_name,
    "age": age_last_year + 1,
    "phones": [
        format!("+44 {}", random_phone())
    ]
});
```

## Streaming

`StreamDeserializer` iterates over multiple JSON values from a single input (source: serde-json-api-docs-2026.md).

## Other types

`Deserializer` and `Serializer` structs provide lower-level control. `Map` is the JSON key/value storage type. `Number` represents integer or floating-point values. `Error` is the unified error type for all operations (source: serde-json-api-docs-2026.md).

## No-std support

Works without the standard library if an allocator is available. Disable the default `std` feature and enable `alloc` (source: serde-json-readme-2026.md):

```toml
serde_json = { version = "1.0", default-features = false, features = ["alloc"] }
```

## Related pages

- [[serde]]
- [[reqwest]]
- [[rust-error-handling]]
