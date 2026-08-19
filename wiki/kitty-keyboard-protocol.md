# Kitty Keyboard Protocol

An opt-in terminal keyboard protocol that gives applications unambiguous key events, fixing the collisions described in [[terminal-keyboard-encoding]]. Published by Kovid Goyal in 2021 (kitty 0.20.0), based on the fixterms CSI u proposal with corrections (source: kitty-keyboard-protocol-spec.md). It is the mechanism that makes Shift+Enter distinguishable from Enter.

## Quickstart usage

An application emits `CSI > 1 u` at startup (or when entering the alternate screen) and `CSI < u` at exit (or before leaving the alternate screen) to restore the previous keyboard mode. Key events then arrive either as plain UTF-8 text or as escape codes of the forms `CSI number ; modifiers [u~]`, `CSI 1; modifiers [ABCDEFHPQS]`, plus `0x0d` for Enter, `0x7f`/`0x08` for Backspace, and `0x09` for Tab (source: kitty-keyboard-protocol-spec.md).

## Encoding

The central escape code is `CSI unicode-key-code:alternate-key-codes ; modifiers:event-type ; text-as-codepoints u`. Only the key code is mandatory. Fields are separated by semicolons, sub-fields by colons (source: kitty-keyboard-protocol-spec.md).

- The key code is the Unicode codepoint, always the unshifted version of the key (`ctrl+shift+a` is `CSI 97;modifiers u`, never 65) (source: kitty-keyboard-protocol-spec.md).
- Modifiers are a bit field (shift 1, alt 2, ctrl 4, super 8, hyper 16, meta 32, caps_lock 64, num_lock 128) encoded as 1 + bits. Shift only is 2, ctrl+shift is 6. Absent means 1, no modifiers (source: kitty-keyboard-protocol-spec.md).
- Event types press (1), repeat (2), release (3) are a sub-field of the modifiers field when requested (source: kitty-keyboard-protocol-spec.md).
- Functional keys without Unicode representations use codepoints in the Private Use Area (57344 to 63743) (source: kitty-keyboard-protocol-spec.md).

Concrete examples: Enter is `ESC[13u` or legacy `0x0d`, Shift+Enter is `ESC[13;2u`, Ctrl+Enter is `ESC[13;5u`, Alt+Enter is `ESC[13;3u`, Ctrl+I is `ESC[105;5u`, distinct from Tab's `ESC[9u` (source: fsck-shift-enter-terminal-2026.md).

## Progressive enhancement flags

Applications request capabilities with `CSI = flags ; mode u`, or push them with `CSI > flags u` and pop with `CSI < number u`. Flags (source: kitty-keyboard-protocol-spec.md):

| Bit | Meaning |
|---|---|
| 1 | Disambiguate escape codes |
| 2 | Report event types |
| 4 | Report alternate keys |
| 8 | Report all keys as escape codes |
| 16 | Report associated text |

With disambiguate (1) enabled, Esc, alt+key, ctrl+key and similar arrive as CSI u sequences, and ctrl+c is delivered as an escape code instead of generating SIGINT. Enter, Tab, and Backspace still send their legacy bytes so a user can type `reset` in a shell if an app crashes without cleanup. Shift+Enter, having a modifier, gets a CSI u code (source: kitty-keyboard-protocol-spec.md). Most apps only need flag 1; the others serve games (release events) and international shortcut matching (alternate keys) (source: fsck-shift-enter-terminal-2026.md). Alternate-key reporting also fixes shortcut matching on non-Latin layouts, e.g. ctrl+c on a Cyrillic layout (source: kitty-keyboard-protocol-spec.md).

## Stack and detection

The terminal keeps a stack of flag sets, with separate stacks for the main and alternate screens, so nested programs (editor inside shell inside multiplexer) can push and pop without knowing each other's state. Popping an empty stack resets all flags. Query current flags with `CSI ? u`, answered as `CSI ? flags u` (source: kitty-keyboard-protocol-spec.md).

Detection: send the `CSI ? u` query followed by a primary device attributes request. If the device attributes answer arrives without a flags answer, the terminal does not support the protocol. All terminals answer the device attributes query, so it acts as a sentinel (source: kitty-keyboard-protocol-spec.md, fsck-shift-enter-terminal-2026.md).

## Terminal support

Terminals implementing the protocol per the spec's own list: kitty, alacritty, foot, ghostty, iTerm2, Microsoft Terminal, rio, Warp, WezTerm, xterm.js, and TuiOS. Libraries: notcurses, crossterm, textual, vaxis, bubbletea, tcell, and others. Programs: Vim, Neovim, Emacs (via kkp), kakoune, Helix, Yazi, aerc, and others. Shells: nushell, fish (source: kitty-keyboard-protocol-spec.md).

