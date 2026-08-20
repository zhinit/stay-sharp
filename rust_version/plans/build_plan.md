# Build Plan

## Phase 1: Project setup
- [x] Install Rust toolchain (rustup)
- [x] `cargo init` inside rust_version/
- [x] Build and run hello world

## Phase 2: CLI skeleton
- [x] Accept user input from terminal (single line)
- [x] Multi-line input (Shift+Enter for newline, Enter to submit)
  - [x] Raw mode on/off, read single key events
  - [x] Kitty keyboard protocol: push/pop DISAMBIGUATE_ESCAPE_CODES (see wiki/kitty-keyboard-protocol.md)
  - [x] Input loop: chars accumulate, Enter submits, Shift+Enter inserts newline
  - [x] Backspace
  - [x] Cursor movement: Left/Right (Up/Down deferred until multi-line redraw is built)
  - [x] Only push enhancement flags when supports_keyboard_enhancement() is true
  - [x] Filter to KeyEventKind::Press (Windows reports key releases too)
- [x] Session setup questions (mode, topic, difficulty)
- [ ] Main loop structure (question > answer > grade > clarify > repeat)

## Phase 3: LLM integration
- [ ] Read API key from environment variable
- [ ] Make an API call to an LLM provider and print the response
- [ ] Generate a question based on session setup
- [ ] Grade a user's answer and give feedback
- [ ] Clarifying question conversation

## Phase 4: Polish
- [ ] Full multi-line redraw (fixes cross-line backspace display bug + enables Up/Down cursor movement)
- [ ] Word-wise: Option+Left/Right (jump), Option+Backspace (delete word)
- [ ] Ctrl+J newline fallback for terminals without kitty protocol
- [ ] Error handling (bad API key, network issues, etc.)
- [ ] Clean exit (Ctrl+C handling)
- [ ] README with install instructions

## Phase 5: Distribution
- [ ] GitHub releases with prebuilt binaries
- [ ] Homebrew formula
