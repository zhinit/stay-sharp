# Terminal Cursor Control

Cursor movement, positioning, and visibility are controlled through [[ansi-escape-codes|CSI sequences]]. All positions are 1-based (top-left is row 1, column 1) (source: wikipedia-ansi-escape-code.md).

## Movement

| Sequence | Abbr | Name | Effect |
|----------|------|------|--------|
| `CSI n A` | CUU | Cursor Up | Move up n (default 1) cells |
| `CSI n B` | CUD | Cursor Down | Move down n cells |
| `CSI n C` | CUF | Cursor Forward | Move right n cells |
| `CSI n D` | CUB | Cursor Back | Move left n cells |
| `CSI n E` | CNL | Cursor Next Line | Move to beginning of line n lines down |
| `CSI n F` | CPL | Cursor Previous Line | Move to beginning of line n lines up |
| `CSI n G` | CHA | Cursor Horizontal Absolute | Move to column n |

If the cursor is already at the screen edge, movement in that direction has no effect (source: wikipedia-ansi-escape-code.md).

## Absolute positioning

| Sequence | Abbr | Name | Effect |
|----------|------|------|--------|
| `CSI n;m H` | CUP | Cursor Position | Move to row n, column m (both default to 1) |
| `CSI n;m f` | HVP | Horizontal Vertical Position | Same as CUP but classified as a format effector |
| `CSI H` | | Home | Moves to position 1,1 |

`CSI ;5H` is equivalent to `CSI 1;5H`. `CSI 17;H` is equivalent to `CSI 17;1H` (source: wikipedia-ansi-escape-code.md).

## Save and restore

Two mechanisms exist (source: fnky-ansi-escape-codes-gist.md):

| Sequence | Origin | Effect |
|----------|--------|--------|
| `ESC 7` / `ESC 8` | DEC (DECSC/DECRC) | Save/restore cursor position, encoding shift state, and formatting attributes |
| `CSI s` / `CSI u` | SCO (SCOSC/SCORC) | Save/restore cursor position only |

The DEC sequences are more widely supported and save more state. The SCO sequences are private and non-standardized. In vertical split screen mode, `CSI n;n s` sets left and right margins instead (source: wikipedia-ansi-escape-code.md). The DEC form is recommended (source: fnky-ansi-escape-codes-gist.md).

## Visibility

| Sequence | Effect |
|----------|--------|
| `CSI ? 25 h` | Show cursor (DECTCEM, from VT220) |
| `CSI ? 25 l` | Hide cursor |

`?25` is a DEC private mode. `h` and `l` stand for "high" (set/enable) and "low" (reset/disable) (source: burke-ansi-escape-codes.md, wikipedia-ansi-escape-code.md).

Hiding the cursor is useful when redrawing multiple lines to avoid visible cursor jumping. Show it again when drawing is complete (source: burke-ansi-escape-codes.md).

## Status report

`CSI 6 n` (Device Status Report) causes the terminal to transmit `CSI row;column R` reporting the current cursor position. Using `CSI ? 6 n` (private variant) avoids collision with the F3 key response by reflecting the `?` in the reply as `CSI ? row;column R` (source: wikipedia-ansi-escape-code.md).

## Related pages

- [[ansi-escape-codes]]
- [[terminal-screen-control]]
- [[crossterm]]
