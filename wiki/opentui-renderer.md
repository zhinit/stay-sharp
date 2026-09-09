# OpenTUI Renderer

`CliRenderer` owns one terminal session, its root renderable, frame scheduling, input parsing, and native output boundary (source: opentui-docs-renderer-2026.md).

## Creating a renderer

`createCliRenderer()` runs asynchronous terminal setup and returns a `CliRenderer`. The returned renderer has a `root` property. The renderer implements `RenderContext`, so imperative renderables receive the renderer as their first constructor argument (source: opentui-docs-renderer-2026.md).

```typescript
import { TextRenderable, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
})

renderer.root.add(new TextRenderable(renderer, { content: "Hello" }))
```

Prefer `createCliRenderer()` over direct `new CliRenderer(...)` construction. The factory destroys a constructed renderer if asynchronous terminal setup fails (source: opentui-docs-lifecycle-2026.md).

## Screen modes

`screenMode` controls which terminal area OpenTUI owns (source: opentui-docs-renderer-2026.md):

| Mode | Behavior |
|------|----------|
| `"alternate-screen"` | Default. Uses the alternate screen and restores the main screen on exit. |
| `"main-screen"` | Uses a reserved region on the main screen. |
| `"split-footer"` | Uses a footer on the main screen. `footerHeight` defaults to 12, capped to terminal height. |

In split-footer mode, `renderer.width` and `renderer.height` describe the footer render region. `terminalWidth` and `terminalHeight` describe the complete terminal (source: opentui-docs-renderer-2026.md).

## External output

`externalOutputMode` controls application writes through the configured `stdout.write` path (source: opentui-docs-renderer-2026.md):

- `"passthrough"` is the default outside split-footer mode.
- `"capture-stdout"` is the split-footer default and is valid only in that mode.
- Captured writes become ordered scrollback commits above the footer.

## Custom streams

Set `stdin` and `stdout` for an SSH channel, pseudo-terminal, or another transport. Initial dimensions use `stdout.columns` and `stdout.rows`, then `width` and `height`, then 80 by 24 (source: opentui-docs-renderer-2026.md).

Call `renderer.resize(width, height)` when a custom terminal changes size. OpenTUI listens for `SIGWINCH` only when it uses `process.stdout` (source: opentui-docs-renderer-2026.md).

A feed-backed custom `stdout` defaults to `remote: true`. Set `forwardEnvKeys` only for values that the remote terminal should inherit (source: opentui-docs-renderer-2026.md).

## Render scheduling

The initial control state is demand-driven. Tree mutations call `requestRender()` and schedule a one-shot frame (source: opentui-docs-renderer-2026.md).

Call `start()` for continuous rendering. `targetFps` controls its steady rate, and `maxFps` caps immediate extra frames. `pause()` stops continuous rendering and enters `EXPLICIT_PAUSED`. Later mutations can still request one-shot frames (source: opentui-docs-renderer-2026.md).

`requestLive()` and `dropLive()` are balanced ownership calls for custom loops. The first live request starts an idle renderer. The final drop returns an auto-started renderer to demand-driven mode. A registered `Timeline` owns its live request when the timeline engine is attached (source: opentui-docs-renderer-2026.md).

`suspend()` releases active terminal input modes and stops rendering. `resume()` restores the prior control state (source: opentui-docs-renderer-2026.md).

## Capability detection

Capability detection continues after `createCliRenderer()` returns. The first snapshot includes environment heuristics, but terminal replies arrive asynchronously. OpenTUI accepts startup capability replies for five seconds. Snapshots can change several times in that window (source: opentui-docs-renderer-2026.md).

Most capability fields are booleans. `false` can mean unsupported or not detected yet. Treat the `capabilities` event as the source of updated snapshots (source: opentui-docs-renderer-2026.md).

```typescript
import { CliRenderEvents, type TerminalCapabilities } from "@opentui/core"

renderer.on(CliRenderEvents.CAPABILITIES, (capabilities: TerminalCapabilities) => {
  console.log(capabilities.kitty_graphics)
})
```

## Central events

