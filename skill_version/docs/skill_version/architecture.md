# StaySharp Skill Architecture (v0)

One file: `src_skill/staysharp/SKILL.md`, symlinked at
`.claude/skills/staysharp` for this project. Symlink into
`~/.claude/skills/` to use it from any project.

Frontmatter carries the name and invocation description. The body defines
the coach behavior: context inference (git log and diff, other-session
transcript at `~/.claude/projects/<cwd with "/" replaced by "-">/`,
newest `.jsonl` that is not the current session), question rules, grading
format, and a read-only constraint. All state lives in the session
conversation.
