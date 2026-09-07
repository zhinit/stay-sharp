# TypeScript Type System

## Structural typing

TypeScript uses structural typing (duck typing): type checking focuses on the shape values have, not their declared class hierarchy. If two objects have the same shape, they are considered the same type (source: typescript-for-js-programmers-2026.md). A variable never declared as a `Point` type can still be passed where a `Point` is expected, as long as it has matching `x` and `y` properties. Shape-matching requires only a subset of the target's fields to match, so extra properties on the source are allowed when assigning from a variable (source: typescript-for-js-programmers-2026.md). This contrasts with nominal typing in languages like C# or Java, where a `Dog` class would need to explicitly implement a `Pet` interface (source: typescript-reference-type-compatibility-2026.md).

## Basic types

The primitive types are `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, and `undefined`. Always use the lowercase names, never the uppercase wrapper types like `String` or `Number` (source: typescript-handbook-everyday-types-2026.md). JavaScript has no separate integer type; everything is `number` (source: typescript-handbook-everyday-types-2026.md).

Arrays are written as `number[]` or `Array<number>`. Tuples like `[string, number]` are fixed-length typed arrays (source: typescript-handbook-everyday-types-2026.md).

`any` disables all type checking on a value. `unknown` is the type-safe counterpart: everything is assignable to `unknown`, but `unknown` is not assignable to anything except `any` without narrowing first (source: typescript-reference-type-compatibility-2026.md). `never` is the inverse: it is assignable to everything, but nothing is assignable to `never`. It represents states that should not exist (source: typescript-handbook-narrowing-2026.md). `void` indicates a function returns `undefined` or has no return value (source: typescript-for-js-programmers-2026.md).

## Type annotations and inference

Type annotations go after the thing being typed: `let myName: string = "Alice"`. In most cases annotations are unnecessary because TypeScript infers types from initializers, default parameters, and return statements (source: typescript-handbook-basics-2026.md). The recommendation is to use fewer annotations than you think you need (source: typescript-handbook-everyday-types-2026.md).

Contextual typing works in the opposite direction: when a function appears where TypeScript knows how it will be called, parameter types are inferred from context. For example, `forEach` callbacks get their parameter types from the array's element type (source: typescript-handbook-everyday-types-2026.md).

## Type aliases and interfaces

A type alias gives a name to any type: `type ID = number | string`. An interface declaration names an object type: `interface Point { x: number; y: number }` (source: typescript-handbook-everyday-types-2026.md).

Key differences:

- Interfaces can be reopened to add new fields via declaration merging. Type aliases cannot be changed after creation (source: typescript-handbook-everyday-types-2026.md).
- Interfaces with `extends` compile faster than type alias intersections (source: typescript-handbook-everyday-types-2026.md).
- Type aliases can name unions, primitives, and mapped types, which interfaces cannot.
- Interface names always appear in their original form in error messages (source: typescript-handbook-everyday-types-2026.md).

The heuristic: prefer `interface` until you need `type`-specific features like unions or mapped types (source: typescript-handbook-everyday-types-2026.md).

Type aliases are transparent. `type SafeString = string` does not create a distinct branded type; a plain `string` is freely assignable to it (source: typescript-handbook-everyday-types-2026.md).

## Union and intersection types

A union type `A | B` represents values that may be any one of the member types. TypeScript only allows operations valid for every member of the union; to use member-specific operations, narrow the type first (source: typescript-handbook-everyday-types-2026.md).

An intersection type `A & B` combines multiple types into one that has all members of both. Intersections are commonly used to extend type aliases: `type Bear = Animal & { honey: boolean }` (source: typescript-handbook-everyday-types-2026.md).

## Literal types and as const

TypeScript can refer to specific string and number values in type positions. A `const` variable gets a literal type (`"hello"`), while `let` gets a widened type (`string`) (source: typescript-handbook-everyday-types-2026.md). Combining literals into unions creates constrained value sets: `alignment: "left" | "right" | "center"` (source: typescript-handbook-everyday-types-2026.md). The type `boolean` is itself an alias for the union `true | false` (source: typescript-handbook-everyday-types-2026.md).

The `as const` suffix converts an entire object literal to use literal types for all properties. This solves the common gotcha where `{ method: "GET" }` infers `method` as `string` instead of `"GET"`, causing errors when passed to functions expecting a literal type (source: typescript-handbook-everyday-types-2026.md).

## Type assertions

Type assertions (`value as Type` or `<Type>value`) tell the compiler to treat a value as a more specific or less specific type. They are erased at compile time and have no runtime effect. TypeScript only allows assertions between compatible types; for incompatible coercions, go through `any` or `unknown` first: `expr as any as T` (source: typescript-handbook-everyday-types-2026.md).

The non-null assertion `x!` removes `null` and `undefined` from a type without explicit checking. It has no runtime effect and is error-prone if the assumption is wrong (source: typescript-handbook-everyday-types-2026.md).

## Narrowing

Narrowing is the process of refining a type to a more specific type within a code branch. TypeScript performs narrowing through control flow analysis, tracking types as they change across branches, assignments, and return statements (source: typescript-handbook-narrowing-2026.md).

### typeof guards

Checking `typeof x === "string"` narrows `x` to `string` in that branch. The `typeof` operator returns one of: `"string"`, `"number"`, `"bigint"`, `"boolean"`, `"symbol"`, `"undefined"`, `"object"`, `"function"` (source: typescript-handbook-narrowing-2026.md). Gotcha: `typeof null` returns `"object"`, so `typeof x === "object"` narrows to include `null` (source: typescript-handbook-narrowing-2026.md).

### Truthiness narrowing

JavaScript coerces values in conditionals. The values `0`, `NaN`, `""`, `0n`, `null`, and `undefined` are falsy; everything else is truthy (source: typescript-handbook-narrowing-2026.md). Truthiness checks can silently drop the empty string `""` and `0`, so they should be used with care on primitives (source: typescript-handbook-narrowing-2026.md).

### Equality narrowing

Strict equality (`===`, `!==`) and loose equality (`==`, `!=`) narrow types. When two variables are `===`, TypeScript knows they share a common type. Checking `!= null` removes both `null` and `undefined` simultaneously (source: typescript-handbook-narrowing-2026.md).

### The in operator

The expression `"prop" in obj` narrows `obj` to types that have `prop` as a required or optional property in the true branch, and to types where `prop` is optional or missing in the false branch (source: typescript-handbook-narrowing-2026.md).

### instanceof

`x instanceof Foo` checks the prototype chain and narrows `x` to `Foo` in the true branch (source: typescript-handbook-narrowing-2026.md).

### Discriminated unions

When every type in a union contains a common property with literal types (a discriminant), checking that property narrows to the specific union member. This is the idiomatic pattern for tagged variants in TypeScript (source: typescript-handbook-narrowing-2026.md). A `switch` on the discriminant works as well. Exhaustiveness checking with `never` in the `default` branch catches missing cases at compile time: assigning to a `never`-typed variable errors if any union member remains unhandled (source: typescript-handbook-narrowing-2026.md).

### Type predicates

A user-defined type guard is a function whose return type is `param is Type`. When called, it narrows the argument in the calling scope. The compiler trusts the predicate, so an incorrect implementation silently breaks type safety (source: typescript-handbook-narrowing-2026.md). Type predicates can be used with `Array.filter` to narrow array element types (source: typescript-handbook-narrowing-2026.md).

### Assertion functions

Assertion functions narrow by throwing if a condition is not met, rather than returning a boolean. They use the `asserts param is Type` syntax (source: typescript-handbook-narrowing-2026.md).

## Type operators

### keyof

`keyof T` produces a string or numeric literal union of the keys of object type `T`. For a type with a `string` index signature, `keyof` returns `string | number`, because JavaScript object keys accessed via `obj[0]` are the same as `obj["0"]` (source: typescript-handbook-keyof-type-operator-2026.md).

### typeof (in type context)

TypeScript's `typeof` in a type position extracts the type of a variable or property. This is essential for patterns like `ReturnType<typeof myFunction>`, since `ReturnType` requires a type, not a value (source: typescript-handbook-typeof-type-operator-2026.md). It only works on identifiers and their properties, not on arbitrary expressions (source: typescript-handbook-typeof-type-operator-2026.md).

### Indexed access types

`Type["key"]` looks up a property's type. It supports union indexes (`Person["age" | "name"]`), `keyof` (`Person[keyof Person]`), and `number` for array element types (`typeof MyArray[number]`). Only types can be used as indexes, not `const` variables; use a type alias instead (source: typescript-handbook-indexed-access-types-2026.md).

## Conditional types

Conditional types take the form `T extends U ? X : Y`, acting as an if/else at the type level. When the type on the left of `extends` is assignable to the right, the true branch is taken (source: typescript-handbook-conditional-types-2026.md). Their power comes from combining with [[typescript-generics]]: a conditional type with a generic parameter can replace function overloads.

The `infer` keyword introduces new type variables in the true branch: `Type extends Array<infer Item> ? Item : Type` extracts the array element type (source: typescript-handbook-conditional-types-2026.md). For overloaded functions, inference is made from the last signature (source: typescript-handbook-conditional-types-2026.md).

### Distributive behavior

When a conditional type acts on a naked generic parameter given a union, it distributes across each union member: `ToArray<string | number>` becomes `string[] | number[]`, not `(string | number)[]`. To prevent distribution, wrap both sides in brackets: `[Type] extends [any]` (source: typescript-handbook-conditional-types-2026.md).

## Mapped types

Mapped types iterate over keys to create new types: `{ [P in keyof T]: boolean }` transforms every property of `T` to `boolean` (source: typescript-handbook-mapped-types-2026.md).

The modifiers `readonly` and `?` can be added or removed with `+`/`-` prefixes. `-readonly` strips `readonly`, `-?` makes optional properties required (source: typescript-handbook-mapped-types-2026.md).

Key remapping via an `as` clause enables renaming keys using template literal types (e.g., `as \`get${Capitalize<string & P>}\``) and filtering keys by producing `never` via conditional types (source: typescript-handbook-mapped-types-2026.md). Mapped types can iterate over arbitrary unions, not just `string | number | symbol` (source: typescript-handbook-mapped-types-2026.md).

