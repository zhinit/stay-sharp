# ANSI Escape Codes

ANSI escape sequences are in-band control codes embedded in text streams that terminals interpret as commands rather than displayable characters. They control cursor position, text color and styling, screen clearing, and other terminal operations (source: wikipedia-ansi-escape-code.md).

## Structure

Every ANSI escape sequence starts with the ESC byte (decimal 27, hex `0x1B`). Common representations in source code (source: fnky-ansi-escape-codes-gist.md):

| Notation | Form |
|----------|------|
| Ctrl-Key | `^[` |
| Octal | `\033` |
| Hex | `\x1B` |
| Unicode | `` |
| C escape | `\e` (not universally supported) |

## Sequence types

ESC followed by different bytes introduces different sequence types (source: wikipedia-ansi-escape-code.md):

| Type | Introducer | Name | Description |
|------|-----------|------|-------------|
| CSI | `ESC [` (or single byte `0x9B`) | Control Sequence Introducer | Most common type. Cursor movement, [[sgr-text-styling]], erasing, scrolling. |
| OSC | `ESC ]` (or `0x9D`) | Operating System Command | Window title, [[osc-sequences\|hyperlinks]], clipboard access. Terminated by ST (`ESC \` or `0x9C`) or BEL (`0x07`). |
| DCS | `ESC P` (or `0x90`) | Device Control String | User-defined keys, termcap/terminfo data in xterm. Terminated by ST. |
| Fe | `ESC` + `0x40`-`0x5F` | C1 control codes | SS2, SS3, CSI, OSC, etc. are all Fe sequences. |
| Fp | `ESC` + `0x30`-`0x3F` | Private use | Up to 16 private control functions (e.g. DEC save/restore cursor). |
| nF | `ESC` + `0x20`-`0x2F` + ... | Multi-byte | Character set switching and announcements (ISO 2022). |

The single-byte C1 forms (`0x80`-`0x9F`) are defined by ECMA-48 but collide with UTF-8 multi-byte sequences, so modern terminals use only the two-byte `ESC + byte` form (source: wikipedia-ansi-escape-code.md).

## CSI sequence format

The CSI sequence is the workhorse. Its general structure (source: wikipedia-ansi-escape-code.md):

```
ESC [ <parameter bytes> <intermediate bytes> <final byte>
```

- **Parameter bytes**: `0x30`-`0x3F` (digits `0`-`9`, `;`, `:`, `<`, `=`, `>`, `?`)
- **Intermediate bytes**: `0x20`-`0x2F` (space through `/`)
- **Final byte**: `0x40`-`0x7E` (the function name)

In practice, most CSI sequences are numeric parameters separated by `;`, terminated by a letter (source: burke-ansi-escape-codes.md):

```
\x1b[ <zero or more numbers, separated by ";"> <a letter>
```

The letter is the function name, the numbers are its arguments. `\x1b[0;1;34m` reads as `m(0, 1, 34)`, and `\x1b[A` reads as `A()` (source: burke-ansi-escape-codes.md).

Missing parameters default to 0. Some functions (like CUU) treat 0 as 1 so that omitting the parameter still does something useful (source: wikipedia-ansi-escape-code.md).

**Private sequences** contain `?`, `<`, `=`, or `>` in the parameter bytes, or use final bytes `0x70`-`0x7E` (`p`-`~`). Terminal vendors use these for non-standard extensions without conflicting with ECMA-48 (source: wikipedia-ansi-escape-code.md).

## C0 control codes

Single-byte control characters that predate escape sequences but are part of the same standard (source: wikipedia-ansi-escape-code.md):

| Byte | Abbr | C escape | Name | Effect |
|------|------|----------|------|--------|
| `0x07` | BEL | `\a` | Bell | Audible alert |
| `0x08` | BS | `\b` | Backspace | Move cursor left |
| `0x09` | HT | `\t` | Tab | Move to next tab stop |
| `0x0A` | LF | `\n` | Line Feed | Move to next line |
| `0x0C` | FF | `\f` | Form Feed | New page on printer; varies on terminals |
| `0x0D` | CR | `\r` | Carriage Return | Move cursor to column 0 |
| `0x1B` | ESC | `\x1B` | Escape | Starts escape sequences |

## History

ECMA-48 was the first standard (1976), followed by ANSI X3.64 (1979) and ISO 6429 (1983). The DEC VT100 (1978) was the first popular terminal to support these sequences. ANSI withdrew its standard in 1994 in favor of ISO 6429. ECMA-48 is now at its 5th edition (1991) (source: wikipedia-ansi-escape-code.md).

On DOS, the optional ANSI.SYS driver provided ANSI support but was rarely installed. Windows had no native support until Windows 10 v1511 (2016). Windows Terminal (2019) supports sequences by default and replaced the Windows Console as default in Windows 11 22H2 (source: wikipedia-ansi-escape-code.md).

## Related pages

- [[sgr-text-styling]]
- [[ansi-colors]]
- [[terminal-cursor-control]]
- [[terminal-screen-control]]
- [[osc-sequences]]
- [[terminal-standards-landscape]]
- [[crossterm]]
- [[terminal-keyboard-encoding]]
- [[kitty-keyboard-protocol]]
