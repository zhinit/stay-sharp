# Serde

Serde is a framework for serializing and deserializing Rust data structures. It uses Rust's trait system at compile time rather than runtime reflection, so there is no reflection overhead (source: serde-guide-2026.md). The ecosystem has 24+ format implementations including JSON, YAML, TOML, MessagePack, CBOR, Postcard, RON, BSON, Avro, and CSV (source: serde-guide-2026.md).

## Data model

The Serde data model defines 29 types that form the intermediate representation between Rust types and wire formats. The `Serialize` trait maps Rust types into these model types via `Serializer` methods; the `Deserialize` trait reconstructs Rust types from model types via a `Visitor` (source: serde-data-model-2026.md).

The 29 types are: 14 primitives (bool, i8/i16/i32/i64/i128, u8/u16/u32/u64/u128, f32/f64, char), plus string, byte array, option, unit, unit_struct, unit_variant, newtype_struct, newtype_variant, seq, tuple, tuple_struct, tuple_variant, map, struct, and struct_variant (source: serde-data-model-2026.md).

Most Rust types map straightforwardly, but the mapping is flexible. `OsString` is a notable example: it cannot map to a Serde string (not guaranteed UTF-8) or byte array (cross-platform issues), so Serde maps it to an enum distinguishing Unix and Windows representations (source: serde-data-model-2026.md).

## Derive macros

`#[derive(Serialize, Deserialize)]` generates trait implementations at compile time for most structs and enums. Requires `serde = { version = "1.0", features = ["derive"] }` in Cargo.toml (source: serde-guide-2026.md).

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Point {
    x: i32,
    y: i32,
}
```

A common troubleshooting issue: if you see `the trait serde::ser::Serialize is not implemented` despite having `#[derive(Serialize)]`, you likely have incompatible serde versions across dependencies. Use `cargo tree -d` to find duplicates (source: serde-guide-2026.md).

## Attributes

Serde attributes fall into three categories: container (on structs/enums), variant (on enum variants), and field (on struct or variant fields). A single item can have multiple attributes (source: serde-attributes-2026.md).

### Container attributes

Renaming: `#[serde(rename = "name")]` changes the serialized name. `#[serde(rename_all = "camelCase")]` applies a case convention to all fields or variants, supporting lowercase, UPPERCASE, PascalCase, camelCase, snake_case, SCREAMING_SNAKE_CASE, kebab-case, and SCREAMING-KEBAB-CASE. `#[serde(rename_all_fields = "...")]` applies a convention to fields within each struct variant of an enum (source: serde-attributes-2026.md).

Enum representations: `#[serde(tag = "type")]` produces internally tagged enums. `#[serde(tag = "t", content = "c")]` produces adjacently tagged enums. `#[serde(untagged)]` produces untagged enums (can be performance-costly). These control how enum variants appear in the serialized format (source: serde-attributes-2026.md).

Defaults: `#[serde(default)]` fills missing fields from the struct's `Default` impl. `#[serde(default = "path")]` uses a specified function (source: serde-attributes-2026.md).

Validation: `#[serde(deny_unknown_fields)]` errors on unknown fields during deserialization (incompatible with flatten) (source: serde-attributes-2026.md).

Type conversion: `#[serde(transparent)]` makes a newtype struct serialize identically to its single field. `#[serde(from = "FromType")]` deserializes via an intermediate type using `From`. `#[serde(try_from = "FromType")]` uses fallible `TryFrom`. `#[serde(into = "IntoType")]` serializes via conversion (source: serde-attributes-2026.md).

Other: `#[serde(remote = "...")]` derives for types defined in other crates. `#[serde(bound = "T: MyTrait")]` overrides trait bounds. `#[serde(expecting = "...")]` customizes the error message (source: serde-attributes-2026.md).

### Variant attributes

`#[serde(rename = "name")]` and `#[serde(alias = "name")]` for renaming and alternate deserialization names. `#[serde(skip)]`, `#[serde(skip_serializing)]`, `#[serde(skip_deserializing)]` for omitting variants. `#[serde(serialize_with = "path")]`, `#[serde(deserialize_with = "path")]`, and `#[serde(with = "module")]` for custom logic. `#[serde(other)]` catches unmatched tags in tagged enums. `#[serde(untagged)]` makes a single variant untagged regardless of the enum's representation (source: serde-attributes-2026.md).

### Field attributes

`#[serde(rename = "name")]` and `#[serde(alias = "name")]` for naming. `#[serde(default)]` and `#[serde(default = "path")]` for default values. `#[serde(skip)]`, `#[serde(skip_serializing)]`, `#[serde(skip_deserializing)]`, and `#[serde(skip_serializing_if = "path")]` for conditional omission. `#[serde(flatten)]` embeds nested structure contents at the current level. `#[serde(serialize_with)]`, `#[serde(deserialize_with)]`, and `#[serde(with)]` for custom logic. `#[serde(borrow)]` enables zero-copy deserialization (source: serde-attributes-2026.md).

## Custom serialization

For cases where derive macros and attributes are insufficient, implement the traits manually (source: serde-custom-serialization-2026.md).

```rust
pub trait Serialize {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer;
}

pub trait Deserialize<'de>: Sized {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>;
}
```

Both methods are generic over the serialization format. The same implementation works across JSON, Postcard, and any other format with a `Serializer`/`Deserializer` impl (source: serde-custom-serialization-2026.md).

## Related pages

- [[serde-json]]
- [[reqwest]]
- [[rust-type-system]]
- [[rust-error-handling]]
