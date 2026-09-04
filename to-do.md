# To Do (after Rust version)

## Core improvements
- [ ] Teaching mode (explain topics, check understanding, distinct from quiz mode)
- [ ] Larger leetcode-style coding problems

## Database and caching
- [ ] Store generated questions and grading responses in a database
- [ ] Pull from cached questions when topic/difficulty/mode match exists
- [ ] Thumbs up/down on cached responses
- [ ] Auto-remove responses below a thumbs-down threshold, flag for manual review

## Multi-platform
- [ ] Extract core logic into an API server (session, LLM calls, question selection, grading, database)
- [ ] TUI as a client of the API
- [ ] Web app
- [ ] Native apps

## Expand scope
- [ ] Support any topic, not just coding
