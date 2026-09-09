# OpenTUI Input

Keyboard, mouse, focus, and selection handling across the three architectural levels of OpenTUI.

## Keyboard input

Three approaches exist for handling keyboard input (source: opentui-docs-keyboard-2026.md):

1. **Direct renderer listeners** for simple app-wide input using `renderer.keyInput` events.
2. **Component key bindings** for local behavior in [[opentui-components|Input, Textarea, Select, and TabSelect]].
3. **[[opentui-keymap|Keymap]] commands** for layered bindings, commands, discovery, and key sequences.

### KeyEvent properties

| Property | Meaning |
|----------|---------|
| `name` | Canonical key identity (e.g. "q", "left", "right") |
| `sequence` | Decoded text |
| `raw` | Original terminal sequence |
| `ctrl` | Ctrl modifier |
| `shift` | Shift modifier |
| `meta` | Meta modifier |
| `option` | Option modifier |
| `super` | Super modifier |
| `hyper` | Hyper modifier |

(source: opentui-docs-keyboard-2026.md)

### Event propagation

Global listeners run in registration order before the focused renderable's handler. `stopPropagation()` prevents later ancestors from receiving the event. `preventDefault()` has defined renderer defaults only: on left-button down, it prevents automatic focus and the post-dispatch selection clear (source: opentui-docs-keyboard-2026.md, opentui-docs-interaction-2026.md).

### Component key bindings

Components accept `keyBindings` arrays containing `name`, optional modifiers, and a component-specific `action` value. Custom bindings override defaults for matching keys while preserving other default bindings (source: opentui-docs-keyboard-2026.md).

### Paste and raw input

Paste events are handled separately from key events. `PasteEvent.bytes` preserves the terminal payload. For unsupported protocols, `addInputHandler()` provides lower-level sequence access (source: opentui-docs-keyboard-2026.md).

## Mouse events

Mouse input is enabled by default. Set `useMouse: false` to disable it or `enableMouseMovement: false` to omit movement tracking (source: opentui-docs-interaction-2026.md).

Renderable options accept a catch-all `onMouse` handler and these specific handlers:

| Handler | `event.type` | Meaning |
|---------|-------------|---------|
| `onMouseDown` | `"down"` | A button went down |
| `onMouseUp` | `"up"` | A button went up |
| `onMouseMove` | `"move"` | Pointer moved without a pressed button |
| `onMouseDrag` | `"drag"` | Pointer moved with a pressed button |
| `onMouseDragEnd` | `"drag-end"` | Captured left-button drag ended |
| `onMouseDrop` | `"drop"` | Captured drag ended over this target |
| `onMouseOver` | `"over"` | Hit target changed to this renderable |
| `onMouseOut` | `"out"` | Hit target changed away |
| `onMouseScroll` | `"scroll"` | Terminal reported wheel input |

(source: opentui-docs-interaction-2026.md)

OpenTUI does not synthesize a click event. A click produces `down` and `up`. A double click produces two such pairs.

### MouseEvent fields

`x` and `y` are zero-based global cells in the renderer's render region. `modifiers` contains `shift`, `alt`, and `ctrl`. `target` is the original hit renderable. `currentTarget` changes as the event moves through ancestors. `source` identifies the captured renderable on `over` and `drop` events. `isDragging` marks events that belong to a text-selection drag (source: opentui-docs-interaction-2026.md).

`MouseButton.LEFT`, `MIDDLE`, and `RIGHT` are `0`, `1`, and `2`. For wheel input, read `event.scroll.direction` and `event.scroll.delta` instead of `event.button` (source: opentui-docs-interaction-2026.md).

### Hit order and propagation

Each rendered node writes its bounds to a native hit grid. Later writes replace earlier writes in overlapping cells. Children render after their parent. Siblings render in ascending `zIndex` order, so a higher `zIndex` receives an overlapping hit. The hit grid obeys clipping from `overflow: "hidden"` and `"scroll"` (source: opentui-docs-interaction-2026.md).

Mouse events start at the hit target and bubble through `parent` links. `event.stopPropagation()` prevents later ancestors from receiving that event (source: opentui-docs-interaction-2026.md).

### Hover, drag, and capture

`over` and `out` report changes to the top hit target. They are not browser enter and leave events, and they bubble like other mouse events (source: opentui-docs-interaction-2026.md).