The built-in [[typescript-utility-types]] `Partial`, `Required`, `Readonly`, `Pick`, and `Record` are all implemented as mapped types.

## Template literal types

Template literal types use backtick syntax in type positions: `` type Greeting = `hello ${World}` ``. When a union appears in an interpolated position, the result is the cross product of all possible string literal combinations (source: typescript-handbook-template-literal-types-2026.md).

A powerful pattern is type-safe event handlers: constraining `eventName` to `` `${Key}Changed` `` and typing the callback parameter via indexed access on the original object type (source: typescript-handbook-template-literal-types-2026.md).

Four intrinsic string manipulation types are built into the compiler (not in `.d.ts` files): `Uppercase`, `Lowercase`, `Capitalize`, and `Uncapitalize` (source: typescript-handbook-template-literal-types-2026.md).

## Type compatibility

Compatibility is based on structural subtyping: `x` is compatible with `y` if `y` has at least the same members as `x` (source: typescript-reference-type-compatibility-2026.md).

### Excess property checking

Object literals get stricter "excess property checking" that flags properties not present in the target type. This check only applies to fresh object literals, not to variables assigned to an intermediate binding (source: typescript-reference-type-compatibility-2026.md).

### Function compatibility

A function with fewer parameters is assignable to one with more parameters. This enables the common callback pattern where `forEach` provides three arguments but callbacks typically use one (source: typescript-reference-type-compatibility-2026.md). Return types must be subtypes of the target's return type (source: typescript-reference-type-compatibility-2026.md).

