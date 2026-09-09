# OpenTUI Testing

OpenTUI provides `@opentui/core/testing` with a real `CliRenderer` backed by native in-memory output. The default setup does not write frames to the host terminal (source: opentui-docs-testing-2026.md).

## Testing strategy

Five levels, from cheapest to most integrated (source: opentui-docs-testing-2026.md):

1. Test parsers, state transitions, and other pure logic without a renderer.
2. Use `createTestRenderer()` for renderable interaction, frame text, styled spans, and native cell updates.
3. Test destruction, setup failure, partial initialization, and repeated cleanup for every resource owner.
4. Use the React or Solid test utility when framework effects and reconciliation are part of the behavior.
5. Use `@opentui/keymap/testing` for [[opentui-keymap]] layers, addons, focus, dispatch, and diagnostics without a terminal renderer.

## Test renderer

`createTestRenderer(options)` requires an options object. `TestRendererOptions` extends `CliRendererConfig` and adds `width`, `height`, `kittyKeyboard`, and `otherModifiersMode`. The helper constructs `CliRenderer` directly without calling `createCliRenderer()` or `setupTerminal()`. The default mock stdin has no `setRawMode()`, so tests do not change host raw mode (source: opentui-docs-testing-2026.md).

```typescript
import { createTestRenderer } from "@opentui/core/testing"
import { TextRenderable } from "@opentui/core"

const setup = await createTestRenderer({ width: 40, height: 10 })
try {
  setup.renderer.root.add(new TextRenderable(setup.renderer, { content: "Hello" }))
  await setup.renderOnce()
  console.log(setup.captureCharFrame())
} finally {
  setup.renderer.destroy()
}
```

Tests own cleanup. Always call `setup.renderer.destroy()` in `finally` or test teardown (source: opentui-docs-testing-2026.md).

## Setup defaults

| Setting | Test default |
|---------|-------------|
| `screenMode` | `"main-screen"` |
| `footerHeight` | `12` |
| `consoleMode` | `"disabled"` |
| `externalOutputMode` | `"passthrough"` |
| `bufferedOutput` | `"memory"` |
| width | `options.width`, custom `stdout.columns`, host `process.stdout.columns`, then `80` |
| height | `options.height`, custom `stdout.rows`, host `process.stdout.rows`, then `24` |

(source: opentui-docs-testing-2026.md)

## Returned setup members

| Member | Behavior |
|--------|----------|
| `renderer` | The `CliRenderer` instance |
| `mockInput` | Keyboard driver created by `createMockKeys()` |
| `mockMouse` | SGR mouse driver created by `createMockMouse()` |
| `renderOnce()` | Wait for feed backpressure, then run one renderer loop pass |
| `flush(options?)` | Call `waitForVisualIdle()` with `maxPasses` as frame limit (default 20) |
| `waitFor(predicate, options?)` | Check a sync or async predicate while scheduled rendering can progress |
| `waitForFrame(predicate, options?)` | Check captured text while rendering progresses, return matching frame |
| `waitForVisualIdle(options?)` | Wait for no scheduled work or consecutive zero-cell-update frames |
| `captureCharFrame()` | Decode the current character buffer as text |
| `captureSpans()` | Return `{ cols, rows, cursor: [x, y], lines }` with styled spans |
| `externalOutput` | Recorder for split-footer external-output commits |
| `getNativeStats()` | Return current native render stats |
| `resize(width, height)` | Invoke the renderer's test resize path |

(source: opentui-docs-testing-2026.md)

## Waiting for output

`renderOnce()` always starts one loop pass, even with no pending work. Use it for explicit control. Use `waitForFrame()` when application work schedules rendering asynchronously. `waitFor()` and `waitForFrame()` check the current state before the first wait, and can evaluate their predicate `maxPasses + 1` times. They stop early when the scheduler has no work (source: opentui-docs-testing-2026.md).

| Helper | Options | Default bound |
|--------|---------|---------------|
| `flush()` | `{ maxPasses }` | 20 frames |
| `waitFor()` | `{ maxPasses }` | 20 waits |
| `waitForFrame()` | `{ maxPasses }` | 20 waits |
| `waitForVisualIdle()` | `{ quietFrames, maxFrames }` | 1, 20 |

(source: opentui-docs-testing-2026.md)

## Frame capture

`captureCharFrame()` decodes the current character buffer for text assertions and snapshots. `captureSpans()` preserves dimensions, cursor coordinates, and each line's styled spans (source: opentui-docs-testing-2026.md).

## External output

The setup records `external_output` events with `text`, `rows`, snapshot `width` and `height`, `rowColumns`, `startOnNewLine`, and `trailingNewline` (source: opentui-docs-testing-2026.md).

| Method | Behavior |
|--------|----------|
| `externalOutput.take()` | Return all commits and clear |
| `externalOutput.takeText()` | Consume all commits and join rows with newlines |
| `externalOutput.clear()` | Discard all commits |

## Keyboard input (MockInput)

`createTestRenderer()` exposes its keyboard driver as `mockInput`. Use `createMockKeys(renderer, options?)` with an existing renderer (source: opentui-docs-testing-2026.md).

