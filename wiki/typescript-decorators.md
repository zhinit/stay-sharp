# TypeScript Decorators

TypeScript supports two decorator implementations: the ECMAScript (stage 3) decorators introduced in TypeScript 5.0, and the older experimental (stage 2) decorators enabled by the `--experimentalDecorators` flag. New code should use ECMAScript decorators. (source: typescript-release-notes-5.0-2026.md)

## ECMAScript decorators

ECMAScript decorators are functions that receive the decorated value and a context object, and can optionally return a replacement value. They work on classes, methods, accessors, and fields. No compiler flag is needed. (source: typescript-release-notes-5.0-2026.md)

A method decorator receives the original method and a context object typed as `ClassMethodDecoratorContext`. Returning a function replaces the method. (source: typescript-release-notes-5.0-2026.md)

```ts
function loggedMethod(originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);
    function replacementMethod(this: any, ...args: any[]) {
        console.log(`LOG: Entering method '${methodName}'.`);
        const result = originalMethod.call(this, ...args);
        console.log(`LOG: Exiting method '${methodName}'.`);
        return result;
    }
    return replacementMethod;
}
```

The context object provides `name`, `kind`, `static`, `private`, `access`, and `addInitializer`. The `addInitializer` method hooks into the constructor (for instance members) or class initialization (for statics), useful for patterns like auto-binding methods. (source: typescript-release-notes-5.0-2026.md)

## Decorator factories

A decorator factory is a function that returns a decorator. This allows parameterization. (source: typescript-reference-decorators-2026.md)

```ts
function loggedMethod(headMessage = "LOG:") {
    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        // ...
        return replacementMethod;
    }
}

// Usage: @loggedMethod("⚠️")
```

When using a factory, the function must be called at the decorator site (`@loggedMethod("⚠️")`), unlike a bare decorator (`@loggedMethod`). (source: typescript-release-notes-5.0-2026.md)

## Composition and evaluation order

When multiple decorators apply to a single declaration, decorator expressions evaluate top-to-bottom (factories run in order), but the resulting decorator functions call bottom-to-top (like mathematical function composition). (source: typescript-reference-decorators-2026.md)

```
@f
@g
method() {}
// f factory evaluates, then g factory evaluates
// g decorator calls, then f decorator calls
```

## Class decorators

A class decorator receives the class itself (in ECMAScript decorators) or the constructor (in legacy decorators). It can return a replacement class. In legacy decorators, if returning a new constructor, you must manually maintain the original prototype. (source: typescript-reference-decorators-2026.md)

## Method decorators

In ECMAScript decorators, a method decorator receives the method function and a `ClassMethodDecoratorContext`. Returning a function replaces the method. (source: typescript-release-notes-5.0-2026.md)

In legacy decorators, a method decorator receives three arguments: the target (prototype or constructor), the property name, and the property descriptor. Returning a descriptor replaces it. (source: typescript-reference-decorators-2026.md)

## Accessor decorators

In legacy decorators, an accessor decorator receives the same three arguments as method decorators and applies to the property descriptor combining both `get` and `set`. TypeScript disallows decorating both accessors of the same member; decorate only the first one in document order. (source: typescript-reference-decorators-2026.md)

ECMAScript decorators support `auto-accessors` (the `accessor` keyword on class fields), which create a backing field with auto-generated getter/setter. (source: typescript-release-notes-5.0-2026.md)

## Property decorators

In legacy decorators, a property decorator receives two arguments: the target and the property name. No property descriptor is provided, and the return value is ignored. Property decorators can only observe that a property of a specific name has been declared. (source: typescript-reference-decorators-2026.md)

ECMAScript decorators support field decorators with access to the context object, allowing use of `addInitializer` for field-level setup. (source: typescript-release-notes-5.0-2026.md)

## Parameter decorators (legacy only)

Parameter decorators are only available with `--experimentalDecorators`. They receive the target, the method name, and the parameter's ordinal index. The return value is ignored. ECMAScript decorators do not support parameter decoration. (source: typescript-reference-decorators-2026.md, typescript-release-notes-5.0-2026.md)

## Legacy decorator evaluation order within a class

Under `--experimentalDecorators`, decorators within a class apply in this order (source: typescript-reference-decorators-2026.md):

1. Parameter decorators, then method/accessor/property decorators, for each instance member
2. Parameter decorators, then method/accessor/property decorators, for each static member
3. Parameter decorators for the constructor
4. Class decorators

## Decorator metadata

TypeScript 5.2 added support for the ECMAScript decorator metadata proposal. Decorator functions receive a `metadata` property on their context object, a plain object shared across all decorators on a class. After all decorators run, the metadata object is accessible on the class via `Symbol.metadata`. (source: typescript-release-notes-5.2-2026.md)

```ts
function setMetadata(_target: any, context: Context) {
    context.metadata[context.name] = true;
}

class SomeClass {
    @setMetadata foo = 123;
    @setMetadata baz() {}
}

SomeClass[Symbol.metadata]; // { foo: true, baz: true }
```

A `Symbol.metadata` polyfill is required for runtimes that do not yet support it natively. (source: typescript-release-notes-5.2-2026.md)

## Limitations

Decorators do not modify the TypeScript type of the decorated declaration. A class decorator that adds properties at runtime will not make those properties visible to the type system. (source: typescript-reference-decorators-2026.md)

ECMAScript decorators are not compatible with `--emitDecoratorMetadata` (the legacy `reflect-metadata` approach). (source: typescript-release-notes-5.0-2026.md)

## Differences between ECMAScript and legacy decorators

| Feature | ECMAScript (stage 3) | Legacy (`--experimentalDecorators`) |
|---|---|---|
| Compiler flag | None | `--experimentalDecorators` |
| Parameter decorators | No | Yes |
| `emitDecoratorMetadata` | No | Yes |
| Decorator metadata | `Symbol.metadata` | `reflect-metadata` library |
| Decorator placement with `export` | Before or after `export` | Before `export` only |
| Context object | `ClassMethodDecoratorContext` etc. | `(target, key, descriptor)` tuple |

(source: typescript-release-notes-5.0-2026.md, typescript-reference-decorators-2026.md)

## Well-typed decorators

A well-typed ECMAScript method decorator uses generics for `This`, `Args`, and `Return` (source: typescript-release-notes-5.0-2026.md):

```ts
function loggedMethod<This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
    function replacementMethod(this: This, ...args: Args): Return {
        const result = target.call(this, ...args);
        return result;
    }
    return replacementMethod;
}
```

## Related pages

- [[typescript-classes]]
- [[typescript-type-system]]
- [[typescript-project-config]]
