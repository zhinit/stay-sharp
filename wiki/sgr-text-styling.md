# SGR Text Styling

Select Graphic Rendition (SGR) is the CSI sequence `CSI n m` that sets text display attributes. Multiple parameters combine with `;` separators and apply in order. Each attribute persists until explicitly reset. `CSI m` with no parameters is equivalent to `CSI 0 m` (reset all) (source: wikipedia-ansi-escape-code.md).

## Formatting attributes

| Code | Name | Reset code | Notes |
|------|------|-----------|-------|
| 0 | Reset all | | Returns all attributes to default |
| 1 | Bold / bright | 22 | Some terminals render as brighter color instead of bold weight |
| 2 | Dim / faint | 22 | Same reset as bold |
| 3 | Italic | 23 | Not widely supported; sometimes treated as inverse |
| 4 | Underline | 24 | Kitty, VTE, mintty, iTerm2, Konsole support style extensions |
| 5 | Slow blink | 25 | Less than 150 bpm |
| 6 | Rapid blink | 25 | 150+ bpm; rarely supported |
| 7 | Reverse video | 27 | Swaps foreground and background |
| 8 | Conceal / hide | 28 | Not widely supported |
| 9 | Strikethrough | 29 | Not supported in Terminal.app |

(source: wikipedia-ansi-escape-code.md, fnky-ansi-escape-codes-gist.md)

Additional attributes defined in the standard but rarely seen in practice (source: wikipedia-ansi-escape-code.md):

| Code | Name | Notes |
|------|------|-------|
| 10 | Primary (default) font | |
| 11-19 | Alternative fonts | Select font n-10 |
| 20 | Fraktur | Rarely supported |
| 21 | Double underline | Some terminals interpret as "not bold" |
| 51 | Framed | mintty interprets as emoji variation selector |
| 52 | Encircled | |
| 53 | Overlined | Not in Terminal.app |
| 58 | Underline color | Non-standard; Kitty, VTE, mintty, iTerm2. Uses `58;5;n` or `58;2;r;g;b` |
| 73-74 | Superscript / subscript | mintty only |

## Reset codes

Each attribute has a specific reset (source: wikipedia-ansi-escape-code.md):

| Code | Resets |
|------|--------|
| 22 | Bold and dim (normal intensity) |
| 23 | Italic and blackletter |
| 24 | All underline styles |
| 25 | Blink |
| 27 | Reverse video |
| 28 | Conceal |
| 29 | Strikethrough |
| 39 | Foreground to default |
| 49 | Background to default |
| 59 | Underline color to default |

`CSI 0 m` resets everything at once. It is common practice to prepend `0;` before setting new attributes (e.g. `\x1b[0;1;32m`) to avoid inheriting stale state (source: burke-ansi-escape-codes.md).

## Combining attributes

Multiple SGR parameters concatenate with `;` in a single sequence. `\x1b[1;3;4;35m` sets bold, italic, underline, and magenta foreground in one call (source: morris-ansi-control-sequences.md).

## Color parameters

SGR codes 30-37, 40-47, 90-97, 100-107, 38, and 48 control [[ansi-colors]]. They are documented on that page.

## Related pages

- [[ansi-escape-codes]]
- [[ansi-colors]]
- [[crossterm]]
