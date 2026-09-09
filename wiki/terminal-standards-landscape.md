# Terminal Standards Landscape

No single standard defines all the escape codes in common use. The practical set is built from layers of specifications and de facto conventions (source: jvns-escape-code-standards-2025.md).

## ECMA-48

The foundational standard, first published in 1976. Also known as ISO/IEC 6429, ANSI X3.64, FIPS 86, and JIS X 0211. Currently at the 5th edition (1991) (source: wikipedia-ansi-escape-code.md).

ECMA-48 defines two things (source: jvns-escape-code-standards-2025.md):

1. **General formats** for escape codes: CSI (`ESC [` + content), OSC (`ESC ]` + content), DCS, and others.
2. **Specific control functions**: cursor movement (CUU, CUD, CUF, CUB), [[sgr-text-styling|Select Graphic Rendition]], erasing, scrolling, and more.

The formats are extensible, allowing future codes. Many popular modern codes are not in ECMA-48, including mouse reporting, bracketed paste, and clipboard access (source: jvns-escape-code-standards-2025.md).

The ECMA-48 text is freely available from ECMA International. The equivalent ANSI standard requires fees. A searchable markdown transcription exists at wezfurlong.org/ecma48/ (source: wez-ecma48-github.md).

## Xterm control sequences

Xterm introduced widely-adopted codes beyond ECMA-48 (source: jvns-escape-code-standards-2025.md):

- Mouse reporting
- Bracketed paste mode (`CSI ? 2004 h/l`)
- OSC 52 (clipboard access)
- 256-color and truecolor extensions
- Alternate screen buffer

The xterm control sequences document is not a formal standard but is extremely influential. Most terminal emulators implement a substantial subset (source: jvns-escape-code-standards-2025.md).

## Terminfo

A database mapping terminal names to the escape codes they support, dating from the 1980s. Standardized as X/Open Curses. Managed by ncurses on most systems. Programs query it using the `TERM` environment variable (source: jvns-escape-code-standards-2025.md).

Two approaches exist in practice (source: jvns-escape-code-standards-2025.md):

1. **Terminfo-based**: query the database for the current terminal. Fish does this.
2. **Hardcoded common set**: identify a minimal set of codes that work everywhere and embed them directly. Used by Kakoune, python-prompt-toolkit, linenoise, libvaxis, Chalk.

A Fish maintainer argued that terminfo, while historically crucial, "no longer is" as relevant given reduced terminal diversity. The trend is toward hardcoded common sets, though counterarguments include (source: jvns-escape-code-standards-2025.md):

- `TERM=dumb` as a user-controlled behavior switch has no post-terminfo equivalent
- Variation still exists: graphical terminals, Linux framebuffer, serial console, Emacs shell mode
- No standard defines what the "common set" actually is

## The "Can I Use?" gap

There is no equivalent of caniuse.com or Baseline for terminal escape codes. Terminfo is theoretically this resource but often lags 10+ years behind new features. Terminal emulators like iTerm2 report themselves as "xterm-256color" to work around outdated detection, mirroring browser user-agent manipulation on the web (source: jvns-escape-code-standards-2025.md).

## Other standards and extensions

- **Linux console_codes** man page: documents Linux-specific codes
- **[[kitty-keyboard-protocol]]**: progressive keyboard enhancement
- **OSC 8**: terminal hyperlinks (VTE, iTerm2, mintty)
- **Sixel graphics**: inline image display
- **iTerm feature reporting**: terminal capability discovery
- **DEC private modes**: cursor visibility, alternate screen buffer, focus reporting, originally from VT100/VT220 terminals

(source: jvns-escape-code-standards-2025.md, wikipedia-ansi-escape-code.md)

## Related pages

- [[ansi-escape-codes]]
- [[osc-sequences]]
- [[terminal-keyboard-encoding]]
- [[kitty-keyboard-protocol]]
