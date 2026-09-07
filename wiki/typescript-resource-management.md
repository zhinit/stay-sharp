# TypeScript Resource Management

TypeScript 5.2 added support for the ECMAScript Explicit Resource Management proposal, introducing `using` declarations for automatic cleanup of resources at scope exit. (source: typescript-release-notes-5.2-2026.md)

## using declarations

The `using` keyword declares a binding whose `Symbol.dispose` method is called automatically when the enclosing scope exits, whether by normal flow, early return, or thrown error. (source: typescript-release-notes-5.2-2026.md)

```ts
class TempFile implements Disposable {
    #path: string;
    #handle: number;

    constructor(path: string) {
        this.#path = path;
        this.#handle = fs.openSync(path, "w+");
    }

    [Symbol.dispose]() {
        fs.closeSync(this.#handle);
        fs.unlinkSync(this.#path);
    }
}

function doSomeWork() {
    using file = new TempFile(".some_temp_file");
    // file is automatically closed and deleted at scope exit
}
```

`Disposable` is a global type provided by TypeScript describing any object with a `[Symbol.dispose]()` method. (source: typescript-release-notes-5.2-2026.md)

## Disposal order

Multiple `using` declarations dispose in last-in-first-out (stack) order. Nested block scopes dispose at their own block exit. (source: typescript-release-notes-5.2-2026.md)

```ts
function func() {
    using a = loggy("a");
    using b = loggy("b");
    {
        using c = loggy("c");
        using d = loggy("d");
    }  // d disposes, then c
    using e = loggy("e");
    return;
}  // e, b, a dispose in that order
```

## Error handling

If both the function body and a `Symbol.dispose` method throw, a `SuppressedError` is raised. Its `error` property holds the most recently thrown error (from disposal), and its `suppressed` property holds the earlier error (from the function body). (source: typescript-release-notes-5.2-2026.md)

## await using

`await using` declares a binding whose `Symbol.asyncDispose` method is awaited at scope exit. The enclosing function must be `async`. `AsyncDisposable` is the corresponding global type. An `await using` binding also accepts objects with only `Symbol.dispose` (sync disposal). (source: typescript-release-notes-5.2-2026.md)

```ts
async function func() {
    await using conn = openDatabaseConnection();
    // conn[Symbol.asyncDispose]() is awaited at scope exit
}
```

## DisposableStack and AsyncDisposableStack

`DisposableStack` collects multiple disposal callbacks and is itself `Disposable`. Useful for ad-hoc cleanup without creating a new class. (source: typescript-release-notes-5.2-2026.md)

```ts
function doSomeWork() {
    const path = ".some_temp_file";
    const file = fs.openSync(path, "w+");

    using cleanup = new DisposableStack();
    cleanup.defer(() => {
        fs.closeSync(file);
        fs.unlinkSync(path);
    });

    // file is cleaned up at scope exit
}
```

Key methods (source: typescript-release-notes-5.2-2026.md):

- `defer(callback)` registers an arbitrary cleanup function
- `use(disposable)` adds a `Disposable` to the stack and returns it
- `adopt(value, onDispose)` registers a value and its cleanup function

`AsyncDisposableStack` is the async counterpart, accepting `async` functions and `AsyncDisposable` objects.

## Configuration

Requires `target` of `es2022` or below, with `lib` including `"esnext"` or `"esnext.disposable"`. Most runtimes need polyfills for `Symbol.dispose`, `Symbol.asyncDispose`, `DisposableStack`, `AsyncDisposableStack`, and `SuppressedError`. Minimal polyfill for `using`/`await using` only (source: typescript-release-notes-5.2-2026.md):

```ts
Symbol.dispose ??= Symbol("Symbol.dispose");
Symbol.asyncDispose ??= Symbol("Symbol.asyncDispose");
```

## Related pages

- [[typescript-classes]]
- [[typescript-project-config]]
