# OSC Sequences

Operating System Command (OSC) sequences use the format `ESC ]` followed by a command number, parameters, and a string terminator. The standard terminator is ST (`ESC \` or single byte `0x9C`), but xterm also accepts BEL (`0x07`) for historical reasons (source: wikipedia-ansi-escape-code.md).

## Window title

`ESC ] 0 ; <title> BEL` sets both the icon name and window title. This is the most commonly used OSC sequence and is supported by virtually all terminal emulators (source: wikipedia-ansi-escape-code.md).

## Hyperlinks (OSC 8)

`ESC ] 8 ; ; <url> ST` starts a hyperlink region. `ESC ] 8 ; ; ST` (empty URL) ends it. Text between the two markers becomes a clickable link. Introduced in 2017, supported by VTE, iTerm2, mintty, and others (source: wikipedia-ansi-escape-code.md).

## Clipboard access (OSC 52)

OSC 52 allows terminal applications to read from and write to the system clipboard. This works even over SSH, making it possible to copy text to the local clipboard from a remote machine (source: jvns-escape-code-standards-2025.md). This sequence is defined by xterm, not ECMA-48.

## Palette manipulation

The Linux console uses `ESC ] P n rr gg bb` to modify the color palette at runtime. Appending ST makes it safely ignorable by other terminals (source: wikipedia-ansi-escape-code.md).

## Origin

Most OSC sequences were defined by xterm and adopted by other terminal emulators. They are not part of the ECMA-48 standard, which only defines the OSC format, not specific OSC commands (source: wikipedia-ansi-escape-code.md).

## Related pages

- [[ansi-escape-codes]]
- [[terminal-standards-landscape]]
