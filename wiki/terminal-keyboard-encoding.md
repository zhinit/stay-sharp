# Terminal Keyboard Encoding

How terminal emulators translate keypresses into bytes, why physically distinct keys collide, and the pre-kitty attempts to fix it. The modern fix is the [[kitty-keyboard-protocol]].

## How keys become bytes

When a key is pressed, the terminal emulator translates it into a byte sequence and sends it to the application over a pseudo-terminal. Regular characters send their ASCII/UTF-8 code: `a` sends `0x61` (source: fsck-shift-enter-terminal-2026.md).

Modifiers are encoded per-modifier (source: fsck-shift-enter-terminal-2026.md):

- **Ctrl** clears bits 5 and 6 of the character code. Ctrl+A sends `0x01`. This originates as an electrical trick from the ASR-33 teletype (1963), where the Ctrl key physically zeroed the top two bits of the 7-bit code.
- **Shift** changes the character (`a` becomes `A`) and sends the shifted character's code. The modifier itself is invisible to the application.
- **Alt/Meta** prefixes the key with an Escape byte. Alt+a sends `0x1B 0x61`.

## The collisions

The Ctrl bit-masking makes physically different keys produce identical bytes (source: fsck-shift-enter-terminal-2026.md):

| Key | Byte | Also sent by |
|---|---|---|
| Tab | 0x09 | Ctrl+I |
| Enter | 0x0D | Ctrl+M |
| Backspace | 0x08 or 0x7F | Ctrl+H or Ctrl+? |
| Escape | 0x1B | Ctrl+[ |

Modifier combinations on these keys are lost entirely: Enter, Shift+Enter, and Ctrl+Enter all send `0x0D`, and Alt+Enter sends the same bytes as Escape followed by Enter (source: fsck-shift-enter-terminal-2026.md). The kitty spec's legacy encoding table confirms this: Enter with no modifiers, with Ctrl, and with Shift all produce `0xd` (source: kitty-keyboard-protocol-spec.md).

The fixterms proposal catalogued the same classes of ambiguity in 2008: special ASCII names collide with Ctrl-modified letters, Ctrl encodes lower and upper case identically, UTF-8 bytes collide with Alt-modified 8-bit-high characters, and programs rely on timing to tell Alt+C from Escape-then-C (source: leonerd-fixterms-csi-u.md).

## The Escape ambiguity

When an application receives `0x1B` it may be a lone Escape press, the start of an Alt-prefixed key, or the start of a CSI escape sequence. The only way to distinguish is to wait for more bytes, typically 50 to 100 ms. This causes the perceptible Escape delay in terminal Vim and Emacs, and the heuristic fails over slow SSH connections (source: fsck-shift-enter-terminal-2026.md). The kitty spec calls this out as a problem with no reliable legacy solution, with client programs using fragile timing hacks (source: kitty-keyboard-protocol-spec.md).

## What legacy terminals cannot report

Compared to a GUI application, a legacy terminal application cannot detect: Shift/Ctrl/Alt+Enter, Ctrl+Shift+anything, Ctrl+punctuation, key release events, key repeat events as distinct from rapid presses, or which physical key was pressed on non-US layouts (source: fsck-shift-enter-terminal-2026.md).

## History of fixes

- **1999-2006, xterm modifyOtherKeys.** Thomas Dickey added modified function and cursor keys (patch #167, 2002), then `modifyOtherKeys` (patch #214, 2006) at the request of an Emacs developer, encoding modified keys as `CSI 27 ; modifier ; code ~` (source: xterm-modified-keys.md).
- **2008, fixterms / CSI u.** Paul "LeoNerd" Evans proposed encoding the problematic combinations as `CSI codepoint ; modifier u`, where the modifier parameter is 1 plus a bitmask (Shift 1, Alt 2, Ctrl 4). Shift-Enter is `CSI 13;2 u`, Ctrl-Enter is `CSI 13;5 u` (source: leonerd-fixterms-csi-u.md). Dickey added the `formatOtherKeys` resource to xterm (patch #235, 2008) to emit Evans's format alongside his own (source: xterm-modified-keys.md). mintty implemented modifyOtherKeys with CSI u format in 0.4.0 (2009), and Evans's own libvterm/pangoterm followed in 2011 (source: xterm-modified-keys.md).
- **2021, kitty keyboard protocol.** Kovid Goyal extended the CSI u encoding with progressive enhancement flags, a push/pop stack, event types, and a detection mechanism. See [[kitty-keyboard-protocol]] (source: kitty-keyboard-protocol-spec.md).

## Why modifyOtherKeys lost

The kitty spec lists the reasons modifyOtherKeys should not be used: no release events, does not fix the Escape ambiguity, does not fix identical-byte collisions, no robust way to query or manage its state, no support for shifted keys, alternate layouts, modifiers beyond the basic four, or lock keys, and it is essentially unspecified (source: kitty-keyboard-protocol-spec.md). The spec also lists errata in fixterms that it corrects, including no Esc disambiguation, no super modifier, incorrect shifted-key encoding, and no repeat/release events (source: kitty-keyboard-protocol-spec.md). Dickey's own page documents the format's origin and disputes parts of that account, noting xterm's CSI u implementation predates the fixterms document (source: xterm-modified-keys.md).

## Related pages

- [[kitty-keyboard-protocol]]
- [[crossterm]]
