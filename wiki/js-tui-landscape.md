# JavaScript/TypeScript TUI Libraries

Overview of terminal user interface libraries available in the JS/TS ecosystem, organized by abstraction level.

## Full TUI frameworks

These provide component models, layout engines, input handling, and rendering.

**[[opentui]]** is the newest entrant. Native Zig core with TypeScript bindings, Yoga-based flexbox layout, and reconcilers for React and Solid. Powers OpenCode in production. Requires Bun 1.4.1+ (source: opentui-github-readme-2026.md).

**[[ink]]** is a React renderer for the terminal. Uses Yoga for flexbox. The most widely adopted option: powers Claude Code, GitHub Copilot CLI, Shopify CLI, Cloudflare Wrangler, Gatsby, and Prisma (source: ink-github-readme-2026.md). Ink UI adds pre-built widgets on top (source: ink-ui-github-readme-2026.md).

**[[terminal-kit]]** is a batteries-included library covering colors, styles, keyboard/mouse input, input fields, menus, progress bars, screen buffers, and image rendering. Pure JavaScript with no ncurses dependency (source: terminal-kit-docs-2026.md).

**[[blessed]]** pioneered rich terminal UI in Node.js with a ncurses-like widget system. The original is unmaintained. unblessed is an alpha-stage TypeScript rewrite with browser support via XTerm.js (source: unblessed-github-readme-2026.md).

## Prompt toolkits

Not full TUI frameworks, but provide interactive prompt primitives.

**[[clack]]** has two packages. @clack/core exposes low-level unstyled prompt primitives (TextPrompt, SelectPrompt, ConfirmPrompt, etc.) that you render yourself. @clack/prompts provides pre-styled, production-ready prompt components built on core (source: clack-core-docs-2026.md, clack-prompts-docs-2026.md).

## Raw terminal input

The lowest level, for building custom input handling from scratch.

**[[node-raw-terminal-input]]** covers Node.js built-in `readline.emitKeypressEvents()` with `setRawMode(true)` for zero-dependency keypress events, plus the `keypress` npm package which adds mouse support (source: nodejs-readline-docs-2026.md, keypress-github-readme-2026.md).

## Comparison

| Library | Layout | Input | Widgets | React | TypeScript | Runtime | Maintenance |
|---------|--------|-------|---------|-------|------------|---------|-------------|
| OpenTUI | Flexbox (Yoga) | Keyboard, mouse | Text, Box, Input, Select, ScrollBox, Image, QR | Yes (reconciler) | Yes (native) | Bun only | Active |
| Ink | Flexbox (Yoga) | useInput hook | Text, Box, Newline, Spacer, Static + Ink UI | Yes (renderer) | Yes | Node.js | Active |
| terminal-kit | Manual | grabInput() | Menus, input fields, progress bars, screen buffers | No | Via @types | Node.js | Active |
| blessed | Absolute/% | key() events | 27+ widget types | No | No (JS) | Node.js | Unmaintained |
| unblessed | Absolute/% + Yoga | key() events | 27+ widget types | Yes (@unblessed/react) | Yes (native) | Node.js, browser | Alpha |
| @clack/core | None (prompt-level) | Built-in per prompt | 10 prompt types | No | Yes (native) | Node.js | Active |
| readline + keypress | None | Raw keypress events | None | No | Yes (built-in) | Node.js | Stable (built-in) |

## Decision factors

**If you use React**: Ink is the proven choice with the largest ecosystem. OpenTUI is newer with more built-in components but requires Bun.

**If you want no framework dependency**: terminal-kit provides everything in one package. For just raw input, Node.js readline is zero-dependency.

**If you need browser + terminal**: unblessed is the only option with XTerm.js support, but is alpha.

**If you need prompt-style interaction only**: @clack/prompts for styled prompts, @clack/core if you need custom rendering.

## Related pages

- [[crossterm]] (Rust equivalent for terminal manipulation)
- [[bun]] (required runtime for OpenTUI)
