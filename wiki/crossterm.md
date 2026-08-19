# Crossterm

Crossterm is a pure Rust library for cross-platform terminal manipulation, supporting all UNIX and Windows terminals down to Windows 7 (source: crossterm-api-docs-2026.md). It provides cursor control, styled output, terminal operations, and event handling through a command-based API (source: crossterm-readme-2026.md). Used by Broot, Cursive, and Ratatui (source: crossterm-readme-2026.md).

## Command execution

Crossterm operates through two execution models (source: crossterm-api-docs-2026.md):

**Direct execution** runs commands immediately with automatic flushing:
```rust
use std::io::{Write, stdout};
use crossterm::{ExecutableCommand, cursor};

stdout().execute(cursor::MoveTo(5, 5));
```

**Lazy execution** buffers commands and executes on flush, reducing system calls:
```rust
use std::io::{Write, stdout};
use crossterm::{QueueableCommand, cursor};

let mut stdout = stdout();
stdout.queue(cursor::MoveTo(5, 5));
stdout.flush();
```

The `execute!` and `queue!` macros accept multiple commands in one call (source: crossterm-api-docs-2026.md):
```rust
execute!(io::stdout(), cursor::MoveTo(5, 5), cursor::Show);
```

## Modules

### Cursor

Move cursor in all directions, set/get position, hide/show, save/restore position, enable/disable blinking, and set cursor styles (source: crossterm-api-docs-2026.md).

### Event

Captures keyboard, mouse, terminal resize, focus, and paste events (source: crossterm-event-docs-2026.md).

`read()` returns an `Event` immediately if available, otherwise blocks. `poll(Duration)` checks whether an event is available within a time window. These two functions cannot be called from different threads simultaneously (source: crossterm-event-docs-2026.md).

Raw mode must be enabled for keyboard events to work properly. Mouse and focus events require explicit enablement via `EnableMouseCapture` and `EnableFocusChange` commands (source: crossterm-event-docs-2026.md).

Core types (source: crossterm-event-docs-2026.md):
- `Event` -- keyboard, mouse, focus, resize, and paste events
- `KeyCode` -- individual key identifiers
- `KeyEvent` -- key press information including modifiers
- `KeyModifiers` -- tracks shift, control, alt states
- `KeyEventKind` -- distinguishes press, release, repeat
- `MouseEvent` / `MouseButton` / `MouseEventKind` -- mouse interaction data
- `EventStream` -- async stream of events (requires `event-stream` feature)

**Keyboard enhancement.** `PushKeyboardEnhancementFlags` enables the [[kitty-keyboard-protocol]], which adds extra information to keyboard events and removes ambiguity for modifier keys. It must be paired with `PopKeyboardEnhancementFlags` at the end of execution (source: crossterm-push-keyboard-enhancement-flags.md):

```rust
execute!(
    stdout,
    PushKeyboardEnhancementFlags(
        KeyboardEnhancementFlags::DISAMBIGUATE_ESCAPE_CODES
    )
);
// ...
execute!(stdout, PopKeyboardEnhancementFlags);
```

`crossterm::terminal::supports_keyboard_enhancement()` queries the terminal for protocol support, returning `Result<bool>`. On unix it blocks and may time out while `event::read` or `event::poll` are being called, so query before starting the event loop (source: crossterm-supports-keyboard-enhancement.md).

With the flags pushed, previously ambiguous combinations arrive as distinct events. A Shift+Enter press is a `KeyEvent` with `kind == KeyEventKind::Press`, `code == KeyCode::Enter`, and `modifiers` containing `KeyModifiers::SHIFT` (source: fsck-shift-enter-terminal-2026.md). Helix enables the protocol this way on supporting terminals to disambiguate ret vs S-ret, backspace vs S-backspace, and C-i vs tab (source: helix-pr-4939-keyboard-enhancement.md). Only terminals implementing the protocol deliver these events, and Release/Repeat kinds also depend on it (source: alacritty-issue-6378-kitty.md).

Blocking and non-blocking patterns (source: crossterm-event-docs-2026.md):
```rust
// Blocking
match read()? {
    Event::Key(event) => println!("{:?}", event),
    Event::Mouse(event) => println!("{:?}", event),
    Event::Resize(width, height) => println!("{}x{}", width, height),
    _ => {}
}

// Non-blocking
if poll(Duration::from_millis(500))? {
    match read()? { /* handle event */ }
}
```

### Terminal

Two screen buffers: the main screen and an alternate screen. The alternate screen has exact terminal dimensions and no scroll-back, useful for temporary UI that preserves the main screen (source: crossterm-terminal-docs-2026.md).

**Raw mode** disables line buffering, special key interpretation (backspace, Ctrl+C), and newline processing. Input is sent byte-by-byte. Use `write!` instead of `println!` (source: crossterm-terminal-docs-2026.md).

Functions: `enable_raw_mode()`, `disable_raw_mode()`, `is_raw_mode_enabled()`, `size()` (returns columns, rows), `window_size()` (source: crossterm-terminal-docs-2026.md).

Commands: `EnterAlternateScreen`, `LeaveAlternateScreen`, `Clear`, `ScrollUp`, `ScrollDown`, `SetSize`, `SetTitle`, `EnableLineWrap`, `DisableLineWrap`, `BeginSynchronizedUpdate`, `EndSynchronizedUpdate` (source: crossterm-terminal-docs-2026.md).

### Style

Supports 16 base colors, 256 ANSI colors (Windows 10+/UNIX), and RGB colors (Windows 10+/UNIX). Text attributes include bold, italic, underlined, and others (source: crossterm-readme-2026.md).

Commands: `SetForegroundColor`, `SetBackgroundColor`, `SetUnderlineColor`, `SetColors`, `SetAttribute`, `SetAttributes`, `SetStyle`, `ResetColor`, `Print`, `PrintStyledContent` (source: crossterm-style-docs-2026.md).

The `Stylize` trait provides fluent methods on strings (source: crossterm-style-docs-2026.md):
```rust
println!("{}", "Red on blue".red().on_blue());
println!("{}", "Bold".bold());
println!("{}", "Underlined".underlined());
```

Command API approach (source: crossterm-style-docs-2026.md):
```rust
execute!(
    io::stdout(),
    SetForegroundColor(Color::Blue),
    SetBackgroundColor(Color::Red),
    Print("Blue text on Red.".to_string()),
    ResetColor
);
```

## Feature flags

Enabled by default: `bracketed-paste` (paste events), `events` (input/event reading), `windows` (Windows support), `derive-more` (helper functions for event enums) (source: crossterm-api-docs-2026.md).

Optional: `event-stream` (async event reading via `EventStream`), `serde` (serialization support), `use-dev-tty` (raw file descriptor polling), `osc52` (clipboard interaction) (source: crossterm-api-docs-2026.md).

## Related pages

- [[rust-async]]
- [[tokio]]
- [[kitty-keyboard-protocol]]
- [[terminal-keyboard-encoding]]
