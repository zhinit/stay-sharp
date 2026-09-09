# OpenTUI Solid Bindings

The `@opentui/solid` package provides Solid components and reactive primitives for building terminal UIs with OpenTUI. Requires `solid-js` 1.9.12 exactly (source: opentui-docs-solid-bindings-2026.md).

## Setup

Configuration requires three steps (source: opentui-docs-solid-bindings-2026.md):

1. Add JSX settings to TypeScript config.
2. Configure Bun with a preload script.
3. For Node environments, implement Babel compilation with specific module resolution for Solid's universal transform.

Install with `bun install solid-js @opentui/solid` (source: opentui-docs-solid-bindings-2026.md).

## Components

Solid uses snake_case element names: `<text>`, `<box>`, `<input>`, `<textarea>`, `<select>`, `<tab_select>`, `<scrollbox>`, `<code>`, `<markdown>`, `<ascii_font>`, `<image>`. This differs from React's kebab-case (`tab-select`, `ascii-font`) (source: opentui-docs-solid-bindings-2026.md, opentui-docs-components-overview-2026.md).

Inline text elements (`<span>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<br>`, `<a>`) work the same as in React (source: opentui-docs-components-overview-2026.md).

### Typing limitations

`<line_number>` and `<diff>` are runtime built-in but the Solid binding lacks exact props declarations for them (source: opentui-docs-components-overview-2026.md).

`<qr_code>` requires separate registration from `@opentui/qrcode/solid` (source: opentui-docs-components-overview-2026.md).

## Rendering

The primary `render(component, rendererOrConfig?)` function resolves after mounting. It returns no root handle and no disposer. If Solid creates the renderer from a config object, application code can get it through `useRenderer()` (source: opentui-docs-solid-bindings-2026.md).

`extend()` registers custom components. `getComponentCatalogue()` accesses the component registry (source: opentui-docs-solid-bindings-2026.md).

### Special components

`Portal` renders outside the standard hierarchy. `Dynamic` enables conditional element rendering based on reactive state (source: opentui-docs-solid-bindings-2026.md).

## Hooks

| Hook | Purpose |
|------|---------|
| `useRenderer()` | Access the renderer instance |
| `useKeyboard()` | Handle keyboard events |
| `useTerminalDimensions()` | Reactive terminal dimensions |
| `usePaste()` | Bracketed paste events |
| `useSelectionHandler()` | Text selection events |
| `useTimeline()` | [[opentui-animation|Animation]] scheduling during setup |

Lifecycle hooks: `onResize`, `onFocus`, `onBlur` for terminal events (source: opentui-docs-solid-bindings-2026.md).

## Lifecycle

Renderer destruction disposes the Solid root and runs `onCleanup` callbacks (source: opentui-docs-lifecycle-2026.md).

Canonical cleanup pattern:

```typescript
const renderer = await createCliRenderer()
try {
  await render(() => <App />, renderer)
  await waitUntilShutdown()
} finally {
  renderer.destroy()
}
```

(source: opentui-docs-lifecycle-2026.md)

## Testing

`testRender(node, options?)` from `@opentui/solid` mounts a Solid root and returns the Core `TestRendererSetup`. Renderer destruction disposes the root and runs Solid cleanup. The options object is optional, unlike the React equivalent (source: opentui-docs-testing-2026.md, opentui-docs-solid-bindings-2026.md).

## Components unavailable in Solid

`SliderRenderable`, `ScrollBarRenderable`, `FrameBufferRenderable`, `TextTableRenderable`, and `EmbeddedTerminalRenderable` are Core-only renderables with no Solid element mapping (source: opentui-docs-components-overview-2026.md).

## Related pages

- [[opentui]]
- [[opentui-react]]
- [[opentui-components]]
- [[opentui-testing]]
- [[opentui-animation]]