Function parameters are bivariant by default: assignment succeeds if either the source or target parameter is assignable to the other. This is unsound but enables common JavaScript patterns like event handler callbacks. The `strictFunctionTypes` flag makes function parameters contravariant (source: typescript-reference-type-compatibility-2026.md).

### Class compatibility

Only instance members are compared; static members and constructors do not affect compatibility. Private and protected members must originate from the same class for compatibility, so classes from different inheritance hierarchies with the same shape are not compatible if either uses private members (source: typescript-reference-type-compatibility-2026.md).

## Type inference

TypeScript infers types at initialization, default parameters, and function return types (source: typescript-reference-type-inference-2026.md).

### Best common type

When inferring from multiple expressions (e.g., array elements), the best common type algorithm picks from the candidate types. When no single candidate is a supertype of all others, the result is a union type, not a common base class. For `[new Rhino(), new Snake()]`, the inferred type is `(Rhino | Snake)[]`, not `Animal[]`, unless `Animal` appears explicitly (source: typescript-reference-type-inference-2026.md).

### Contextual typing

Contextual typing infers types from usage context rather than from the value itself. When a function is assigned to a typed position like `window.onmousedown`, the parameter types are inferred from the target type. Explicit annotations override contextual types (source: typescript-reference-type-inference-2026.md).

## Related pages

- [[typescript-generics]]
- [[typescript-utility-types]]
- [[typescript-classes]]
- [[typescript-enums]]
- [[typescript-modules]]
