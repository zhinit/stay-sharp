# Node.js raw terminal input

Built-in mechanisms for capturing individual keypresses in Node.js without external TUI frameworks (source: nodejs-readline-docs-2026.md).

## readline.emitKeypressEvents()

The `readline.emitKeypressEvents(stream[, interface])` method causes a Readable stream to emit `keypress` events corresponding to received input. Added in Node.js v0.7.7 (source: nodejs-readline-docs-2026.md).

Requirements:
- If the stream is a TTY, it must be in raw mode
- Automatically called by any readline instance on its input if the input is a terminal
- Closing the readline instance does not stop keypress events

Basic usage:

```javascript
import * as readline from 'node:readline';

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY)
  process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
  if (key && key.ctrl && key.name === 'c') {
    process.exit();
  }
});
```

The `key` object in the keypress callback contains `ctrl`, `shift`, `meta` booleans and a `name` string (source: nodejs-readline-docs-2026.md).

## Built-in keybindings

When readline is active, these keybindings are recognized (source: nodejs-readline-docs-2026.md):

| Key | Action |
|-----|--------|
| Ctrl+C | SIGINT or close readline |
| Ctrl+D | Delete right or EOF (not Windows) |
| Ctrl+H | Delete left |
| Ctrl+U | Delete to line start |
| Ctrl+K | Delete to line end |
| Ctrl+Y | Yank previously deleted text |
| Ctrl+A | Go to line start |
| Ctrl+E | Go to line end |
| Ctrl+B / Ctrl+F | Back / forward one character |
| Ctrl+L | Clear screen |
| Ctrl+N / Ctrl+P | Next / previous history |
| Ctrl+W | Delete backward to word boundary |
| Ctrl+Left / Meta+B | Word left |
| Ctrl+Right / Meta+F | Word right |

## keypress npm package

The `keypress` package by Nathan Rajlich restores keypress event functionality that existed in Node v0.8.x and was later moved into the readline module. It adds mouse support on top (source: keypress-github-readme-2026.md).

Install: `npm install keypress`

API:
- `keypress(stream)` activates keypress events on any ReadableStream
- `enableMouse()` enables cursor tracking / mousepress events
- `disableMouse()` disables cursor tracking

The stream must be set to raw mode and resumed for events to fire (source: keypress-github-readme-2026.md).

## When to use each

**readline.emitKeypressEvents**: zero dependencies, built into Node.js. Sufficient for keyboard-only input handling.

**keypress package**: adds mouse event support. Useful if you need click/scroll detection without pulling in a full TUI framework.

For higher-level prompt interactions, see [[clack]]. For full TUI frameworks, see [[js-tui-landscape]].

## Related pages

- [[js-tui-landscape]]
- [[clack]] (prompt primitives built on top of raw input)
- [[terminal-keyboard-encoding]] (how terminals encode keypresses as bytes)
- [[kitty-keyboard-protocol]] (modern keyboard encoding standard)
