# OpenTUI Components

Built-in components organized by category. An automatic framework element needs no component-specific registration. Separately registered elements require setup shown on their component page. Unavailable means the shipped API does not expose that surface (source: opentui-docs-components-overview-2026.md).

## Display and layout

Text displays labels, prose, and styled text. Box lays out children and can draw a background, border, and title (source: opentui-docs-components-overview-2026.md).

| Component | Core renderable | React | Solid | Status |
|-----------|----------------|-------|-------|--------|
| Text | `TextRenderable` | `<text>` (automatic) | `<text>` (automatic) | Built in |
| Box | `BoxRenderable` | `<box>` (automatic) | `<box>` (automatic) | Built in |

### Inline text elements

React and Solid register `<span>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<br>`, and `<a>`. These are built-in text children, not standalone layout components. Use them only inside `<text>`. The `<a>` element accepts `href` and creates terminal hyperlink metadata (source: opentui-docs-components-overview-2026.md).

### Text

Displays styled text content with foreground/background colors and text attributes (bold, dim, italic, underline, blink, inverse, hidden, strikethrough). Supports the `t` template literal for inline styling within a single element (source: opentui-docs-text-component-2026.md).

Key properties: `content` (string or StyledText), `fg`/`bg` (color), `attributes` (TextAttributes bitwise OR), `selectable` (default true) (source: opentui-docs-text-component-2026.md).

### Box

Groups and arranges child content. Supports four border styles: single, double, rounded, and heavy, each using distinct Unicode box-drawing characters. Add titles (`title`, `bottomTitle`) with alignment (left, center, right). Functions as a flex container with `flexDirection`, `justifyContent`, `alignItems`, `padding`, and `gap`. Supports mouse event handlers: `onMouseDown`, `onMouseOver`, `onMouseOut` (source: opentui-docs-box-component-2026.md).

## Input and selection

| Component | Core renderable | React | Solid | Status |
|-----------|----------------|-------|-------|--------|
| Input | `InputRenderable` | `<input>` (automatic) | `<input>` (automatic) | Built in |
| Textarea | `TextareaRenderable` | `<textarea>` (automatic) | `<textarea>` (automatic) | Built in |
| Select | `SelectRenderable` | `<select>` (automatic) | `<select>` (automatic) | Built in |
| TabSelect | `TabSelectRenderable` | `<tab-select>` (automatic) | `<tab_select>` (automatic) | Built in |
| Slider | `SliderRenderable` | Unavailable | Unavailable | Core only |

### Input

Single-line text editing with cursor, placeholder, and distinct focus styling. Must call `focus()` to receive keyboard input (source: opentui-docs-input-component-2026.md).

Events (source: opentui-docs-input-component-2026.md):
- **INPUT**: fires after any text modification
- **CHANGE**: fires on blur or after a successful `submit()` when the value differs from the last commit baseline
- **ENTER**: fires on successful form submission when length requirements are met

Supports `minLength`, `maxLength`, and customizable colors for text, cursor, placeholder, and focused/unfocused backgrounds. No built-in tab traversal; applications must handle focus navigation manually (source: opentui-docs-input-component-2026.md).

### Textarea

Multi-line text editing with cursor movement, selection, and customizable key bindings. Access current text through `plainText`, track cursor via `logicalCursor` or `visualCursor`, monitor changes with `onContentChange` and `onCursorChange` (source: opentui-docs-textarea-component-2026.md).

Exposes methods for cursor navigation (`moveCursorLeft()`, `gotoLineEnd()`), selection management (`selectAll()`, `setSelection()`), and text editing (`insertText()`, `deleteSelection()`). All movement methods support `{ select: true }` to extend selections. The `traits` property communicates editor state to host UI (source: opentui-docs-textarea-component-2026.md).

### Select

Discrete choices in a vertical list. Keyboard navigation: Up/k and Down/j for movement, Shift+Up/Shift+Down for fast scrolling (5 items), Enter for selection (source: opentui-docs-select-component-2026.md).

