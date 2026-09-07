# TypeScript Utility Types

TypeScript provides globally available utility types for common type transformations. They are built on [[typescript-generics]], [[typescript-type-system|conditional types]], and [[typescript-type-system|mapped types]]. (source: typescript-reference-utility-types-2026.md)

## Object type utilities

`Partial<Type>` makes all properties optional, returning a type representing all subsets of the input. `Required<Type>` does the inverse, making all properties required. `Readonly<Type>` marks all properties as `readonly`, preventing reassignment. `Object.freeze` is typed as returning `Readonly<Type>`. (source: typescript-reference-utility-types-2026.md)

`Record<Keys, Type>` constructs an object type whose keys come from `Keys` (a string literal union) and whose values are `Type`. Useful for mapping a known set of keys to a uniform value type. (source: typescript-reference-utility-types-2026.md)

`Pick<Type, Keys>` constructs a type by selecting only the named properties from `Type`. `Omit<Type, Keys>` does the inverse, keeping everything except the named properties. (source: typescript-reference-utility-types-2026.md)

## Union type utilities

`Exclude<UnionType, ExcludedMembers>` removes union members assignable to `ExcludedMembers`. It also works structurally on discriminated unions (e.g. filtering by `{ kind: "circle" }`). `Extract<Type, Union>` does the inverse, keeping only members assignable to `Union`. `NonNullable<Type>` removes `null` and `undefined` from a union. (source: typescript-reference-utility-types-2026.md)

## Function type utilities

`Parameters<Type>` extracts a function's parameter types as a tuple. `ReturnType<Type>` extracts the return type. For overloaded functions, both operate on the last signature only. Use `typeof` to go from a value to a type: `ReturnType<typeof myFn>`. (source: typescript-reference-utility-types-2026.md)

`ConstructorParameters<Type>` extracts a constructor's parameter types as a tuple. `InstanceType<Type>` extracts the instance type from a constructor function type, so `InstanceType<typeof C>` gives the type of `new C()`. (source: typescript-reference-utility-types-2026.md)

## This-parameter utilities

`ThisParameterType<Type>` extracts the `this` parameter's type from a function type, or `unknown` if there is none. `OmitThisParameter<Type>` returns a new function type with the `this` parameter removed, useful when binding. Generics are erased and only the last overload propagates. (source: typescript-reference-utility-types-2026.md)

`ThisType<Type>` is a marker interface, not a type transformation. When used in an object literal's contextual type, it sets the type of `this` inside methods. Requires `noImplicitThis`. It is an empty interface in `lib.d.ts` that the compiler recognizes specially. (source: typescript-reference-utility-types-2026.md)

## Inference control

`NoInfer<Type>` (5.4+) blocks type inference at a specific position. The type itself is identical to `Type`, but the compiler will not use that position to infer `Type`. This forces inference to happen at other call sites, preventing unintended widening. For example, a `defaultColor` parameter marked `NoInfer<C>` forces `C` to be inferred only from the `colors` array, so invalid defaults become errors. (source: typescript-reference-utility-types-2026.md)

## Promise unwrapping

`Awaited<Type>` (4.5+) recursively unwraps `Promise` types, modeling the behavior of `await`. `Awaited<Promise<Promise<number>>>` resolves to `number`. It also distributes over unions: `Awaited<boolean | Promise<number>>` is `boolean | number`. (source: typescript-reference-utility-types-2026.md)

## Intrinsic string manipulation types

`Uppercase<StringType>`, `Lowercase<StringType>`, `Capitalize<StringType>`, and `Uncapitalize<StringType>` transform string literal types. These are compiler built-ins (not defined in `.d.ts` files) and are primarily used with [[typescript-type-system|template literal types]]. (source: typescript-reference-utility-types-2026.md)

## Related pages

- [[typescript-type-system]]
- [[typescript-generics]]
- [[typescript-classes]]
