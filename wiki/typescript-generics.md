# TypeScript Generics

## Generic functions

A generic function uses a type variable to capture the type of an argument so that the same type can be used elsewhere in the signature (source: typescript-handbook-generics-2026.md). The type variable appears in angle brackets before the parameter list:

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}
```

TypeScript can infer the type argument from the value passed in, so explicit type arguments are usually unnecessary (source: typescript-handbook-generics-2026.md). When inference fails, type arguments can be specified manually: `identity<string>("hello")`.

Multiple type parameters can describe relationships between inputs and outputs. A standalone `map` takes `<Input, Output>`, inferring both from the array type and callback return type (source: typescript-handbook-more-on-functions-2026.md).

## Generic types

Generic interfaces and type aliases parameterize a type rather than an individual call signature. Placing the type parameter on the interface (e.g. `GenericIdentityFn<number>`) makes it visible to all members and requires callers to supply the argument. Placing it on a call signature inside the interface (e.g. `{ <Type>(arg: Type): Type }`) keeps each call independently generic (source: typescript-handbook-generics-2026.md).

Generic enums and generic namespaces are not supported (source: typescript-handbook-generics-2026.md).

## Generic constraints

The `extends` keyword constrains a type parameter to types that satisfy a given shape. A function requiring `.length` can constrain its parameter as `<Type extends { length: number }>`, which rejects types like `number` that lack that property (source: typescript-handbook-generics-2026.md).

A common error is returning a value that matches the constraint but not the actual type parameter. If the function promises to return `Type`, it must return the same kind of object that was passed in, not just any object satisfying the constraint. Returning `{ length: minimum }` when the caller passed an array would lose array methods like `slice` (source: typescript-handbook-more-on-functions-2026.md).

## Using type parameters in constraints

One type parameter can be constrained by another. The pattern `<Type, Key extends keyof Type>` ensures that a key argument is a valid property name of the object argument:

```ts
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}
```

This rejects keys that do not exist on the object at compile time (source: typescript-handbook-generics-2026.md).

## Generic classes

Generic classes parameterize instance members. The type parameter list follows the class name: `class GenericNumber<NumType>`. Static members cannot reference the class's type parameter because generics apply only to the instance side (source: typescript-handbook-generics-2026.md).

When creating factory functions that instantiate classes, the constructor type is written as `{ new(): T }` or `new () => T`. Combining this with a constraint (`<A extends Animal>(c: new () => A): A`) lets the factory infer the specific subclass (source: typescript-handbook-generics-2026.md).

## Generic parameter defaults

A type parameter can have a default: `<T extends HTMLElement = HTMLDivElement>`. Defaulted parameters are optional when specifying type arguments. Required type parameters must come before optional ones. If inference cannot find a candidate and a default exists, the default is used (source: typescript-handbook-generics-2026.md).

Defaults reduce the need for overloads. A function that previously required three overload signatures for zero, one, and two type arguments can be written once with defaults (source: typescript-handbook-generics-2026.md).

## const type parameters

Added in TypeScript 5.0. The `const` modifier on a type parameter causes const-like inference, preserving literal types without requiring callers to write `as const`:

```ts
function getNamesExactly<const T extends { names: readonly string[] }>(arg: T): T["names"] {
  return arg.names;
}
// Inferred type: readonly ["Alice", "Bob", "Eve"]
const names = getNamesExactly({ names: ["Alice", "Bob", "Eve"] });
```

Without `const`, the names would be inferred as `string[]` (source: typescript-release-notes-5.0-2026.md).

The `const` modifier does not reject mutable values. If the constraint is a mutable type (e.g. `string[]` instead of `readonly string[]`), a `readonly` inferred candidate may fall back to the constraint. Use `readonly` in the constraint when literal inference is intended. The modifier only affects expressions written directly in the call; passing a pre-existing variable has no effect (source: typescript-release-notes-5.0-2026.md).

## NoInfer utility type

Added in TypeScript 5.4. `NoInfer<T>` marks a position as not contributing to type inference. This prevents unwanted widening when one parameter should be the "source of truth" for a type and another should only consume that type:

```ts
function createStreetLight<C extends string>(colors: C[], defaultColor?: NoInfer<C>) {
  // ...
}
createStreetLight(["red", "yellow", "green"], "blue");
// error: "blue" is not assignable to "red" | "yellow" | "green"
```

Without `NoInfer`, the `defaultColor` argument would contribute to inference, widening `C` to include `"blue"` (source: typescript-release-notes-5.4-2026.md).

The previous workaround was adding a separate type parameter `<C extends string, D extends C>`, but this introduces a parameter that relates nothing else in the signature (source: typescript-release-notes-5.4-2026.md). See also [[typescript-utility-types]] for the full list of built-in utility types.

## Function overloads vs generic unions

When overloads have the same argument count and return type, a union parameter is preferable. Overloads resolve to a single signature per call, so a value typed as `string | any[]` cannot match either of two overloads `len(s: string): number` and `len(arr: any[]): number`. A single signature `len(x: any[] | string): number` accepts the union directly (source: typescript-handbook-more-on-functions-2026.md).

The implementation signature of an overloaded function is not visible to callers. At least two overload signatures must appear above the implementation. The implementation signature must be compatible with all overload signatures (source: typescript-handbook-more-on-functions-2026.md).

## Variance annotations

Variance describes how the relationship between generic instantiations relates to the relationship between their type arguments. A `Producer<T>` that only returns `T` is covariant: `Producer<Cat>` is assignable to `Producer<Animal>`. A `Consumer<T>` that only accepts `T` is contravariant: `Consumer<Animal>` is assignable to `Consumer<Cat>`. A type that both produces and consumes `T` is invariant (source: typescript-handbook-generics-2026.md).

TypeScript infers variance automatically from the structural definition. Explicit annotations (`in`, `out`, `in out`) exist but are almost never needed:

```ts
interface Producer<out T> { make(): T; }
interface Consumer<in T> { consume: (arg: T) => void; }
interface ProducerConsumer<in out T> { consume: (arg: T) => void; make(): T; }
```

Annotations must match the structural behavior. They are only consulted during instantiation-based comparisons (comparing two versions of the same generic type), not during structural comparisons against anonymous types. Writing an incorrect annotation does not force a different variance; it produces unpredictable behavior (source: typescript-handbook-generics-2026.md).

The only legitimate uses are fixing rare circular-type measurement errors and, after profiling, speeding up extraordinarily complex types (source: typescript-handbook-generics-2026.md).

## Type inference

TypeScript infers types at variable initialization, parameter defaults, and return positions. The "best common type" algorithm picks from candidate types; when no single type is a supertype of all candidates (e.g. an array of `Rhino`, `Elephant`, `Snake`), the result is their union, not a common base class. An explicit annotation is needed to get the base type (source: typescript-reference-type-inference-2026.md).

Contextual typing works in the reverse direction: the expected type of a position (e.g. `window.onmousedown`) flows inward to infer parameter types of a function expression assigned to that position. Explicit annotations on parameters override contextual types (source: typescript-reference-type-inference-2026.md).

## Guidelines for writing good generic functions

Three rules from the handbook (source: typescript-handbook-more-on-functions-2026.md):

**Push type parameters down.** Use the type parameter directly rather than constraining it. `firstElement<Type>(arr: Type[])` returns `Type`, while `firstElement<Type extends any[]>(arr: Type)` returns `any` because TypeScript resolves `arr[0]` against the constraint.

**Use fewer type parameters.** A type parameter that does not relate two values is unnecessary overhead. `filter<Type, Func extends (arg: Type) => boolean>(arr: Type[], func: Func)` has a `Func` parameter that adds nothing; `filter<Type>(arr: Type[], func: (arg: Type) => boolean)` is equivalent and simpler.

**Type parameters should appear twice.** If a type parameter appears in only one location in the signature and is not part of the inferred return type, it is not relating anything. `greet<Str extends string>(s: Str)` gains nothing over `greet(s: string)`.

## Related pages

- [[typescript-type-system]] for narrowing, conditional types, mapped types, template literal types
- [[typescript-utility-types]] for Partial, Pick, Omit, Record, NoInfer, and other built-in type transformers
- [[typescript-classes]] for class features, parameter properties, and the instance vs static distinction
