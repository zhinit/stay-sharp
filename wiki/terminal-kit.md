# terminal-kit

A comprehensive Node.js terminal library providing 256 colors, styles, keyboard/mouse handling, input fields, progress bars, screen buffers (including 32-bit composition and image loading), and text buffers. Does not depend on ncurses (source: terminal-kit-docs-2026.md).

## Installation

```
npm install terminal-kit
```

TypeScript types: `npm install @types/terminal-kit` (source: terminal-kit-docs-2026.md).

## Platform support

Linux and xterm-compatible terminals: xterm, GNOME Terminal, Konsole, iTerm, Terminator (source: terminal-kit-docs-2026.md).

## High-level API

(source: terminal-kit-high-level-api-2026.md)

**Terminal control**:
- `.fullscreen()` activates/deactivates fullscreen with optional alternate screen buffer
- `.processExit(code)` exits cleanly without leaving terminal in bad state
- `.grabInput(options)` enables keyboard and mouse capture with configurable event reporting

**User input**:
- `.yesOrNo(options)` for binary prompts with customizable keys
- `.inputField(options)` for full text input with history, auto-completion, and syntax highlighting
- `.fileInput(options)` for file path input with auto-completion

**Menus**:
- `.singleLineMenu()` horizontal menu with paging
- `.singleColumnMenu()` vertical menu
- `.gridMenu()` table-layout with grid navigation

**Visual**:
- `.spinner(animation)` animated spinner with built-in animations
- `.progressBar(options)` with ETA and item tracking
- `.bar(value, options)` simple Unicode progress bar
- `.slowTyping(str, options)` typewriter effect
- `.drawImage(url, options)` image rendering via Unicode blocks

**Color and cursor**:
- `.getCursorLocation()` retrieves cursor coordinates
- `.getColor(register)` / `.setColor(register, rgb)` for color registers
- `.getPalette()` / `.setPalette()` for 16-color palette management
- `.wrapColumn(options)` for word wrapping
- `.table(tableCells, options)` for formatted tables

All methods support both callback and Promise patterns (source: terminal-kit-high-level-api-2026.md).

## Low-level API

Direct terminal control: colors, styles, cursor positioning, screen manipulation (source: terminal-kit-docs-2026.md).

## Advanced components

ScreenBuffer, ScreenBuffer HD, TextBuffer, Rect, and a document model system for building GUI applications with buttons, menus, forms, and text boxes (source: terminal-kit-docs-2026.md).

## Related pages

- [[js-tui-landscape]]
