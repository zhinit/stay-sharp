# blessed

A terminal interface library for Node.js that reimplements ncurses in JavaScript (16,000+ lines). Parses and compiles terminfo/termcap for universal terminal compatibility (source: blessed-github-readme-2026.md).

## Installation

```
npm install blessed
```

## Rendering

Uses CSR (Change Scroll Region) and BCE (Back Color Erase) optimizations. Painter's algorithm with dual screen buffers for efficient rendering. Supports 16-color and 256-color terminals (source: blessed-github-readme-2026.md).

## Widget system

DOM-like API with extensive widgets (source: blessed-github-readme-2026.md):

**Base**: Screen, Node, Element (abstract base classes)

**Boxes**: Box, Text, Line, BigText, ScrollableBox, ScrollableText

**Lists**: List, FileManager, ListTable, Listbar

**Forms**: Form, Input, Textarea, Textbox, Button, Checkbox, RadioSet, RadioButton

**Prompts**: Prompt, Question, Message, Loading

**Data display**: ProgressBar, Log, Table

**Special**: Terminal, Image, ANSIImage, OverlayImage, Video, Layout

## Styling

Rich text tags: `{bold}`, `{red-fg}`, `{green-bg}`, hex colors (`{#ff0000-fg}`). Style options for foreground/background colors, bold, underline, blink, inverse, transparency, shadows, hover/focus effects. Percentage-based positioning and `center` keyword (source: blessed-github-readme-2026.md).

## Input

`key()` method for keyboard event binding. `on()` for general event listeners. Events propagate through the widget tree with cancellation support (source: blessed-github-readme-2026.md).

## Platform support

Unix-like systems with terminfo. Windows with explicit terminal specification. Mouse and resize events have limited Windows support (source: blessed-github-readme-2026.md).

## Maintenance status

The original blessed by chjj is unmaintained. Two continuation efforts exist:

**neo-blessed** (embarklabs/neo-blessed): drop-in replacement with occasional updates for modern Node.js compatibility (source: blessed-github-readme-2026.md).

**unblessed** (vdeantoni/unblessed): full TypeScript rewrite. 100% TypeScript with 2,355+ tests at 98.5% coverage. Platform-agnostic via runtime dependency injection, supporting Node.js and browsers (via XTerm.js). Backward compatible as a drop-in blessed replacement. Adds Yoga-based flexbox layout (@unblessed/layout), React/JSX support (@unblessed/react), runtime theme switching, 7 animation types, and visual regression testing. Currently alpha (1.0.0-alpha.21). Requires Node.js >= 22.0.0 and pnpm (source: unblessed-github-readme-2026.md).

### unblessed packages

| Package | Purpose |
|---------|---------|
| @unblessed/core | Platform-agnostic widget logic and rendering |
| @unblessed/node | Node.js runtime with class-based API |
| @unblessed/browser | XTerm.js integration for web terminals |
| @unblessed/blessed | 100% backward-compatible blessed API |
| @unblessed/layout | Flexbox via Yoga |
| @unblessed/react | React renderer with JSX |
| @unblessed/vrt | Visual regression testing tools |

## Related pages

- [[js-tui-landscape]]
