# StaySharp Skill Spec (v0)

A `/staysharp` skill invoked in a second Claude Code tab while an agent
works in the first.

- `/staysharp` with optional topic and difficulty arguments (default
  medium). Otherwise it infers the topic from recent git commits and diff
  and from the most recent other session's user prompts. It asks for a
  topic only when every source is empty.
- One short handcoding or conceptual question per turn, answered in chat.
- Grading: letter grade, what was good, what to improve, then the next
  question unless told to stop.
- Read-only, no persistent state, no history. Runs on the user's
  subscription.
