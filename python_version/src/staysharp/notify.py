"""Desktop notifications. One function, platform-selected shell command.

macOS: osascript. Linux: notify-send. Windows and WSL2: PowerShell toast
(notify-send cannot reach the Windows desktop from WSL2). Any failure falls
back to printing in the terminal.
"""

import platform
import shutil
import subprocess
import sys


def _is_wsl() -> bool:
    return sys.platform == "linux" and "microsoft" in platform.uname().release.lower()


def _run(cmd: list[str]) -> bool:
    try:
        result = subprocess.run(
            cmd, capture_output=True, timeout=10
        )
        return result.returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        return False


def notify(title: str, message: str) -> None:
    sent = False
    if sys.platform == "darwin":
        script = 'display notification "{}" with title "{}"'.format(
            message.replace("\\", "\\\\").replace('"', '\\"'),
            title.replace("\\", "\\\\").replace('"', '\\"'),
        )
        sent = _run(["osascript", "-e", script])
    elif sys.platform == "win32" or _is_wsl():
        exe = "powershell.exe"
        ps_title = title.replace("'", "''")
        ps_msg = message.replace("'", "''")
        sent = _run(
            [
                exe,
                "-NoProfile",
                "-Command",
                f"New-BurntToastNotification -Text '{ps_title}', '{ps_msg}'",
            ]
        )
    elif sys.platform == "linux":
        if shutil.which("notify-send"):
            sent = _run(["notify-send", title, message])
    if not sent:
        print(f"[staysharp] {title}: {message}")
