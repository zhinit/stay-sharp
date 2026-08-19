# Build Plan

## Phase 1: Project setup
- [x] Install Rust toolchain (rustup)
- [x] `cargo init` inside rust_version/
- [x] Build and run hello world

## Phase 2: CLI skeleton
- [x] Accept user input from terminal (single line)
- [ ] Multi-line input (Shift+Enter for newline, Enter to submit)
  - [x] Raw mode on/off, read single key events
  - [x] Kitty keyboard protocol: push/pop DISAMBIGUATE_ESCAPE_CODES (see wiki/kitty-keyboard-protocol.md)
  - [x] Input loop: chars accumulate, Enter submits, Shift+Enter inserts newline
  - [ ] Backspace
  - [ ] Cursor movement: Left/Right/Up/Down
  - [ ] Word-wise: Option+Left/Right (jump), Option+Backspace (delete word)
  - [ ] Ctrl+J newline fallback for terminals without kitty protocol
  - [ ] Only push enhancement flags when supports_keyboard_enhancement() is true
  - [ ] Filter to KeyEventKind::Press (Windows reports key releases too)
- [ ] Session setup questions (mode, topic, difficulty)
- [ ] Main loop structure (question > answer > grade > clarify > repeat)

## Phase 3: LLM integration
- [ ] Read API key from environment variable
- [ ] Make an API call to an LLM provider and print the response
- [ ] Generate a question based on session setup
- [ ] Grade a user's answer and give feedback
- [ ] Clarifying question conversation

## Phase 4: Polish
- [ ] Error handling (bad API key, network issues, etc.)
- [ ] Clean exit (Ctrl+C handling)
- [ ] README with install instructions

## Phase 5: Distribution
- [ ] GitHub releases with prebuilt binaries
- [ ] Homebrew formula