Events (source: opentui-docs-select-component-2026.md):
- **ITEM_SELECTED**: fires when the user presses Enter on an option
- **SELECTION_CHANGED**: fires after each movement attempt and valid `setSelectedIndex()` call

Options follow a `SelectOption` interface with name, description, and optional value. Display toggles: `showDescription`, `showScrollIndicator`, `showSelectionIndicator`, `wrapSelection`. Configure `itemSpacing` and `fastScrollStep` (source: opentui-docs-select-component-2026.md).

Programmatic control: `getSelectedIndex()`, `setSelectedIndex()`, `moveUp()`, `moveDown()` (source: opentui-docs-select-component-2026.md).

## Scrolling

| Component | Core renderable | React | Solid | Status |
|-----------|----------------|-------|-------|--------|
| ScrollBox | `ScrollBoxRenderable` | `<scrollbox>` (automatic) | `<scrollbox>` (automatic) | Built in |
| ScrollBar | `ScrollBarRenderable` | Unavailable | Unavailable | Core only |

### ScrollBox

Handles scrolling and culling of child content within a bounded viewport, automatically managing its own ScrollBar instances (source: opentui-docs-scrollbox-component-2026.md).

Features (source: opentui-docs-scrollbox-component-2026.md):
- **Sticky scroll**: keep content pinned to bottom, top, left, or right as new content arrives
- **Bidirectional scrolling**: independent horizontal and vertical scrolling (vertical on by default)
- **Viewport culling**: only render visible items, skipping offscreen children for performance
- **Keyboard navigation**: when focused, responds to arrow keys, Page Up/Down, Home/End

Scroll methods: `scrollBy()` (relative, optional viewport units), `scrollTo()` (absolute), `scrollChildIntoView()` (minimal scrolling to reveal a child) (source: opentui-docs-scrollbox-component-2026.md).

## Rich content

| Component | Core renderable | React | Solid | Status |
|-----------|----------------|-------|-------|--------|
| Code | `CodeRenderable` | `<code>` (automatic) | `<code>` (automatic) | Built in |
| Markdown | `MarkdownRenderable` | `<markdown>` (automatic) | `<markdown>` (automatic) | Built in |
| LineNumber | `LineNumberRenderable` | `<line-number>` (automatic) | `<line_number>` (built in, Solid typing limitation) | Built in |
| Diff | `DiffRenderable` | `<diff>` (automatic) | `<diff>` (built in, Solid typing limitation) | Built in |
| TextTable | `TextTableRenderable` | Unavailable | Unavailable | Core only |

OpenTUI bundles parsers for JavaScript and JSX, TypeScript and TSX, Markdown and Markdown inline, and Zig. Other grammars require Tree-sitter configuration (source: opentui-docs-components-overview-2026.md).

## Graphics and media

| Component | Package | Core renderable | React | Solid | Status |
|-----------|---------|----------------|-------|-------|--------|
| ASCIIFont | @opentui/core | `ASCIIFontRenderable` | `<ascii-font>` (automatic) | `<ascii_font>` (automatic) | Built in |
| FrameBuffer | @opentui/core | `FrameBufferRenderable` | Unavailable | Unavailable | Advanced |
| Image | @opentui/core | `ImageRenderable` | `<image>` (automatic) | `<image>` (automatic) | Built in |
| QR code | @opentui/qrcode | `QRCodeRenderable` | Register `@opentui/qrcode/react` | Register `@opentui/qrcode/solid` | Separately registered |
| EmbeddedTerminal | @opentui/core | `EmbeddedTerminalRenderable` | Unavailable | Unavailable | Core only |

The Embedded terminal parses VT output and draws a child terminal. It does not start a process (source: opentui-docs-components-overview-2026.md).

## Related pages

- [[opentui]] -- Overview
- [[opentui-renderables]] -- Tree nodes and layout system
- [[opentui-input]] -- Keyboard, mouse, focus, selection
- [[opentui-styling]] -- Colors and text attributes
