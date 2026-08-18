import os
from pathlib import Path

DATA_DIR = Path.home() / ".staysharp"
CONFIG_FILE = DATA_DIR / "config.json"
ACTIVE_SESSION_FILE = DATA_DIR / "active-session.json"
AGENT_STATUS_FILE = DATA_DIR / "agent-status.json"
ANSWERS_DIR = DATA_DIR / "answers"
HISTORY_FILE = DATA_DIR / "history.jsonl"


def claude_settings_path() -> Path:
    # CLAUDE_CONFIG_DIR relocates ~/.claude; respect it when set.
    base = os.environ.get("CLAUDE_CONFIG_DIR")
    if base:
        return Path(base) / "settings.json"
    return Path.home() / ".claude" / "settings.json"


def ensure_data_dirs() -> None:
    ANSWERS_DIR.mkdir(parents=True, exist_ok=True)
