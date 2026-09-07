# TypeScript Standard Library

New built-in types and standard library additions across the TypeScript 5.x and 6.0 releases.

## Temporal API (6.0)

TypeScript 6.0 includes built-in types for the Temporal API, which reached TC39 stage 4. Available under `--target esnext` or `"lib": ["esnext"]` (or the granular `esnext.temporal`). (source: typescript-release-notes-6.0-2026.md)

The `Temporal` namespace includes: `Temporal.Instant` (absolute point in time), `Temporal.ZonedDateTime` (date/time with timezone), `Temporal.PlainDate`, `PlainTime`, `PlainDateTime` (civil date/time without timezone), `Temporal.PlainYearMonth`, `PlainMonthDay` (partial dates), `Temporal.Duration` (length of time), and `Temporal.Now` (clock access). (source: typescript-5-to-6-migration-guide-2026.md)

```ts
let yesterday = Temporal.Now.instant().subtract({ hours: 24 });
let tomorrow = Temporal.Now.instant().add({ hours: 24 });
```

Runtime support as of early 2026: Firefox 139+, Chrome 144+. Existing polyfills (`temporal-polyfill`, `@js-temporal/polyfill`) are not interassignable with the built-in types. (source: typescript-5-to-6-migration-guide-2026.md)

## Iterator helpers and IteratorObject (5.6)

TypeScript 5.6 added types for the ECMAScript iterator helpers proposal. Built-in iterators (from generators, `Map.keys()`, `Set.values()`, etc.) now have methods like `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every`, and `find`. (source: typescript-release-notes-5.6-2026.md)

A new `IteratorObject` type represents the runtime `Iterator` value (distinct from the existing `Iterator` protocol type). Subtypes include `ArrayIterator`, `SetIterator`, `MapIterator`. `AsyncIteratorObject` exists for parity with the async iterator helpers proposal. (source: typescript-release-notes-5.6-2026.md)

```ts
function* positiveIntegers() {
    let i = 1;
    while (true) { yield i; i++; }
}

const evenNumbers = positiveIntegers().map(x => x * 2);
for (const value of evenNumbers.take(5)) {
    console.log(value); // 2, 4, 6, 8, 10
}
```

(source: typescript-release-notes-5.6-2026.md)

A companion `--strictBuiltinIteratorReturn` flag (under `--strict`) uses `BuiltinIteratorReturn` to make `IteratorObject` return `undefined` instead of `any` when done, catching bugs where `.value` is accessed without checking `.done`. (source: typescript-release-notes-5.6-2026.md)

## Set methods (5.5)

TypeScript 5.5 declared new ECMAScript `Set` methods: `union`, `intersection`, `difference`, `symmetricDifference` (return new Sets), and `isSubsetOf`, `isSupersetOf`, `isDisjointFrom` (return booleans). None mutate the original Sets. (source: typescript-release-notes-5.5-2026.md)

```ts
let fruits = new Set(["apples", "bananas", "pears", "oranges"]);
let citrus = new Set(["oranges"]);
fruits.intersection(citrus); // Set {"oranges"}
citrus.isSubsetOf(fruits);   // true
```

These moved from `esnext` to `es2025` in TypeScript 6.0. (source: typescript-release-notes-6.0-2026.md)

## Map.getOrInsert / getOrInsertComputed (6.0)

The ECMAScript "upsert" proposal (stage 4) adds two methods to `Map` and `WeakMap`. Available in the `esnext` lib. (source: typescript-release-notes-6.0-2026.md)

`getOrInsert(key, defaultValue)` returns the existing value or inserts and returns `defaultValue`. `getOrInsertComputed(key, callback)` computes the default lazily via callback, only called if the key is absent. (source: typescript-release-notes-6.0-2026.md)

```ts
// Before: check-and-set pattern
if (!map.has(key)) { map.set(key, defaultValue); }
let val = map.get(key);

// After: one-liner
let val = map.getOrInsert(key, defaultValue);
```

(source: typescript-release-notes-6.0-2026.md)

## RegExp.escape (6.0)

The RegExp Escaping proposal (stage 4) adds `RegExp.escape()` for escaping special regex characters. Available in the `es2025` lib. (source: typescript-release-notes-6.0-2026.md)

```ts
const escaped = RegExp.escape("foo.bar+baz");
const regex = new RegExp(`\\b${escaped}\\b`, "g");
```

(source: typescript-release-notes-6.0-2026.md)

## es2025 target (6.0)

The `es2025` target adds no new JS language features but moves several declarations from `esnext` into `es2025`: `Promise.try`, iterator helper methods, Set methods (`union`, `intersection`, etc.), `Float16Array`, `Math.f16round`, `RegExp.escape`, and `Intl.DurationFormat`. (source: typescript-release-notes-6.0-2026.md)

## Inferred type predicates (5.5)

TypeScript 5.5 can infer type predicates from function bodies. A function that returns a boolean expression tied to a refinement on its parameter automatically gets an `x is T` return type. This makes `Array.prototype.filter` with narrowing functions work without explicit type predicate annotations. (source: typescript-release-notes-5.5-2026.md)

```ts
// Inferred as (bird: Bird | undefined) => bird is Bird
function isBirdReal(bird: Bird | undefined) {
    return bird !== undefined;
}

const birds = countries
    .map(c => nationalBirds.get(c))
    .filter(bird => bird !== undefined); // birds: Bird[]
```

Conditions for inference: no explicit return type annotation, single `return` statement, no implicit returns, no parameter mutation, returns a boolean tied to a refinement. Truthiness checks (`!!x`) do not infer predicates for primitive types because `false` does not guarantee the value is the excluded type (e.g., `0` is falsy but a valid `number`). (source: typescript-release-notes-5.5-2026.md)

## import defer (5.9)

TypeScript 5.9 added support for the ECMAScript deferred module evaluation proposal. `import defer * as feature from "./module.js"` loads the module but defers execution of its statements until a property of the namespace is accessed. Only namespace imports are allowed. Only works under `--module preserve` and `--module esnext`. (source: typescript-release-notes-5.9-2026.md)

```ts
import defer * as feature from "./expensive-feature.js";
// Module not executed yet
console.log(feature.value); // NOW it executes
```

(source: typescript-release-notes-5.9-2026.md)

## rewriteRelativeImportExtensions (5.7)

The `--rewriteRelativeImportExtensions` flag (5.7) rewrites relative `.ts` import paths to `.js` in output, enabling a workflow where source files use `.ts` extensions (for direct execution in Node.js, Deno, Bun) and the compiler rewrites them for the JS output. Only relative paths are rewritten; `paths`-based and package imports are not. (source: typescript-release-notes-5.7-2026.md)

## require() of ESM (5.8)

TypeScript 5.8 supports `require()` of ESM files under `--module nodenext`, matching Node.js 22 behavior. Node.js still does not permit `require()` on ESM files with top-level `await`. This support is not available under the stable `--module node18` option. (source: typescript-release-notes-5.8-2026.md)

## dom.iterable merged into dom (6.0)

The `dom.iterable` and `dom.asynciterable` lib files are now included in `dom`. You no longer need `"lib": ["dom", "dom.iterable"]`; just `"lib": ["dom"]` suffices. (source: typescript-release-notes-6.0-2026.md)

## Related pages

- [[typescript-migration-6]]
- [[typescript-type-system]]
- [[typescript-modules]]
- [[typescript-resource-management]]
