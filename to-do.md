# To do (TypeScript version)

Keep using the Rust CLI until this one replaces it.

## Setup
- [x] Bun workspace: `core`, `cli`, `web` packages
- [x] Linter 
- [x] Tests
- [x] CI

## Match rust version
- [x] start up questions
- [x] pull in env variables
- [x] wire up llm and grade a question
- [x] set up loop skeleton with follow ups too

## CLI modularize into cli and core
- [x] Multi-line editor with the same keybindings
- [x] Loading animation

## Web app
- [ ] Same session flow as the CLI, using `core`

## Improvements
- [ ] Esc cancels in-flight request, keeps editor text
- [ ] Mode parsing
- [ ] Few-shot examples in prompts
- [ ] Pre-generate next question in background
- [ ] Stream responses as they arive
- [ ] Error handling
- [ ] README

## Distribution
- [ ] Standalone binaries via GitHub releases
- [ ] Homebrew formula
- [ ] npm as fallback
- [ ] Deploy web app publicly

## Improvements after distribution
- [ ] Grader tools: run code, fetch docs, read repo
- [ ] MCP server, pick topics from current repo
- [ ] Evals for local models
- [ ] RAG: quiz me on this PDF or repo

## Parked
- Leetcode-style problems
- Syllabus / learn any topic
- Shared question DB with voting
- Mobile, desktop
- Training own models
- Save history to SQLite, spaced repetition