| Method | Behavior |
|--------|----------|
| `pressKey(key, modifiers?)` | Emit one key synchronously |
| `pressKeys(keys, delayMs = 0)` | Emit several raw key inputs, optionally delayed |
| `typeText(text, delayMs = 0)` | Emit each item from `text.split("")` |
| `pressEnter(modifiers?)` | Emit return |
| `pressEscape(modifiers?)` | Emit escape |
| `pressTab(modifiers?)` | Emit tab (Shift+Tab uses back-tab sequence) |
| `pressBackspace(modifiers?)` | Emit backspace |
| `pressArrow(direction, modifiers?)` | Emit up/down/left/right |
| `pressCtrlC()` | Emit Ctrl+C |
| `pasteBracketedText(text)` | Emit bracketed-paste start, content, and end |

Modifiers: `shift`, `ctrl`, `meta`, `super`, `hyper`. `KeyCodes` contains return, linefeed, tab, backspace, delete, home, end, escape, four arrows, and F1-F12. `typeText()` splits JavaScript UTF-16 code units; use bracketed paste for multi-code-unit graphemes (source: opentui-docs-testing-2026.md).

## Mouse input (MockMouse)

`mockMouse` emits SGR mouse sequences through renderer stdin. Test coordinates are zero-based (source: opentui-docs-testing-2026.md).

Operations: `moveTo`, `click`, `doubleClick`, `pressDown`, `release`, `drag`, `scroll`, `getCurrentPosition`, `getPressedButtons`, and low-level `emitMouseEvent`. Click, double-click, and drag use `delayMs: 10` by default.

`MouseButtons` exports `LEFT` (0), `MIDDLE` (1), `RIGHT` (2), and wheel codes `WHEEL_UP` through `WHEEL_RIGHT` (64-67). Mouse modifiers: `shift`, `alt`, `ctrl` (source: opentui-docs-testing-2026.md).

## Terminal capabilities

`createTerminalCapabilities(overrides)` builds a complete `TerminalCapabilities` fixture with partial overrides. The baseline disables feature booleans, uses `unicode: "unicode"`, `osc52_support: "unknown"`, `multiplexer: "none"`, `image_protocol: "auto"`, and `remote: false` (source: opentui-docs-testing-2026.md).

`setRendererCapabilities(renderer, overrides?)` builds a fixture, replaces the renderer's test capability state, and returns the fixture (source: opentui-docs-testing-2026.md).

## ManualClock

Implements OpenTUI's clock interface without wall-clock waits. Starts at zero. Supports `now`, `setTime`, timeout and interval scheduling, clearing, `advance`, and `runAll`. Times and delays are floored. Negative delays advance by zero. Timers at one timestamp fire in registration order. `setTime()` runs due timers when time moves forward and directly changes the time when time moves backward (source: opentui-docs-testing-2026.md).

## MockTreeSitterClient

Subclasses `TreeSitterClient` without starting a worker. `highlightOnce()` remains pending until the test resolves it. Controls: `setMockResult`, `resolveHighlightOnce(index = 0)`, `resolveAllHighlightOnce`, `isHighlighting`. `destroy()` resolves all pending highlights before normal client cleanup. Constructor options: `autoResolveTimeout` and `clock` (source: opentui-docs-testing-2026.md).

## createSpy

Returns a callable that records argument arrays. `calledWith()` compares recorded and expected argument arrays with `JSON.stringify`. Not a test-framework mock replacement (source: opentui-docs-testing-2026.md).

| Member | Behavior |
|--------|----------|
| `calls` | Recorded argument arrays |
| `callCount()` | Number of calls |
| `calledWith(...)` | Check if called with specific args |
| `reset()` | Clear recorded calls |

## TestRecorder

Listens to renderer `frame` events and captures the character buffer after each completed render pass. `rec()` starts recording, clears previous frames, resets numbering. `stop()` detaches the listener. `clear()` empties frames. Constructor options accept `recordBuffers: { fg?, bg?, attributes? }` and an injectable `now()` function. Each `RecordedFrame` contains `frame`, elapsed `timestamp`, zero-based `frameNumber`, and optional copied buffers (source: opentui-docs-testing-2026.md).

## Framework tests

React exports `testRender(node, options)` from `@opentui/react/test-utils`. The options object is required. It mounts with React `act()` and returns the Core `TestRendererSetup`. Renderer destruction unmounts the React root (source: opentui-docs-testing-2026.md).

Solid exports `testRender(node, options?)` from `@opentui/solid`. It mounts a Solid root and returns the Core setup. Renderer destruction disposes the root and runs Solid cleanup (source: opentui-docs-testing-2026.md).

## Keymap tests

`@opentui/keymap/testing` does not require a renderer. `createTestKeymap({ defaultKeys })` supplies a fake host, root target, focus and parent traversal, press and release events, raw input, target destruction, and diagnostic capture (source: opentui-docs-testing-2026.md).

## Related pages

- [[opentui]] (overview)
- [[opentui-renderer]] (renderer creation and configuration)
- [[opentui-interaction]] (behavior observed by keyboard and mouse tests)
- [[opentui-keymap]] (keymap package)
- [[opentui-react]] (React bindings)
- [[opentui-solid]] (Solid bindings)