After a left-button drag starts on a renderable, OpenTUI captures later drag events to that source. No public pointer-capture API exists. On release, the source receives `drag-end` and `up`. The renderable under the pointer receives `drop` with `event.source`, then its normal `up` event. Right-button and middle-button drags follow hit testing without this capture (source: opentui-docs-interaction-2026.md).

### Mouse pointer styles

`renderer.setMousePointer()` changes the mouse pointer style using OSC 22. The style applies to the renderer, not to an individual renderable. Use `onMouseOver` to set the style and `onMouseOut` to restore `"default"`. A demand-driven renderer needs `requestRender()` if the handler does not change a renderable property (source: opentui-docs-interaction-2026.md).

## Renderable focus

A renderable receives keyboard and paste input only while its `focused` property is true. Calling `focus()` has no effect unless `focusable` is true (source: opentui-docs-interaction-2026.md).

Input, Textarea, Select, TabSelect, ScrollBox, and ScrollBar are focusable by default. A Box becomes focusable with `focusable: true`. Each renderer tracks at most one focused renderable. Focusing another renderable blurs the previous one (source: opentui-docs-interaction-2026.md).

Use `focus()` and `blur()` for explicit control. Listen for `RenderableEvents.FOCUSED` and `RenderableEvents.BLURRED` on the instance. By default, a left-button down focuses the nearest focusable target or ancestor. Set renderer `autoFocus: false` to disable this behavior (source: opentui-docs-interaction-2026.md).

OpenTUI Core has no automatic Tab traversal or focus-order property. The application must choose the next renderable and call `focus()` (source: opentui-docs-interaction-2026.md).

## Terminal focus reports

The renderer emits `focus` and `blur` when the terminal sends window-focus reports. These events describe terminal-window focus. They do not change `currentFocusedRenderable`. They can pause application work when the terminal window loses focus. Use `focused_renderable` for renderable focus changes (source: opentui-docs-interaction-2026.md).

## Text selection

Text-buffer renderables are selectable by default. Set `selectable: false` on Text or related content to disable selection (source: opentui-docs-interaction-2026.md).

A left-button down on selectable content starts a global selection. Dragging updates its endpoints and extends the selection across selectable descendants in the active container (source: opentui-docs-interaction-2026.md).

### Selection gestures

| Gesture | Result |
|---------|--------|
| First press and drag | Start at zero width, then select by cells |
| Second press | Select the word at the pointer |
| Third press | Select the logical source line, including soft wraps |
| Drag after second press | Extend by words |
| Drag after third press | Extend by logical source lines |

Each repeated press must hit the same renderable within 500 ms. Its x and y coordinates can each differ by at most one cell from the prior press (source: opentui-docs-interaction-2026.md).

Word boundaries use this set: space, tab, `' " | \` | : ; , ( ) [ ] { } < > $`. Adjacent boundary graphemes form one selectable run, adjacent non-boundary graphemes form another. `/`, `\`, `-`, and `.` are not boundaries, so `foo/bar` is one selection word (source: opentui-docs-interaction-2026.md).

### Selection API

`renderer.hasSelection` reports whether a global selection object exists. `renderer.getSelection()` returns that `Selection` or `null` (source: opentui-docs-interaction-2026.md).

| Property | Meaning |
|----------|---------|
| `Selection.behavior` | `"cell"`, `"word"`, or `"line"` |
| `Selection.anchor` | Anchor point in global gesture cells |
| `Selection.focus` | Focus point in global gesture cells |
| `Selection.bounds` | Rectangular bounds including both endpoint cells |
| `Selection.selectedRenderables` | Renderables with selected text |
| `Selection.getSelectedText()` | Joins selected text top-to-bottom, left-to-right |

`renderer.clearSelection()` clears the current selection. Ctrl+left-click extends an existing selection from its original anchor (source: opentui-docs-interaction-2026.md).

Each text buffer converts the global cell rectangle to local coordinates. `TextBufferRenderable.getSelection()` returns `{ start, end }` as a half-open range of display-width offsets from the start of that buffer. These offsets are not UTF-16 indexes (source: opentui-docs-interaction-2026.md).

## Related pages

- [[opentui]]
- [[opentui-keymap]]
- [[opentui-components]]
- [[opentui-styling]]
