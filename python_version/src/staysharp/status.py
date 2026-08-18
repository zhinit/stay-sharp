"""Inline agent-done notices from the flag file the Stop/Notification
hooks write."""

import json
import threading

from staysharp.paths import AGENT_STATUS_FILE

NOTICES = {
    "done": "your agent finished its turn — check your work tab",
    "waiting": "your agent is waiting on input — check your work tab",
}


def consume_status() -> str | None:
    """Read and clear agent-status.json. Returns the notice text, if any."""
    if not AGENT_STATUS_FILE.exists():
        return None
    try:
        state = json.loads(AGENT_STATUS_FILE.read_text()).get("state")
    except (OSError, json.JSONDecodeError):
        state = None
    try:
        AGENT_STATUS_FILE.unlink()
    except OSError:
        pass
    return NOTICES.get(state)


def print_notice_if_any() -> None:
    notice = consume_status()
    if notice:
        print(f"\n*** [staysharp] {notice} ***\n")


class StatusWatcher:
    """Polls the status file in the background while the user sits at a
    prompt. Not used while the editor is open, since terminal editors
    share the screen."""

    def __init__(self, interval: float = 2.0):
        self.interval = interval
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def _run(self) -> None:
        while not self._stop.wait(self.interval):
            notice = consume_status()
            if notice:
                print(f"\n*** [staysharp] {notice} ***")

    def __enter__(self):
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        return self

    def __exit__(self, *exc):
        self._stop.set()
        if self._thread:
            self._thread.join()
        return False
