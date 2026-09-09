# Terminal Screen Control

Screen-level operations (erasing, scrolling, alternate buffers) are controlled through [[ansi-escape-codes|CSI sequences]] and DEC private modes.

## Erase in Display (ED)

`CSI n J` clears part of the screen based on n (source: wikipedia-ansi-escape-code.md, fnky-ansi-escape-codes-gist.md):

| n | Effect |
|---|--------|
| 0 (default) | Clear from cursor to end of screen |
| 1 | Clear from cursor to beginning of screen |
| 2 | Clear entire screen (DOS ANSI.SYS also moves cursor to 1,1) |
| 3 | Clear entire screen and scrollback buffer (xterm extension) |

## Erase in Line (EL)

`CSI n K` clears part of the current line. The cursor position does not change (source: wikipedia-ansi-escape-code.md, fnky-ansi-escape-codes-gist.md):

| n | Effect |
|---|--------|
| 0 (default) | Clear from cursor to end of line |
| 1 | Clear from start of line to cursor |
| 2 | Clear entire line |

Use `\r` after clearing a line to return the cursor to column 0 (source: fnky-ansi-escape-codes-gist.md).

## Scrolling

| Sequence | Abbr | Effect |
|----------|------|--------|
| `CSI n S` | SU | Scroll whole page up by n lines; new lines added at bottom |
| `CSI n T` | SD | Scroll whole page down by n lines; new lines added at top |
| `ESC M` | RI | Reverse Index: move cursor one line up, scrolling if at top |

(source: wikipedia-ansi-escape-code.md, fnky-ansi-escape-codes-gist.md)

## Additional character operations

Defined in ECMA-48 but less commonly used (source: morris-ansi-control-sequences.md):

| Sequence | Abbr | Effect |
|----------|------|--------|
| `CSI n @` | ICH | Insert n blank characters at cursor position |
| `CSI n P` | DCH | Delete n characters at cursor position |
| `CSI n X` | ECH | Overwrite n characters with spaces |
| `CSI n L` | IL | Insert n blank lines at cursor position |
| `CSI n M` | DL | Delete n lines from cursor position |

## Alternate screen buffer

A DEC private mode that switches to a separate display buffer, commonly used by full-screen applications like vim or htop (source: fnky-ansi-escape-codes-gist.md):

| Sequence | Effect |
|----------|--------|
| `CSI ? 1049 h` | Save cursor position, switch to alternate screen buffer |
| `CSI ? 1049 l` | Switch back to main buffer, restore cursor position |
| `CSI ? 47 h` / `CSI ? 47 l` | Save/restore screen (older form) |

From xterm. May not work in multiplexers like tmux (source: fnky-ansi-escape-codes-gist.md).

## Focus reporting

| Sequence | Effect |
|----------|--------|
| `CSI ? 1004 h` | Enable focus reporting |
| `CSI ? 1004 l` | Disable focus reporting |

When enabled, the terminal sends `ESC [I` on focus gain and `ESC [O` on focus loss (source: wikipedia-ansi-escape-code.md).

## Bracketed paste mode

| Sequence | Effect |
|----------|--------|
| `CSI ? 2004 h` | Enable bracketed paste |
| `CSI ? 2004 l` | Disable bracketed paste |

When enabled, pasted text is wrapped in `ESC [200~` ... `ESC [201~`. Programs should not interpret bracketed content as commands. From xterm (source: wikipedia-ansi-escape-code.md).

## Line wrapping

`ESC [ = 7 h` enables line wrapping; `ESC [ = 7 l` disables it. This is an ANSI.SYS-era sequence (source: fnky-ansi-escape-codes-gist.md).

## Related pages

- [[ansi-escape-codes]]
- [[terminal-cursor-control]]
- [[crossterm]]
