# TypeScript Enums

Enums are one of the few TypeScript features that are not a type-level extension of JavaScript. They emit runtime code. (source: typescript-reference-enums-2026.md)

## Numeric enums

Members auto-increment from 0 (or from a specified starting value). A member without an initializer gets the preceding member's value plus one. Members following a computed member must have explicit initializers. (source: typescript-reference-enums-2026.md)

## String enums

Every member must be initialized with a string literal or another string enum member. There is no auto-incrementing. String values are readable at runtime, making debugging easier than with numeric enums. String enum members do not get reverse mappings. (source: typescript-reference-enums-2026.md)

## Heterogeneous enums

Enums can mix string and numeric members. This is allowed but discouraged. (source: typescript-reference-enums-2026.md)

## Computed and constant members

A member is constant if it is: the first member with no initializer (value 0), follows a numeric constant member (auto-incremented), or is initialized with a constant enum expression (literals, references to other constant members, arithmetic/bitwise operators). All other members are computed. Constant enum expressions that evaluate to `NaN` or `Infinity` are compile errors. (source: typescript-reference-enums-2026.md)

## Union enums and enum member types

When all members are literal (no initializer, or string/numeric literals), two things happen. First, each member becomes a type usable in type position (e.g. `kind: ShapeKind.Circle`). Second, the enum type itself becomes a union of its member types, enabling exhaustiveness checking and catching impossible comparisons at compile time. (source: typescript-reference-enums-2026.md)

## Runtime and compile-time behavior

Enums are real objects at runtime and can be passed to functions expecting matching shapes. At compile time, `keyof typeof MyEnum` produces a string literal union of the enum's key names (e.g. `"ERROR" | "WARN" | "INFO" | "DEBUG"`). Plain `keyof` on an enum value gives `string | number` (the object prototype keys), which is rarely useful. (source: typescript-reference-enums-2026.md)

## Reverse mappings

Numeric enums compile to an object with both forward (`name` to `value`) and reverse (`value` to `name`) mappings. This allows `Enum[value]` to return the member name. String enums do not get reverse mappings. (source: typescript-reference-enums-2026.md)

## const enums

Declaring `const enum` causes members to be inlined at use sites and the enum object to be completely removed during compilation. Only constant enum expressions are allowed (no computed members). (source: typescript-reference-enums-2026.md)

Pitfalls with ambient `const enum` (in `.d.ts` files): they are incompatible with `isolatedModules`, they risk version skew when a dependency's enum values change between compile time and runtime, and type-only imports cannot reference const enum values. Two mitigations: ban const enums entirely via a linter, or use `preserveConstEnums` to emit the object while stripping `const` from `.d.ts` files in a build step. (source: typescript-reference-enums-2026.md)

## Ambient enums

Declared with `declare enum`, these describe existing enum types without emitting code. A non-initialized member in an ambient enum is always considered computed (unlike regular enums where it would be constant if following a constant member). (source: typescript-reference-enums-2026.md)

## Objects as an alternative

An `as const` object with `typeof obj[keyof typeof obj]` for the value union achieves similar results without the non-standard `enum` syntax. This keeps the codebase closer to standard JavaScript. The tradeoff is one extra line to derive the value union type. (source: typescript-reference-enums-2026.md)

## Related pages

- [[typescript-type-system]]
- [[typescript-classes]]
- [[typescript-modules]]
- [[typescript-project-config]]