Support detail as of February 2026 (source: fsck-shift-enter-terminal-2026.md):

- **Full support, no user config**: kitty 0.20.0+, foot ~1.11+, Alacritty 0.13.0+, Ghostty 1.0+, iTerm2 ~3.5+, Rio 0.0.17+ (enabled by default via `use-kitty-keyboard-protocol = true`), Warp, Contour 0.4.0+.
- **Full support, config required**: WezTerm (`enable_kitty_keyboard = true` in wezterm.lua, and do not combine with the older `enable_csi_u_key_encoding`), VS Code 1.109+ (`"terminal.integrated.enableKittyKeyboardProtocol": true`).
- **Partial (modifyOtherKeys/CSI u format only, no push/pop/query)**: xterm (`*vt100.modifyOtherKeys: 2` plus `*vt100.formatOtherKeys: 1`, or runtime `CSI > 4 ; 2 m`), mintty/Git Bash (on by default since 0.4.0).
- **Windows Terminal**: implementation merged February 2026, targeted at v1.25. The tracking issue is closed with milestone "Terminal v1.25" (source: windows-terminal-issue-11509-kitty.md). Until then the `sendInput` action can bind Shift+Enter to the literal sequence `[13;2u` in settings.json. Windows Terminal's separate win32-input-mode (`CSI ? 9001 h`) is not compatible with the kitty protocol.
- **No support**: macOS Terminal.app (workaround: "Use Option as Meta Key" gives Option+Enter, or per-key custom escape sequences in profile keyboard settings), PuTTY, GNOME Terminal and other VTE terminals (patches under review December 2025), Konsole (workaround: custom `.keytab` mapping `key Return +Shift : "\E[13;2u"`), conhost.exe, GNU Screen, mosh (its server-side emulator drops CSI u sequences).

Rio's implementation documentation confirms it is enabled by default (source: rio-kitty-keyboard-protocol.md). Alacritty's implementation landed via PR #7125 after maintainers initially preferred plain CSI u (source: alacritty-issue-6378-kitty.md).

## Multiplexers and SSH

- **tmux 3.2+**: forwards CSI u encoded keys but does not implement the full protocol (no push/pop/query). Requires `set -s extended-keys on`, `set -as terminal-features 'xterm*:extkeys'` (glob must match the outer terminal's `$TERM`), and `set -s extended-keys-format csi-u`. `extended-keys always` forwards unconditionally and can break apps that do not expect CSI u. `$TERM` inside tmux is `tmux-256color`, so `$TERM`-based auto-detection fails inside tmux (source: fsck-shift-enter-terminal-2026.md).
- **Zellij 0.41.0+**: `support_kitty_keyboard_protocol true`, enabled by default, enhancement level 1 only (source: fsck-shift-enter-terminal-2026.md).
- **SSH is transparent**: a byte-stream transport, the protocol works over it. The only issue is missing terminfo entries for `$TERM` values like `xterm-kitty` on the remote (source: fsck-shift-enter-terminal-2026.md).

## Application-side recommendations

From the fsck.com guide (source: fsck-shift-enter-terminal-2026.md):

1. Enable explicitly rather than auto-detecting by `$TERM` or `$TERM_PROGRAM`, because detection by environment fails inside tmux. Runtime query detection works.
2. Always provide a fallback. Ctrl+J sends `0x0A`, distinct from Enter's `0x0D`, and works in every terminal as a newline-insertion key.
3. Pop the flags on every exit path including signal handlers. A crashed app that leaves the terminal in enhanced mode confuses the shell.
4. Document per-terminal setup. The most common support request is Shift+Enter not working, usually tmux configuration or an unsupported terminal.

A minimal implementation without a framework: write `\x1b[>1u` at startup, parse `\x1b\[(\d+)(?::(\d+))?(?:;(\d+)(?::(\d+))?)?u` (group 1 keycode, group 3 modifiers minus 1), write `\x1b[<u` on exit (source: fsck-shift-enter-terminal-2026.md).

In Rust, [[crossterm]] wraps all of this: `PushKeyboardEnhancementFlags`, `PopKeyboardEnhancementFlags`, and `supports_keyboard_enhancement()` (source: crossterm-push-keyboard-enhancement-flags.md, crossterm-supports-keyboard-enhancement.md). Helix uses this pattern: detect support for the enhanced protocol and enable it on terminals that support it, to disambiguate keys like ret vs S-ret and C-i vs tab (source: helix-pr-4939-keyboard-enhancement.md).

## Related pages

- [[terminal-keyboard-encoding]]
- [[crossterm]]
