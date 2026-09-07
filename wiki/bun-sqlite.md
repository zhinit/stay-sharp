# Bun SQLite

[[bun|Bun]] ships a high-performance SQLite3 driver via the `bun:sqlite` module. The implementation is roughly 3-6x faster than better-sqlite3 and uses a synchronous API by design (source: bun-docs-sqlite-2026.md).

## Database class

Create a database connection with `new Database(filename, options)` (source: bun-docs-sqlite-2026.md):

```typescript
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite");
```

Constructor options include `readonly`, `create`, `readwrite`, `safeIntegers` (returns `bigint` for large integers), and `strict` (requires parameter prefixes by default) (source: bun-docs-sqlite-2026.md).

Key methods on the Database instance (source: bun-docs-sqlite-2026.md):

- `query(sql)` returns a cached, prepared Statement (preferred for repeated queries)
- `prepare(sql)` returns a fresh, uncached Statement
- `run(sql, params)` executes a statement and returns `{lastInsertRowid, changes}`
- `transaction(fn)` wraps a function for atomic execution
- `close(throwOnError)` closes the connection
- `serialize()` returns a `Uint8Array` snapshot of the entire database
- `loadExtension(name)` loads a SQLite extension

## Statement execution

Statements offer multiple execution methods depending on the desired output (source: bun-docs-sqlite-2026.md):

- `.get(params)` returns the first row as an object
- `.all(params)` returns all rows as an array of objects
- `.run(params)` returns only metadata (lastInsertRowid, changes)
- `.values(params)` returns rows as arrays instead of objects
- `.iterate(params)` streams rows one at a time via an iterator
- `.as(Class)` maps result rows to instances of a class

Metadata properties: `.columnNames`, `.columnTypes`, `.declaredTypes`, `.paramsCount` (source: bun-docs-sqlite-2026.md).

## Parameters and binding

Three parameter styles are supported: positional (`?1`), and named (`$param`, `:param`, `@param`). With `strict: true` on the Database, the prefix can be omitted in the parameter object (source: bun-docs-sqlite-2026.md):

```typescript
db.query("SELECT $msg").all({ $msg: "hello" });
db.query("SELECT ?1, ?2").all("a", "b");
```

## Transactions

Transactions guarantee atomicity: all operations succeed or none do (source: bun-docs-sqlite-2026.md):

```typescript
const insertCats = db.transaction(cats => {
  for (const cat of cats) insert.run(cat);
});
insertCats([{ name: "Keanu" }, { name: "Salem" }]);
```

Transaction variants control locking behavior: `.deferred()`, `.immediate()`, `.exclusive()` (source: bun-docs-sqlite-2026.md). Nested transactions automatically become savepoints.

## WAL mode

Write-ahead logging dramatically improves concurrent access. Enable with `db.run("PRAGMA journal_mode = WAL;")` (source: bun-docs-sqlite-2026.md).

## Type mappings

| JavaScript | SQLite |
|-----------|--------|
| `string` | TEXT |
| `number` | INTEGER or DECIMAL |
| `boolean` | INTEGER (1 or 0) |
| `Uint8Array` | BLOB |
| `bigint` | INTEGER |
| `null` | NULL |

(source: bun-docs-sqlite-2026.md)

## ES module import

Databases can be imported directly as ES modules (source: bun-docs-sqlite-2026.md):

```typescript
import db from "./mydb.sqlite" with { type: "sqlite" };
```

The `using` statement integrates with the TC39 explicit resource management proposal, automatically calling `close(true)` when the database goes out of scope (source: bun-docs-sqlite-2026.md).

**Related pages:** [[bun]], [[bun-runtime]], [[bun-file-io]]
