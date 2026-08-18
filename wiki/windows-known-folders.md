# Windows Known Folders

Windows provides three AppData subdirectories for per-user application data, accessed through environment variables and Known Folder IDs (source: microsoft-appdata-folders-2026.md).

## Folder structure

| Folder | Environment variable | Path | Syncs across domain | Use case |
|--------|---------------------|------|---------------------|----------|
| Roaming | `%APPDATA%` | `C:\Users\<user>\AppData\Roaming` | Yes | Settings and preferences that should follow the user across devices |
| Local | `%LOCALAPPDATA%` | `C:\Users\<user>\AppData\Local` | No | Machine-specific data, caches, large files |
| LocalLow | (none standard) | `%LOCALAPPDATA%\LocalLow` | No | Apps running with restricted (low integrity) security |

(source: microsoft-appdata-folders-2026.md)

## Roaming

Data in `%APPDATA%` syncs to other devices when the user logs into a domain-joined computer. Use for user settings and preferences that should be portable (source: microsoft-appdata-folders-2026.md).

## Local

Data in `%LOCALAPPDATA%` stays on the local machine. Use for machine-specific application data, caches, and anything too large to roam efficiently (source: microsoft-appdata-folders-2026.md).

## LocalLow

Used by applications running at low integrity level, such as web browsers and some Office applications. Low-integrity apps cannot write to the Roaming or Local folders. Permissions are more restrictive than Local or Roaming (source: microsoft-appdata-folders-2026.md).

## Mapping to XDG

There is no formal mapping between Windows Known Folders and the [[xdg-base-directory]] specification, but a rough equivalence exists:

| XDG variable | Windows equivalent | Rationale |
|-------------|-------------------|-----------|
| `$XDG_CONFIG_HOME` | `%APPDATA%` | User settings that should roam |
| `$XDG_DATA_HOME` | `%APPDATA%` or `%LOCALAPPDATA%` | Depends on whether data should roam |
| `$XDG_CACHE_HOME` | `%LOCALAPPDATA%` | Caches should not roam |
| `$XDG_STATE_HOME` | `%LOCALAPPDATA%` | State is machine-specific |
| `$XDG_RUNTIME_DIR` | (no equivalent) | Windows uses named pipes and COM for IPC |

This mapping is informal. XDG originated on Linux, but the similar separation of concerns across platforms provides a foundation for cross-platform config directory logic (source: claude-code-xdg-issue-1455-2025.md).

## CLI tool conventions on Windows

CLI tools on Windows typically store configuration in one of:

- `%APPDATA%\<AppName>\` (user settings that should roam)
- `%LOCALAPPDATA%\<AppName>\` (caches, machine-specific data)
- `%USERPROFILE%\.<appname>` (Unix-style dotfiles, used by cross-platform tools like Git)

Claude Code uses `%USERPROFILE%\.claude\` on Windows (source: claude-code-settings-docs-2026.md).

Related pages: [[xdg-base-directory]], [[claude-code-config-paths]]
