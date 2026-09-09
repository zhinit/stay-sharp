# OpenTUI React Bindings

The `@opentui/react` package provides React components and hooks for building terminal UIs with OpenTUI. Requires React `>=19.2.0` (source: opentui-docs-react-bindings-2026.md).

## Setup

Bootstrap a project via `create-tui` or add packages to an existing project with Bun (source: opentui-docs-react-bindings-2026.md).

## Components

JSX intrinsic elements map to Core renderables using kebab-case naming: `<text>`, `<box>`, `<input>`, `<textarea>`, `<select>`, `<tab-select>`, `<scrollbox>`, `<code>`, `<markdown>`, `<diff>`, `<line-number>`, `<ascii-font>`, `<image>` (source: opentui-docs-react-bindings-2026.md, opentui-docs-components-overview-2026.md).

### Inline text elements

React registers `<span>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<br>`, and `<a>` as built-in text children. Use them only inside `<text>`. The `<a>` element accepts `href` and creates terminal hyperlink metadata (source: opentui-docs-components-overview-2026.md).

## Root creation

`createRoot(renderer)` adopts an existing renderer and provides `render()` and `unmount()` methods. The renderer implements `RenderContext`, so it integrates directly with the React reconciler (source: opentui-docs-react-bindings-2026.md).

## Hooks

| Hook | Purpose |
|------|---------|
| `useRenderer()` | Access the OpenTUI renderer instance |
| `useKeyboard()` | Handle keyboard events with optional release event support |
| `useOnResize()` | Monitor terminal resize |
| `useTerminalDimensions()` | Retrieve reactive dimension values |
| `usePaste()` | Manage bracketed paste operations |
| `useFocus()` | Subscribe to window focus state |
| `useBlur()` | Subscribe to window blur state |
| `useSelectionHandler()` | Capture text selection events |
| `useTimeline()` | Create [[opentui-animation|animation timelines]] with optional autoplay |

(source: opentui-docs-react-bindings-2026.md)

## Lifecycle

`root.unmount()` removes the React tree and runs effect cleanup while the renderer remains usable. It does not call `renderer.destroy()` (source: opentui-docs-lifecycle-2026.md).

`renderer.destroy()` emits the event that unmounts every React root created for that renderer. Both operations are safe when renderer destruction already unmounted the root (source: opentui-docs-lifecycle-2026.md).

Canonical cleanup pattern:

```typescript
const renderer = await createCliRenderer()
const root = createRoot(renderer)
try {
  root.render(<App />)
  await waitUntilShutdown()
} finally {
  try { root.unmount() }
  finally { renderer.destroy() }
}
```

(source: opentui-docs-lifecycle-2026.md)

## Testing

`testRender(node, options)` from `@opentui/react/test-utils` provides React-aware testing capabilities. The options object is required. It mounts with React `act()` and returns the Core `TestRendererSetup`. Renderer destruction unmounts the React root (source: opentui-docs-testing-2026.md).

## DevTools

React DevTools integration is available through `react-devtools-core` for component tree inspection during development (source: opentui-docs-react-bindings-2026.md).

## Components unavailable in React

`SliderRenderable`, `ScrollBarRenderable`, `FrameBufferRenderable`, `TextTableRenderable`, and `EmbeddedTerminalRenderable` are Core-only renderables with no React element mapping (source: opentui-docs-components-overview-2026.md).

## Related pages

- [[opentui]]
- [[opentui-solid]]
- [[opentui-components]]
- [[opentui-testing]]
- [[opentui-animation]]
