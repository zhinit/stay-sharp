# XDG Base Directory

The XDG Base Directory Specification (version 0.8, May 2021) defines standard locations for user-specific data, configuration, state, cache, and runtime files on Unix-like systems (source: xdg-basedir-spec-2026.md).

## Environment variables

| Variable | Purpose | Default if unset |
|----------|---------|-----------------|
| `$XDG_DATA_HOME` | User-specific data files | `$HOME/.local/share` |
| `$XDG_CONFIG_HOME` | User-specific configuration files | `$HOME/.config` |
| `$XDG_STATE_HOME` | User-specific state data | `$HOME/.local/state` |
| `$XDG_CACHE_HOME` | Non-essential cached data | `$HOME/.cache` |
| `$XDG_RUNTIME_DIR` | Runtime files (sockets, pipes) | No default; apps should fall back and warn |
| `$XDG_DATA_DIRS` | System data search path | `/usr/local/share/:/usr/share/` |
| `$XDG_CONFIG_DIRS` | System config search path | `/etc/xdg` |

(source: xdg-basedir-spec-2026.md)

All values must be absolute paths. Relative paths are invalid and should be ignored (source: xdg-basedir-spec-2026.md).

## State vs. data vs. cache

`$XDG_STATE_HOME` is for data that should persist across restarts but is not important or portable enough for `$XDG_DATA_HOME`. Examples: action history, logs, recently used files, undo history, view/layout state (source: xdg-basedir-spec-2026.md).

`$XDG_CACHE_HOME` is for non-essential data that can be deleted without loss of important state (source: xdg-basedir-spec-2026.md).

## Runtime directory requirements

`$XDG_RUNTIME_DIR` has strict requirements (source: xdg-basedir-spec-2026.md):

- Must be owned by the user with Unix mode 0700
- Created at first login, removed at full logout
- Must be on a local filesystem (not shared across systems)
- Files do not survive reboot
- Must support AF_UNIX sockets, symlinks, hard links, proper permissions, file locking, sparse files, memory mapping, file change notifications
- Files should have their access time updated every 6 hours or have the sticky bit set to avoid cleanup

## Search order

For `$XDG_DATA_DIRS` and `$XDG_CONFIG_DIRS`, the first directory in the colon-separated list is most important. User-specific directories (`$XDG_DATA_HOME`, `$XDG_CONFIG_HOME`) take precedence over system directories (source: xdg-basedir-spec-2026.md).

## Directory creation and error handling

When writing a file, if the destination directory does not exist, the application should attempt to create it with permission 0700. Existing directory permissions should not be changed (source: xdg-basedir-spec-2026.md).

When reading, if a file in a directory is inaccessible (directory missing, file missing, unauthorized), processing of that directory should be skipped and the search should continue to the next directory in the list (source: xdg-basedir-spec-2026.md).

## User executables

User-specific executables may be stored in `$HOME/.local/bin`. Distributions should ensure this directory is in `$PATH`. Compiled binaries placed here make `$HOME` partially architecture-specific, which is a consideration if `$HOME` is shared across systems of different architectures (source: xdg-basedir-spec-2026.md).

## Adoption

Modern CLI tools that follow the XDG spec include ripgrep, fd, bat, and starship (source: claude-code-xdg-issue-11343-2025.md). Claude Code does not currently follow it (see [[claude-code-config-paths]]).

Related pages: [[claude-code-config-paths]], [[windows-known-folders]], [[editor-launching]]
