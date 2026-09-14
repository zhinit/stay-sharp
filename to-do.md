# To do (TypeScript version)

## Provider and config
- [x] Config file at ~/.config/staysharp/config.json
- [x] Claude provider: shell out to `claude -p`
- [x] Set up wizard skeleton
- [x] provide a way to enter the wizard
- [x] run smoke test at end of wizard to confirm it worked
- [ ] Add local llm option as provider. offer to install

## Distribution
- [ ] Clean ups, Refactors, and Error handling
- [ ] README
- [ ] Standalone binaries via GitHub releases
- [ ] Homebrew formula
- [ ] npm as fallback
- [ ] Deploy web app publicly

## Web app
- [ ] Same session flow as the CLI, using `core`

## Improvements after distribution
- [ ] Grader tools: run code, fetch docs, read repo
- [ ] MCP server, pick topics from current repo
- [ ] Evals for local models
- [ ] RAG: quiz me on this PDF or repo
- [ ] Stream responses as they arive

## Parked
- Leetcode-style problems
- Syllabus / learn any topic
- Shared question DB with voting
- Mobile, desktop
- Training own models
- Save history to SQLite, spaced repetition
