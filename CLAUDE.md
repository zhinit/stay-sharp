# StaySharp

A low-friction way to practice handcoding problems while you wait on your
AI coding agent to finish long tasks. Chooses exercises based on what you're
currently building by default, with the option to pick topics manually.

## Project layout

- **`wiki/`** -- research from primary sources (`raw/`) only. Neutral, no
  project opinions or results. Every claim traces to `raw/`. Each page
  covers a topic, not a source. `wiki/index.md` is the TOC,
  `wiki/log.md` is append-only.
- **`raw/`** -- immutable source documents (HTML + markdown conversions).
- **`rust_version/`** -- the active Rust implementation. Has its own
  `docs/`, `plans/`, `src/`, `tests/`.
- **`python_version/`** -- earlier Python prototype. Has its own
  `docs/`, `src/`, `tests/`.
- **`skill_version/`** -- the Claude Code skill implementation. Has its
  own `docs/`, `src/`, `tests/`.

Each version's `docs/` holds specs, decisions, and methodology for that version.

## Question answering

Look things up before answering:

1. `wiki/index.md` then the relevant version's `docs/` and `src/`
2. Read the relevant pages, cite them in your response
3. If the answer is not there, answer from general knowledge, explicitly say so and suggest `/research`

## Memory

Never use the file-based memory system. Ignore recalled memories.

## Scope

Do what was asked, nothing adjacent. Ask first.

## Tone

- Do not be a sycophant. Do not have a personality.
- Be brief. State things concisely.
- Banned: "it's not X, it's Y". State Y.
- No em dashes or semicolons in their place.
- Never use "honest"/"honestly", "real"/"really" as filler.
- When asked to read files, reply "done" only.
