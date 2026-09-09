# ANSI Colors

Terminal colors are set through [[sgr-text-styling|SGR]] parameters within [[ansi-escape-codes|ANSI escape sequences]]. Three color depth levels exist, each with progressively wider palettes.

## 3/4-bit colors (8 and 16 colors)

The original ANSI specification defined 8 named colors. SGR codes 30-37 set the foreground, 40-47 set the background (source: wikipedia-ansi-escape-code.md):

| Code (FG/BG) | Color |
|--------------|-------|
| 30 / 40 | Black |
| 31 / 41 | Red |
| 32 / 42 | Green |
| 33 / 43 | Yellow |
| 34 / 44 | Blue |
| 35 / 45 | Magenta |
| 36 / 46 | Cyan |
| 37 / 47 | White |
| 39 / 49 | Default (implementation-defined) |

The basic palette, excluding black, is ordered roughly by utility: red for errors, green for success, yellow for warnings, then blue, magenta, cyan for progressively less critical conditions (source: burke-ansi-escape-codes.md).

Many terminals implemented SGR 1 (bold) as a brighter color rather than heavier font weight, giving 8 additional foreground colors. Later, codes 90-97 and 100-107 were added (originally by aixterm) to select bright colors directly without bold (source: wikipedia-ansi-escape-code.md, fnky-ansi-escape-codes-gist.md):

| Code (FG/BG) | Color |
|--------------|-------|
| 90 / 100 | Bright Black (Gray) |
| 91 / 101 | Bright Red |
| 92 / 102 | Bright Green |
| 93 / 103 | Bright Yellow |
| 94 / 104 | Bright Blue |
| 95 / 105 | Bright Magenta |
| 96 / 106 | Bright Cyan |
| 97 / 107 | Bright White |

The actual RGB values for these 16 colors vary across terminal implementations. The VT100, xterm, Windows Console, VS Code, PuTTY, and Terminal.app all map the same code to different hex values (source: wikipedia-ansi-escape-code.md).

Examples:
- Black on white: `ESC[30;47m`
- Red: `ESC[31m`
- Bright red: `ESC[1;31m` or `ESC[91m`
- Reset colors: `ESC[39;49m` or `ESC[0m`

## 8-bit colors (256 colors)

The 256-color mode uses SGR 38 (foreground) and 48 (background) with a `;5;n` suffix (source: wikipedia-ansi-escape-code.md, fnky-ansi-escape-codes-gist.md):

```
ESC[38;5;⟨n⟩m   foreground
ESC[48;5;⟨n⟩m   background
```

The 256-color palette is divided into four ranges (source: wikipedia-ansi-escape-code.md):

| Range | Count | Description |
|-------|-------|-------------|
| 0-7 | 8 | Standard colors (same as SGR 30-37) |
| 8-15 | 8 | High-intensity colors (same as SGR 90-97) |
| 16-231 | 216 | 6x6x6 RGB color cube |
| 232-255 | 24 | Grayscale ramp (dark to light, excluding pure black and white) |

The color cube formula: index = `16 + 36*r + 6*g + b` where r, g, b range from 0 to 5. For non-zero channel values, the RGB byte value is `channel * 40 + 55`; zero maps to 0 (source: wikipedia-ansi-escape-code.md).

The grayscale ramp: RGB byte value is `gray * 10 + 8` where gray ranges from 0 to 23 (source: wikipedia-ansi-escape-code.md).

ITU T.416 specifies colons instead of semicolons as separators (`ESC[38:5:⟨n⟩m`). Both forms are encountered (source: wikipedia-ansi-escape-code.md).

An incompatible 88-color encoding using a 4x4x4 cube exists in `rxvt` and `xterm-88color` (source: wikipedia-ansi-escape-code.md).

## 24-bit colors (truecolor)

RGB color support uses SGR 38/48 with a `;2;r;g;b` suffix (source: wikipedia-ansi-escape-code.md, fnky-ansi-escape-codes-gist.md):

```
ESC[38;2;⟨r⟩;⟨g⟩;⟨b⟩m   foreground
ESC[48;2;⟨r⟩;⟨g⟩;⟨b⟩m   background
```

This syntax originated in xterm based on a reading of ISO/IEC 8613-6 (source: wikipedia-ansi-escape-code.md). Supported by xterm, Konsole, iTerm, and all libvte-based terminals including GNOME Terminal (source: wikipedia-ansi-escape-code.md).

The ITU T.416 (ODA) variant uses colons and includes additional fields:

```
ESC[38:2:⟨colorspace-id⟩:⟨r⟩:⟨g⟩:⟨b⟩:⟨unused⟩:⟨tolerance⟩:⟨color-space⟩m
```

T.416 also defines color type selectors: `0` for implementation-defined, `1` for transparent, `2` for RGB, `3` for CMY, `4` for CMYK (source: wikipedia-ansi-escape-code.md).

## Environment variables

`COLORTERM` was introduced by S-Lang (1996) to indicate color support. A value of `truecolor` or `24bit` signals 24-bit support. `COLORFGBG` reports the terminal color scheme (light vs. dark background), originating in S-Lang and used by vim; GNOME Terminal refuses to set it due to disagreement on syntax (source: wikipedia-ansi-escape-code.md).

`NO_COLOR` disables colors unconditionally (source: wikipedia-ansi-escape-code.md).

## Related pages

- [[sgr-text-styling]]
- [[ansi-escape-codes]]
- [[crossterm]]
