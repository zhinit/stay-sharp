# TypeScript Classes

## Class members

A field declaration creates a public writeable property. Fields can have initializers that run when the class is instantiated, and the initializer's value is used to infer the field's type. Methods use the same type annotations as functions. Getters and setters (accessors) follow special inference rules: a getter without a setter makes the property `readonly`, and the setter's parameter type is inferred from the getter's return type. Since TypeScript 4.3, getters and setters can have different types. (source: typescript-handbook-classes-2026.md)

## readonly modifier

Fields prefixed with `readonly` can only be assigned in the constructor. The modifier is shallow: it prevents reassigning the property itself, but the object's internal contents remain mutable. TypeScript does not factor in `readonly` when checking structural compatibility between types, so a `readonly` property can be mutated through a mutable alias. (source: typescript-handbook-object-types-2026.md)

## implements vs extends

An `implements` clause checks that a class satisfies an interface but does not change the class's type or infer parameter types from the interface. A method parameter without a type annotation stays `any` even when the interface specifies a type for that parameter. Implementing an interface with an optional property does not create that property on the class. (source: typescript-handbook-classes-2026.md)

`extends` creates class inheritance. A derived class has all properties and methods of its base class. TypeScript enforces that a derived class is always a subtype of its base class, so overriding methods must have compatible signatures. (source: typescript-handbook-classes-2026.md)

## Visibility modifiers

`public` is the default visibility. `protected` members are visible to subclasses but not external code. TypeScript disallows cross-hierarchy `protected` access: a `Derived2` cannot access a `protected` member through a `Derived1` reference. (source: typescript-handbook-classes-2026.md)

TypeScript's `private` keyword is "soft private": it is enforced during type checking only. Bracket notation (`obj["secretKey"]`) bypasses the check, and the modifier compiles away entirely. Cross-instance `private` access is allowed (one instance can read another instance's `private` fields of the same class). (source: typescript-handbook-classes-2026.md)

JavaScript's native `#private` fields are "hard private": they remain private after compilation and cannot be accessed via bracket notation. When targeting ES2021 or below, TypeScript emits WeakMaps in place of `#` fields. (source: typescript-handbook-classes-2026.md)

## Parameter properties

Prefixing a constructor parameter with `public`, `protected`, `private`, or `readonly` creates a class property with the same name and value. This is a TypeScript-only shorthand that combines declaration and assignment. (source: typescript-handbook-classes-2026.md)

```ts
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {}
}
```

## Abstract classes

An `abstract` class cannot be instantiated directly. Abstract methods and fields have no implementation and must be provided by concrete subclasses. To accept a constructor for any concrete subclass, use a construct signature (`new () => Base`) rather than `typeof Base`, which would allow passing the abstract class itself. (source: typescript-handbook-classes-2026.md)

## Initialization order

JavaScript class initialization runs in this order: (source: typescript-handbook-classes-2026.md)

1. Base class fields are initialized
2. Base class constructor runs
3. Derived class fields are initialized
4. Derived class constructor runs

This means the base class constructor sees its own field values, not derived overrides. A derived class that re-declares a field will overwrite the base class value after the base constructor completes. When `target >= ES2022` or `useDefineForClassFields` is `true`, use `declare` on a field to re-declare a type without emitting a runtime assignment that would overwrite the base class value. (source: typescript-handbook-classes-2026.md)

## Static members

Static members belong to the class constructor, not instances. They support the same visibility modifiers and are inherited by subclasses. Static members cannot reference the class's type parameters because types are erased at runtime, and there is only one slot per static property shared across all generic instantiations. Function prototype properties like `name`, `length`, and `call` cannot be used as static member names. (source: typescript-handbook-classes-2026.md)

Static blocks allow initialization code with access to private fields and their own scope. (source: typescript-handbook-classes-2026.md)

## Structural typing for classes

Classes are compared structurally. Two classes with the same shape are interchangeable regardless of inheritance. An empty class has no members, making it a supertype of everything in the structural type system. (source: typescript-handbook-classes-2026.md)

## this types and this-based type guards

In classes, the type `this` refers dynamically to the current class. When a method returns `this`, a subclass inheriting that method gets the subclass type as the return type, enabling fluent/chainable APIs. Using `this` as a parameter type means the method only accepts instances of the same class (or subclass). (source: typescript-handbook-classes-2026.md)

Methods can use `this is Type` as a return type to act as type guards. After calling such a method in a conditional, the object is narrowed to the specified type. A common pattern is lazy validation: `hasValue(): this is { value: T }` narrows away `undefined` from an optional field. (source: typescript-handbook-classes-2026.md)

## this at runtime

JavaScript's `this` depends on how a function is called, not where it is defined. Arrow function properties capture `this` from the enclosing scope, guaranteeing correctness at the cost of one function copy per instance and loss of `super` access. A `this` parameter (e.g. `getName(this: MyClass)`) is erased at compile time but adds static checking that the method is called with the correct context. (source: typescript-handbook-classes-2026.md)

## Related pages

- [[typescript-type-system]] -- narrowing, type guards
- [[typescript-generics]] -- generic classes
- [[typescript-decorators]] -- class and method decorators
- [[typescript-project-config]] -- strictPropertyInitialization, useDefineForClassFields
