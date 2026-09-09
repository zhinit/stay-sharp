# OpenTUI Styling

Colors, text attributes, styled text, and the relationship between Unicode text and terminal display cells.

## Colors

Most color options accept `ColorInput`, which is `string | RGBA`. Use a string for ordinary component styling and `RGBA` for computed values (source: opentui-docs-colors-2026.md).

### parseColor()

`parseColor()` accepts an `RGBA` unchanged. String matching is case-insensitive. Hex strings can use `#RGB`, `#RGBA`, `#RRGGBB`, or `#RRGGBBAA`. Alpha is last and defaults to `255` (source: opentui-docs-colors-2026.md).

`"transparent"` produces `[0, 0, 0, 0]` (source: opentui-docs-colors-2026.md).

Named colors: `black`, `white`, `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `silver`, `gray`, `grey`, `maroon`, `olive`, `lime`, `aqua`, `teal`, `navy`, `fuchsia`, `purple`, `orange`, `brightBlack`, `brightRed`, `brightGreen`, `brightBlue`, `brightYellow`, `brightCyan`, `brightMagenta`, `brightWhite` (source: opentui-docs-colors-2026.md).

Invalid strings log a warning and return opaque magenta. `parseColor()` does not support arbitrary CSS color syntax (source: opentui-docs-colors-2026.md).

### RGBA class

`RGBA` stores four 8-bit channels with normalized channel getters from `0` to `1` (source: opentui-docs-colors-2026.md).

| Constructor | Default alpha | Behavior |
|-------------|--------------|----------|
| `RGBA.fromInts(r, g, b, a?)` | `255` | Clamps each channel to `0..255`, rounds to nearest integer |
| `RGBA.fromValues(r, g, b, a?)` | `1` | Clamps each channel to `0..1`, multiplies by `255`, rounds |
| `RGBA.fromHex(hex)` | `255` | Parses hex string |
| `RGBA.fromIndex(index, snapshot?)` | - | Uses ANSI palette slot `0..255`, throws `RangeError` otherwise |
| `RGBA.defaultForeground(snapshot?)` | - | Terminal default foreground, snapshot defaults to `[255, 255, 255]` |
| `RGBA.defaultBackground(snapshot?)` | - | Terminal default background, snapshot defaults to `[0, 0, 0]` |

Both `fromInts()` and `fromValues()` convert a non-finite channel to `0`. `RGBA.clone()` copies all channels and metadata. `equals()` compares the complete packed value, including color intent (source: opentui-docs-colors-2026.md).

### Alpha

An alpha value of zero is transparent. Intermediate alpha values blend during supported buffer-composition operations. After a blend, the result is a literal RGB color and no longer identifies a terminal default or indexed palette slot (source: opentui-docs-colors-2026.md).

### Color intent

Every `RGBA` carries one color intent (source: opentui-docs-colors-2026.md):

| Intent | Constructors | Terminal meaning |
|--------|-------------|------------------|
| `"rgb"` | `fromInts()`, `fromValues()`, `fromHex()` | Emit or approximate the stored RGB value |
| `"indexed"` | `fromIndex(index, snapshot?)` | Use ANSI palette slot `0..255` |
| `"default"` | `defaultForeground()`, `defaultBackground()` | Use the terminal's default for the target channel |

Two colors with equal RGBA channels can still differ by intent (source: opentui-docs-colors-2026.md).

### Packed transport

`RGBA.buffer` is a `Uint16Array(4)`. The low byte of each element stores one RGBA channel. The four high bytes store 32 bits of metadata. This packed form crosses the native boundary and participates in exact frame comparisons. Use only for low-level transport (source: opentui-docs-colors-2026.md).

## Styled text

`StyledText` contains an ordered array of `TextChunk` values. A chunk contains text plus optional foreground, background, attributes, and link metadata (source: opentui-docs-text-and-cells-2026.md).

### Template tag

Use `t` as a template tag. Style helpers return chunks that insert into the template (source: opentui-docs-text-and-cells-2026.md):

```typescript
import { bold, italic, underline, t } from "@opentui/core"
const content = t`${bold("Status")}: ready\n${italic("Note")}: saved`
```

### Style helpers

Text helpers: `bold`, `italic`, `underline`, `strikethrough`, `dim`, `blink`, `reverse`. Color helpers include normal, bright, and background named colors. Helpers preserve a chunk's existing style and link while adding new attributes. Later foreground or background helpers replace that color (source: opentui-docs-text-and-cells-2026.md).

### TextAttributes

Use `TextAttributes` when a component accepts an `attributes` bit mask. Combine values with bitwise OR. Available attributes: `BOLD`, `DIM`, `ITALIC`, `UNDERLINE`, `BLINK`, `INVERSE`, `HIDDEN`, `STRIKETHROUGH`. `createTextAttributes()` accepts named boolean fields including `inverse` and the `reverse` alias (source: opentui-docs-text-and-cells-2026.md, opentui-docs-text-component-2026.md).

## Text and terminal cells

### Text units

| Unit | Meaning |
|------|---------|
| UTF-8 byte | Encoded storage and native transport unit |
| Unicode code point | One Unicode scalar value |
| UTF-16 code unit | JavaScript string indexing unit |
| Grapheme cluster | User-perceived text unit |
| Terminal display cell | One terminal column in one row |

(source: opentui-docs-text-and-cells-2026.md)

OpenTUI receives JavaScript strings, encodes them as UTF-8, and segments text for measurement and drawing. `renderer.widthMethod` is either `"unicode"` or `"wcwidth"` (source: opentui-docs-text-and-cells-2026.md).

### Wide cells

A multi-code-point grapheme lives in a native grapheme pool. The first occupied cell stores the grapheme reference and its extent. Remaining occupied cells store continuation markers. Continuation cells prevent later drawing and diffing from treating the tail of a wide grapheme as independent text (source: opentui-docs-text-and-cells-2026.md).

String length and terminal width are different values. `"A界B".length` is `3` in JavaScript, but `界` occupies two terminal columns, so the total display width is 4 cells (source: opentui-docs-text-and-cells-2026.md).

### Wrap modes

Text renderables support `wrapMode: "word"` (default), `"char"`, or `"none"`. Wrapping and truncation operate on display width. They do not split a grapheme to make it fit at a line boundary (source: opentui-docs-text-and-cells-2026.md).

### Terminal links

`link(url)(text)` adds link metadata to a `TextChunk`. OpenTUI emits an OSC 8 hyperlink only when `capabilities.hyperlinks` is true. A URL can use at most 512 UTF-8 bytes. Longer URLs silently lose native link metadata and render as ordinary text (source: opentui-docs-text-and-cells-2026.md).

React and Solid `<a href>` elements create the same terminal link metadata. They are not browser navigation elements (source: opentui-docs-text-and-cells-2026.md).

### Selection offsets

Text-buffer selection uses a half-open range `{ start, end }`. Both values are global display-width offsets from the start of that buffer. Each logical line break adds one offset unit. Soft wrapping does not add a unit. These offsets are not UTF-16 indexes. Do not pass them directly to `String.prototype.slice()` for text that can contain wide or combined graphemes (source: opentui-docs-text-and-cells-2026.md).

## Text component

The `TextRenderable` (Core) / `<text>` (React, Solid) displays styled text content. Properties: `content` (string or StyledText), `fg`/`bg` (colors), `attributes` (TextAttributes), `selectable` (default: true). React and Solid support inline elements `<span>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<br>`, and `<a href>` as text-only children (source: opentui-docs-text-component-2026.md, opentui-docs-components-overview-2026.md).

## Related pages

- [[opentui]]
- [[opentui-components]]
- [[opentui-input]]