Use `renderer.on(event, listener)` and remove with `off()` (source: opentui-docs-renderer-2026.md):

| Event | Payload | Meaning |
|-------|---------|---------|
| `resize` | `(width, height)` | Render region changed |
| `frame` | `{ frameId }` | Native renderer published a frame |
| `render:error` | `{ error, renderable }` | Render pass threw |
| `handler:error` | `{ error, event }` | Mouse handler threw |
| `external_output` | `CliRendererExternalOutputEvent` | Split-footer output queued |
| `focus`, `blur` | none | Terminal window focus or blur |
| `focused_renderable` | `(current, previous)` | Renderable keyboard focus changed |
| `focused_editor` | `(current, previous)` | Focus moved to/from an editor |
| `theme_mode` | `"dark" \| "light"` | Detected terminal theme changed |
| `palette` | `TerminalColors` | Terminal palette changed |
| `capabilities` | `TerminalCapabilities` | Capability snapshot changed |
| `selection` | `Selection` | Text selection drag finished |
| `debugOverlay:toggle` | `boolean` | Debug overlay visibility changed |
| `memory:snapshot` | memory totals | Memory sample collected |
| `destroy` | none | Destruction started cleanup stage |

The `focus` and `blur` events describe terminal-window focus. They do not focus or blur a renderable (source: opentui-docs-renderer-2026.md).

## Renderer-owned services

The renderer exposes terminal and application services (source: opentui-docs-renderer-2026.md):

- Clipboard: host clipboard access and OSC 52
- Notifications: terminal notification protocols
- Console overlay: captured logs and overlay behavior

## Destruction

`renderer.destroy()` is synchronous and idempotent. It marks the renderer as destroyed before cleanup starts (source: opentui-docs-lifecycle-2026.md).

Destruction performs these actions: removes signal/process/resize/input listeners, stops timers and frame scheduling, disables raw input, flushes split-footer output, emits the `destroy` event, destroys the renderable tree and native renderer, releases stream ownership, and calls `onDestroy`. The native shutdown sequence resets text attributes, mouse pointer, disables mouse/focus/paste/keyboard modes, exits alternate screen, resets terminal title and cursor, and shows the cursor (source: opentui-docs-lifecycle-2026.md).

`clearOnShutdown: false` keeps the main-screen region visible but does not skip terminal mode restoration (source: opentui-docs-lifecycle-2026.md).

## Signal handling

By default, each renderer installs handlers that call `renderer.destroy()` for these signals (source: opentui-docs-lifecycle-2026.md):

| Signal | Description |
|--------|-------------|
| `SIGINT` | Ctrl+C |
| `SIGTERM` | Termination signal |
| `SIGQUIT` | Ctrl+\ |
| `SIGABRT` | Abort signal |
| `SIGHUP` | Hangup (terminal closed) |
| `SIGBREAK` | Ctrl+Break on Windows |
| `SIGPIPE` | Broken pipe |
| `SIGBUS` | Bus error |

Set `exitSignals` to replace this list. Use an empty list when the application owns process shutdown. Set `exitOnCtrlC: false` and remove `SIGINT` from `exitSignals` when your application handles both paths itself (source: opentui-docs-lifecycle-2026.md).

## Framework root lifecycle

**React**: `createRoot(renderer)` adopts a renderer but does not own it. `root.unmount()` removes the React tree and runs effect cleanup while the renderer remains usable. `renderer.destroy()` emits the event that unmounts every React root (source: opentui-docs-lifecycle-2026.md).

**Solid**: `render(node, rendererOrConfig?)` resolves after mounting. It returns no root handle and no disposer. Renderer destruction disposes the Solid root and runs `onCleanup` callbacks. Create the renderer yourself when startup and failure cleanup need one visible owner (source: opentui-docs-lifecycle-2026.md).

## Related pages

- [[opentui]] -- Overview and quickstart
- [[opentui-renderables]] -- Tree nodes and layout
- [[opentui-input]] -- Keyboard, mouse, focus
- [[opentui-animation]] -- Timeline engine attaches to renderer
- [[opentui-testing]] -- Test renderer
- [[opentui-env-vars]] -- Environment configuration
