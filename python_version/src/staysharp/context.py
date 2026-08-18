"""Extract a short description of what the user is currently building.

Order: active Claude Code session transcript (via the installed hook),
then git log/diff, then nothing. The transcript format is internal to
Claude Code and changes between versions, so any parse error falls
through to the next source.
"""

import json
import os
import subprocess
import time
from pathlib import Path

from staysharp.paths import ACTIVE_SESSION_FILE

FRESH_SECONDS = 6 * 3600
MAX_PROMPTS = 3
MAX_PROMPT_CHARS = 500


def recent_prompts(transcript_path: Path) -> list[str]:
    """Last few real user prompts from a session JSONL transcript.

    User prompts are entries with type == "user" and string
    message.content (tool results are arrays). Hook-injected context
    arrives in angle-bracket wrappers and is skipped.
    """
    prompts: list[str] = []
    try:
        with open(transcript_path, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if not isinstance(entry, dict) or entry.get("type") != "user":
                    continue
                message = entry.get("message")
                if not isinstance(message, dict):
                    continue
                content = message.get("content")
                if not isinstance(content, str):
                    continue
                content = content.strip()
                if not content or content.startswith("<"):
                    continue
                prompts.append(content[:MAX_PROMPT_CHARS])
    except OSError:
        return []
    return prompts[-MAX_PROMPTS:]


def _transcript_context() -> str | None:
    try:
        session = json.loads(ACTIVE_SESSION_FILE.read_text())
        transcript = Path(session["transcript_path"])
    except (OSError, json.JSONDecodeError, KeyError, TypeError):
        return None
    try:
        if time.time() - transcript.stat().st_mtime > FRESH_SECONDS:
            return None
    except OSError:
        return None
    prompts = recent_prompts(transcript)
    if not prompts:
        return None
    joined = "\n".join(f"- {p}" for p in prompts)
    return f"Recent prompts the user gave their coding agent (last is the current task):\n{joined}"


def _git(cwd: str, *args: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", *args], cwd=cwd, capture_output=True, text=True, timeout=10
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def git_context(cwd: str) -> str | None:
    log = _git(cwd, "log", "-5", "--format=%s")
    if log is None:
        return None
    diff = _git(cwd, "diff", "--stat") or ""
    parts = [f"Recent git commits in the user's project:\n{log}"]
    if diff:
        parts.append(f"Uncommitted changes:\n{diff}")
    return "\n".join(parts)


def project_context() -> str | None:
    ctx = _transcript_context()
    if ctx:
        return ctx
    cwd = None
    try:
        cwd = json.loads(ACTIVE_SESSION_FILE.read_text()).get("cwd")
    except (OSError, json.JSONDecodeError):
        pass
    for candidate in (cwd, os.getcwd()):
        if candidate:
            ctx = git_context(candidate)
            if ctx:
                return ctx
    return None
