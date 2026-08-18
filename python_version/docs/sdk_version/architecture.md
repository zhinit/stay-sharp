# StaySharp CLI Architecture (v0)

Python 3.10+ package in `src_sdk/staysharp/`, entry point `staysharp`,
one dependency (`claude-agent-sdk`). Data lives in `~/.staysharp/`:
`config.json`, `active-session.json`, `agent-status.json`, `answers/`,
`history.jsonl`.

Modules:

- `cli.py` -- argparse, dispatch to init, config, hook handler, practice.
- `config.py` -- load, save, and prompt for config.
- `hooks.py` -- idempotent install/remove of three hooks in
  `~/.claude/settings.json`, never touching other hooks, plus the
  `staysharp hook <event>` handlers: `UserPromptSubmit` (async) writes
  `active-session.json` with transcript path and cwd, `Stop` writes
  `agent-status.json` state `done` and notifies, `Notification` writes
  state `waiting` and notifies.
- `context.py` -- task description from the active session transcript
  (fresh mtime, last few user-prompt entries: `type == "user"` with
  string `message.content` not starting with `<`), falling back to git
  log and diff. Any parse error falls through.
- `practice.py` -- one `ClaudeSDKClient` per run so the whole run is one
  conversation. No tools, `permission_mode="dontAsk"`. Question turn,
  editor round-trip, grading turn, continue loop.
- `editor.py` -- resolve `VISUAL` then `EDITOR`, execute through the
  shell, wait in foreground. Unix default `vi`, Windows errors if unset.
- `notify.py` -- desktop notification per platform: `osascript` (macOS),
  `notify-send` (Linux), PowerShell toast (Windows and WSL2). Falls back
  to printing in the terminal.
- `status.py` -- watches `agent-status.json` to show the inline
  agent-done notice during the loop.
- `history.py` -- one JSONL line per graded answer.
- `paths.py` -- path constants. Respects `CLAUDE_CONFIG_DIR` for the
  settings path.
