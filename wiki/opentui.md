# OpenTUI

A native terminal UI core written in Zig with TypeScript bindings. Renders a component tree, lays it out with Flexbox (Yoga), handles terminal input, and updates only the cells that changed (source: opentui-docs-overview-2026.md).

## Framework options

Three approaches to building with OpenTUI (source: opentui-docs-overview-2026.md):

- **@opentui/core** -- Imperative API using renderables and events directly.
- **@opentui/react** -- React component model with hooks and state management. Requires React >=19.2.0 (source: opentui-docs-runtime-support-2026.md).
- **@opentui/solid** -- SolidJS signal-based reactivity. Requires solid-js exactly 1.9.12 (source: opentui-docs-runtime-support-2026.md).

## Packages

(source: opentui-github-readme-2026.md)

| Package | Purpose |
|---------|---------|
| @opentui/core | Core native library with imperative API |
| @opentui/react | React reconciler |
| @opentui/solid | SolidJS reconciler |
| @opentui/keymap | Key binding and command routing library |
| @opentui/qrcode | QR code encoding and rendering |
| @opentui/three | Three.js WebGPU integration |
| @opentui/ssh | SSH server support |

## Runtime requirements

Bun 1.3.0+ (1.4.0+ on Windows arm64) or Node.js 26.4.0+ with `--experimental-ffi` and ESM (source: opentui-docs-runtime-support-2026.md). Development of OpenTUI itself requires Zig 0.16.0 (source: opentui-github-readme-2026.md).

Pre-built native packages are published for macOS (x64, arm64), Linux glibc (x64, arm64), Linux musl (x64, arm64), and Windows (x64, arm64) (source: opentui-docs-runtime-support-2026.md).

Node.js requires ESM. A CommonJS `require("@opentui/core")` call fails with `ERR_REQUIRE_ASYNC_MODULE` (source: opentui-docs-runtime-support-2026.md).

## Quickstart

(source: opentui-docs-quickstart-2026.md)

```bash
mkdir my-tui && cd my-tui
bun init -y
bun add @opentui/core
```

A counter controlled by arrow keys:

```typescript
import { BoxRenderable, TextRenderable, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  backgroundColor: "#1131E9",
})

let count = 0
const counter = new TextRenderable(renderer, {
  id: "counter",
  content: "Count  0",
  fg: "#FFFFFF",
})

const panel = new BoxRenderable(renderer, {
  width: 42,
  height: 9,
  backgroundColor: "#1131E9",
  alignItems: "center",
  justifyContent: "center",
})
const content = new BoxRenderable(renderer, {
  width: 38,
  height: 7,
  backgroundColor: "#2947F0",
  padding: 1,
  flexDirection: "column",
  gap: 1,
  alignItems: "center",
})

content.add(new TextRenderable(renderer, { content: "Hello, OpenTUI!", fg: "#DCE3FF" }))
content.add(counter)
content.add(new TextRenderable(renderer, { content: "left/right change | q quit", fg: "#AEBBFF" }))
panel.add(content)
renderer.root.add(panel)

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "q") {
    renderer.destroy()
    return
  }

  if (key.name === "left") count--
  else if (key.name === "right") count++
  else return

  counter.content = `Count  ${count}`
})
```

`createCliRenderer()` takes control of the terminal and returns a `CliRenderer`. Its `root` property is the root of the component tree. `BoxRenderable` and `TextRenderable` are imperative tree nodes. Modifying `counter.content` schedules a new frame automatically (source: opentui-docs-quickstart-2026.md).

The application must call `renderer.destroy()` on every shutdown path to release resources and restore the terminal (source: opentui-docs-quickstart-2026.md).

## Additional capabilities

Supports sounds, images, and 3D graphics rendering in the terminal. Includes testing utilities for memory-based rendering, plugin extensibility, and deployment to standalone executables (source: opentui-github-readme-2026.md, opentui-docs-overview-2026.md).

## Production use

Powers OpenCode for millions of users (source: opentui-github-readme-2026.md).

## License

MIT (source: opentui-github-readme-2026.md).

## Related pages

- [[opentui-renderer]] -- Renderer creation, screen modes, events, lifecycle, destruction
- [[opentui-renderables]] -- Imperative tree nodes, layout system, Yoga flexbox
- [[opentui-components]] -- Component catalog with availability across Core/React/Solid
- [[opentui-input]] -- Keyboard, mouse, focus, and text selection
- [[opentui-styling]] -- Colors, RGBA, text styling, terminal palette intent
- [[opentui-react]] -- React bindings, hooks, testing
- [[opentui-solid]] -- Solid bindings, hooks, testing
- [[opentui-testing]] -- Test renderer, mock input/mouse, frame capture
- [[opentui-keymap]] -- Layered key bindings, commands, sequences
- [[opentui-animation]] -- Timeline API, easing, global engine
- [[opentui-env-vars]] -- Environment variable configuration
- [[js-tui-landscape]]
