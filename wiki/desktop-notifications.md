# Desktop Notifications

Cross-platform desktop notifications from CLI tools and Node.js applications.

## Native notification systems

Each OS provides a distinct notification API:

- **macOS**: Notification Center (10.8+). CLI tools invoke it through `terminal-notifier` or AppleScript (`osascript -e 'display notification'`). The notification always shows the icon of the parent application, not a custom icon, unless the binary is rebuilt with a different icon (source: node-notifier-readme-2026.md). Supported sounds include Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink (source: node-notifier-readme-2026.md).

- **Linux**: `notify-send` from `libnotify-bin`. Sends notifications through the desktop environment's notification daemon (`notify-osd` on Ubuntu). Does not support the "wait" option, meaning the caller cannot block until the user interacts with the notification (source: node-notifier-readme-2026.md). Ubuntu ships `libnotify-bin` by default (source: node-notifier-readme-2026.md).

- **Windows 8+**: Toast notifications via SnoreToast. Since the Fall Creators Update (Version 1709), toast notifications require a valid `appID` matching the value registered during app installation. Without it, the notification displays "SnoreToast" as the sender (source: node-notifier-readme-2026.md). Images must be PNG, under 1024x1024 px, under 200 KB, and specified with an absolute path (source: node-notifier-readme-2026.md).

- **Windows < 8**: Taskbar balloon notifications via `notifu` (source: node-notifier-readme-2026.md).

- **Fallback**: Growl, if installed, works across all three platforms. On Windows, Growl takes precedence over balloons (source: node-notifier-readme-2026.md).

## WSL2

WSL2 cannot use Linux `notify-send` to reach the Windows desktop. The workaround is to call PowerShell from within WSL2 to trigger Windows-native toast notifications (source: terminal-notifications-readme-2026.md). The `terminal-notifications` project provides a shell script (`notify-windows.sh`) that does this (source: terminal-notifications-readme-2026.md).

## node-notifier

The dominant Node.js library for cross-platform notifications. Auto-selects the appropriate backend per platform (source: node-notifier-readme-2026.md).

Platform routing:

| Platform | Backend |
|----------|---------|
| macOS 10.8+ | `terminal-notifier` (Notification Center) |
| macOS < 10.8 | Growl |
| Linux | `notify-send` |
| Windows 8+ | SnoreToast (Toast) |
| Windows < 8 | `notifu` (Balloon) |
| Any (fallback) | Growl |

Common options: `title`, `message`, `icon` (absolute path), `sound` (boolean or sound name), `wait` (boolean, blocks for user action with 5-second timeout), `timeout` (milliseconds), `actions` (button labels), `reply` (text input, macOS 10.9+) (source: node-notifier-readme-2026.md).

Individual notifiers can be accessed directly: `NotificationCenter`, `WindowsToaster`, `WindowsBalloon`, `NotifySend`, `Growl` (source: node-notifier-readme-2026.md).

Known issues: within Electron `asar` packaging, the `vendor/` folder must be unpacked so notification binaries remain accessible. WSL2 may require permission changes on the SnoreToast executable. Inside `tmux`, notifications can cause hangs (source: node-notifier-readme-2026.md).

## Shell-level approach

The `terminal-notifications` project provides per-platform shell scripts installed to `~/.local/bin/notify` (source: terminal-notifications-readme-2026.md):

| Platform | Mechanism |
|----------|-----------|
| macOS | AppleScript (or `terminal-notifier` alternative) |
| Windows/WSL2 | PowerShell |
| Linux | `notify-send` + `pulseaudio-utils` for sound |

Usage: `notify "message" [sound_type]`. Sound types: `input`, `complete`, `default`, `none` (source: terminal-notifications-readme-2026.md).

Sound mapping:

| Type | macOS | Windows | Linux |
|------|-------|---------|-------|
| `input` | Funk | Windows Exclamation | dialog-warning |
| `complete` | Hero | tada.wav | complete |
| `default` | Pop | Windows Default | message |

(source: terminal-notifications-readme-2026.md)

## Claude Code integration

Notifications can be wired into Claude Code via [[claude-code-hooks]]. The `terminal-notifications` project provides an example hooking the `Notification` event (awaiting input) and the `Stop` event (task completed) to the `notify` script (source: terminal-notifications-readme-2026.md).

Related pages: [[claude-code-hooks]], [[claude-code-config-paths]]
