# StaySharp CLI Spec (v0)

A CLI run in a second terminal tab while a Claude Code agent works on a
long task in the first.

- `staysharp` asks a short handcoding or conceptual question immediately.
  First run prompts for topic source (project or manual) and difficulty
  (easy/medium/hard), then remembers. `--topic` and `--difficulty`
  override per run. `staysharp config` changes saved defaults.
- Project-based topics come from the active Claude Code session's recent
  prompts, falling back to recent git commits and diff.
- Questions are short only: one-liners, a few lines of code, or
  conceptual. Difficulty means conceptual difficulty.
- Answers are written in the user's editor. Grading returns a letter
  grade, what was good, what to improve. A continue prompt loops to the
  next question in the same conversation.
- `staysharp init` installs Claude Code hooks for session tracking and
  desktop notifications when the agent finishes or waits on input. The
  practice tab also shows the notice inline. `staysharp init --remove`
  uninstalls.
- Graded answers append to a history file. No reader UI.
- Auth: the SDK's shared Claude Code auth layer (subscription OAuth,
  OAuth token, or API key). Usage draws from subscription limits when no
  API key is set.
