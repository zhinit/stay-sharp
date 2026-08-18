"""Install/remove StaySharp hooks in Claude Code user settings, and the
handlers those hooks invoke (`staysharp hook <event>`).

Settings JSON structure: hooks.<EventName> is an array of matcher groups,
each with a "hooks" array of handlers. Stop, UserPromptSubmit, and
Notification need no matcher. Merging is idempotent and never touches
hooks that are not ours.
"""

import json
import shutil
import sys
from datetime import datetime, timezone

from staysharp.notify import notify
from staysharp.paths import (
    ACTIVE_SESSION_FILE,
    AGENT_STATUS_FILE,
    claude_settings_path,
    ensure_data_dirs,
)

HOOK_MARKER = "staysharp"


def _hook_command(event: str) -> str:
    exe = shutil.which("staysharp")
    if exe:
        return f'"{exe}" hook {event}'
    return f'"{sys.executable}" -m staysharp hook {event}'


def _our_handler(handler: dict) -> bool:
    cmd = handler.get("command", "")
    return handler.get("type") == "command" and HOOK_MARKER in cmd and " hook " in cmd


def _strip_ours(settings: dict) -> None:
    hooks = settings.get("hooks")
    if not isinstance(hooks, dict):
        return
    for event in list(hooks):
        groups = hooks[event]
        if not isinstance(groups, list):
            continue
        for group in groups:
            if isinstance(group, dict) and isinstance(group.get("hooks"), list):
                group["hooks"] = [h for h in group["hooks"] if not _our_handler(h)]
        hooks[event] = [
            g for g in groups if not (isinstance(g, dict) and g.get("hooks") == [])
        ]
        if hooks[event] == []:
            del hooks[event]
    if hooks == {}:
        del settings["hooks"]


def _load_settings(path) -> dict:
    if not path.exists():
        return {}
    try:
        settings = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"Cannot parse {path}: {e}. Not touching it.")
    if not isinstance(settings, dict):
        sys.exit(f"{path} is not a JSON object. Not touching it.")
    return settings


def install_hooks(remove: bool = False) -> None:
    path = claude_settings_path()
    settings = _load_settings(path)
    _strip_ours(settings)
    if not remove:
        hooks = settings.setdefault("hooks", {})
        entries = {
            # async so it never blocks the work session
            "UserPromptSubmit": {
                "type": "command",
                "command": _hook_command("prompt"),
                "async": True,
            },
            "Stop": {"type": "command", "command": _hook_command("stop")},
            "Notification": {
                "type": "command",
                "command": _hook_command("notification"),
            },
        }
        for event, handler in entries.items():
            hooks.setdefault(event, []).append({"hooks": [handler]})
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(settings, indent=2) + "\n")
    if remove:
        print(f"StaySharp hooks removed from {path}")
    else:
        print(f"StaySharp hooks installed in {path}")
        print("They take effect in new Claude Code sessions.")


def _write_json(path, data: dict) -> None:
    ensure_data_dirs()
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2) + "\n")
    tmp.replace(path)


def run_hook(event: str) -> None:
    """Entry point for the installed hooks. Reads hook JSON on stdin."""
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        data = {}
    now = datetime.now(timezone.utc).isoformat()
    if event == "prompt":
        _write_json(
            ACTIVE_SESSION_FILE,
            {
                "transcript_path": data.get("transcript_path"),
                "cwd": data.get("cwd"),
                "timestamp": now,
            },
        )
    elif event == "stop":
        _write_json(AGENT_STATUS_FILE, {"state": "done", "timestamp": now})
        notify("StaySharp", "Your agent finished its turn.")
    elif event == "notification":
        _write_json(AGENT_STATUS_FILE, {"state": "waiting", "timestamp": now})
        notify("StaySharp", "Your agent is waiting on input.")
    else:
        sys.exit(f"Unknown hook event: {event}")
