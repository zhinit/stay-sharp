# Claude Code Agent View

Agent view (`claude agents`) is a terminal UI for managing multiple background
sessions from a single screen. It displays all sessions grouped by state and
lets you dispatch, monitor, peek, reply, attach, and delete.
(source: claude-code-agent-view-2026.md)

## Opening agent view

```bash
claude agents                    # open the UI
claude agents --cwd <path>       # scope to a directory
claude agents --json             # list sessions as JSON
```

Press `Esc` to exit. Press `←` on an empty prompt inside an attached session to
detach and return. (source: claude-code-agent-view-2026.md)

## Session states

| Icon | State | Meaning |
| --- | --- | --- |
| Animated | Working | Running tools or generating |
| Yellow | Needs input | Waiting for answer, permission, or prompt |
| Dimmed | Idle | Ready for next prompt |
| Green | Completed | Finished successfully |
| Red | Failed | Ended with error |
| Grey | Stopped | User-stopped |

Shape indicators: `✻`/`✽` = process alive, `∙` = process exited (can still
interact), `✢` = scheduled loop sleeping. (source: claude-code-agent-view-2026.md)

## Dispatching sessions

### From agent view

Type a task and press Enter. Prefix options
(source: claude-code-agent-view-2026.md):

- `<agent-name> <prompt>` or `@<agent-name>` to use a specific
  [[claude-code-subagents|subagent]]
- `@<repo>` to target a repository
- `/<command>` for [[claude-code-skills|skills]]/commands
- `! <command>` to run a shell command as a background job
- `Shift+Enter` to dispatch and attach immediately

### From inside a session

- `/bg` or `/background` moves the current session to background
- `/bg <prompt>` backgrounds with an additional instruction
- `/fork` copies the session into a new background session
- `/fork <prompt>` forks and starts working on the prompt

(source: claude-code-agent-view-2026.md)

### From the shell

```bash
claude --bg "<prompt>"
claude --bg --name "label" "<prompt>"
claude --bg --model opus "<prompt>"
claude --bg --exec 'command'
claude --agent <name> --bg "<prompt>"
```

(source: claude-code-agent-view-2026.md)

## Interacting with sessions

**Peek**: press `Space` to see the most recent output or question. Arrow keys
peek at adjacent sessions. Type a reply and press Enter.

**Attach**: press `Enter` or `→` to enter the full interactive conversation.
`←` on an empty prompt detaches. `Ctrl+Z` returns to where you started.

**Key shortcuts** (source: claude-code-agent-view-2026.md):

| Key | Action |
| --- | --- |
| `Ctrl+S` | Toggle grouping (state vs. directory) |
| `Ctrl+T` | Pin/unpin (pinned sessions keep running while idle) |
| `Ctrl+R` | Rename session |
| `Ctrl+X` | Stop session (press again to delete) |
| `Shift+↑`/`Shift+↓` | Reorder sessions |
| `Ctrl+G` | Open dispatch prompt in editor |

### Filtering

Type in the dispatch input (source: claude-code-agent-view-2026.md):

- `a:<name>` for sessions running a named agent
- `s:<state>` for sessions in a given state (e.g. `s:blocked`)
- `#<number>` or a PR URL for sessions working on a pull request

## Shell management commands

```bash
claude attach <id>       # attach to a session
claude logs <id>         # print recent output
claude stop <id>         # stop a session
claude rm <id>           # remove from list
claude respawn <id>      # restart a session
claude daemon status     # check supervisor health
claude daemon stop --any # stop supervisor and all sessions
```

(source: claude-code-agent-view-2026.md)

## The supervisor daemon

A per-user process that hosts background sessions independently of any terminal
or agent view instance. (source: claude-code-agent-view-2026.md)

- Starts automatically when you first background a session
- Keeps one pre-warmed worker ready for fast dispatch
- Restarts idle sessions after ~1 hour to free resources
- Pinned sessions (`Ctrl+T`) keep running while idle
- Survives binary updates and machine sleep

State is stored at (source: claude-code-agent-view-2026.md):

```
~/.claude/daemon.log              # supervisor log
~/.claude/daemon/roster.json      # running sessions
~/.claude/jobs/<id>/state.json    # per-session state
~/.claude/jobs/<id>/tmp/          # session scratch directory
```

Each session has `CLAUDE_JOB_DIR` set to its job directory. Sessions inherit
credentials from stored authentication and provider selection from the dispatch
shell environment.

## Worktree isolation

Background sessions automatically move into isolated git worktrees under
`.claude/worktrees/` before editing files. This prevents parallel sessions from
conflicting on the same files. (source: claude-code-agent-view-2026.md)

Claude commits and pushes changes when finishing, and opens pull requests when
tasks call for them. Never force-pushes or merges without explicit instruction.
(source: claude-code-agent-view-2026.md)

To disable worktree isolation, set in `.claude/settings.json`
(source: claude-code-agent-view-2026.md):

```json
{
  "worktree": {
    "bgIsolation": "none"
  }
}
```

## What carries over when backgrounding

When using `/bg`, `←`, or `/fork` (source: claude-code-agent-view-2026.md):

**Carries over**: running background shell commands, backgrounded
[[claude-code-subagents|subagents]], dynamic workflows, scheduled tasks
(`/loop`), MCP servers and [[claude-code-plugins|plugins]] loaded at launch,
`--add-dir` directories, permission mode, model, effort level, color and name
settings.

**Stops**: running monitors, foreground shell commands, processes running inside
subagents.

## Deleting sessions

Agent view delete (`Ctrl+X` twice) removes the worktree and uncommitted
changes. `claude rm` keeps the worktree if it has uncommitted or unpushed
changes. The transcript always stays on disk and is available via
`claude --resume`. Protected worktrees (unpushed commits, another session
running inside, or user-created) are not removed.
(source: claude-code-agent-view-2026.md)

## Configuration

```bash
claude agents --permission-mode plan
claude agents --model opus
claude agents --effort high
claude agents --agent <subagent>
claude agents --settings ./settings.json
claude agents --add-dir <path>
claude agents --mcp-config <file-or-json>
```

Inside agent view, `/model opus` overrides the model for the next dispatch.
`/model default` clears the override.
(source: claude-code-agent-view-2026.md)

## Limitations

- Background sessions consume rate-limit quota like interactive ones
- Sessions are local to your machine and stop on shutdown (preserved across
  sleep)
- Worktrees created by Claude are deleted with the session in agent view;
  commit changes first

(source: claude-code-agent-view-2026.md)

## Related pages

- [[claude-code-subagents]]
- [[claude-code-sessions]]
- [[claude-code-hooks]]
