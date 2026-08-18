# Editor Launching

Conventions for how CLI tools discover and launch the user's preferred text editor.

## EDITOR and VISUAL

Two environment variables control editor selection on Unix systems. `EDITOR` is the older variable and the one to set if you only set one. `VISUAL` overrides `EDITOR` when set, unless the terminal is "dumb" (source: crustytoothpaste-editor-visual-2019.md).

The distinction dates to the vi/ex era. Users would set `EDITOR` to `ex` (line editor) and `VISUAL` to `vi` (screen editor). On a dumb terminal they got `ex`; on a capable terminal they got `vi` (source: crustytoothpaste-editor-visual-2019.md). This distinction is now obsolete since dumb terminals are effectively extinct (source: crustytoothpaste-editor-visual-2019.md).

Programs such as CLI file managers and bash's Ctrl+x Ctrl+e shortcut use these variables to determine which editor to start (source: gentoo-text-editor-2026.md). Generally, `VISUAL` takes precedence over `EDITOR`, which is used for less capable terminals (source: gentoo-text-editor-2026.md).

When neither variable is set, the default is `vi`. This is considered standard for Unix systems, where sysadmins expect predictable behavior on infrequently accessed servers (source: crustytoothpaste-editor-visual-2019.md).

## Shell interpretation

The value of `EDITOR`/`VISUAL` must be passed through the shell for execution, not merely split on whitespace. This is required for two reasons (source: crustytoothpaste-editor-visual-2019.md):

1. Commands with flags, such as `gvim -f`, need proper argument parsing.
2. Paths containing spaces (common on Cygwin/Windows) need shell quoting.

The shell used should be the default POSIX shell, typically `/bin/sh`. Both Debian's `sensible-editor` and Git follow this convention (source: crustytoothpaste-editor-visual-2019.md). Git's implementation is in `editor.c` in the Git source (source: crustytoothpaste-editor-visual-2019.md).

## Foreground requirement

The editor must stay in the foreground until the user quits it. If the process backgrounds itself, the calling tool (including Git) will assume editing is complete and proceed with an empty or unchanged file (source: crustytoothpaste-editor-visual-2019.md).

GUI editors that normally detach require a wait flag:

| Editor | Flag |
|--------|------|
| gvim | `-f` |
| VS Code | `--wait` |
| Sublime Text | `-n -w` |

(source: crustytoothpaste-editor-visual-2019.md, baeldung-git-editors-2026.md)

## Git's precedence chain

Git extends the standard convention with tool-specific overrides (source: baeldung-git-editors-2026.md):

1. `GIT_EDITOR` environment variable (highest)
2. `core.editor` git config setting
3. `VISUAL` environment variable
4. `EDITOR` environment variable
5. System fallback paths (`/usr/lib/git-core/editor`, `/usr/local/sbin/editor`)

For interactive rebase, `GIT_SEQUENCE_EDITOR` and `sequence.editor` form a parallel chain (source: baeldung-git-editors-2026.md).

This pattern (tool-specific override > `VISUAL` > `EDITOR` > default) is common across CLI tools. Many tools implement only the `VISUAL` > `EDITOR` > default subset.

## Platform file/URL openers

Opening a file or URL with the user's default application uses a different command per platform:

| Platform | Command | Notes |
|----------|---------|-------|
| macOS | `open` | Built-in |
| Linux | `xdg-open` | Part of xdg-utils, requires an active desktop session, not recommended as root (source: geeksforgeeks-xdg-open-2026.md) |
| Windows | `start` | Built-in shell command |

`xdg-open` supports `ftp`, `file`, `https`, and `http` URLs. It uses the desktop environment's file association settings to choose the application (source: geeksforgeeks-xdg-open-2026.md).

## Caveats

`sudo` does not preserve `EDITOR`/`VISUAL` by default, so the editor launched under sudo may differ from the user's preference (source: gentoo-text-editor-2026.md).

Related pages: [[xdg-base-directory]]
