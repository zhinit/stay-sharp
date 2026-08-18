# StaySharp

A low-friction way to practice handcoding problems while you wait on your
AI coding agent to finish long tasks. Chooses exercises based on what you're
currently building by default, with the option to pick topics manually.

## Separation of concerns

Information lives in exactly one place:

- **`wiki/`** -- research from primary sources (`raw/`) only. Neutral, no
  project opinions or results. Every claim traces to `raw/`. Each page
  covers a topic, not a source. `wiki/index.md` is the TOC,
  `wiki/log.md` is append-only.
- **`docs/`** -- project conclusions, opinions, methodology, decisions.
- **`raw/`** -- immutable source documents (HTML + markdown conversions).
- **`src_sdk/`** -- the CLI implementation (Agent SDK). **`src_skill/`** --
  the Claude Code skill implementation. Our own results also live here.

## Question answering

Look things up before answering:

1. `wiki/index.md` then `docs/` then `src_sdk/` and `src_skill/`
2. Read the relevant pages, cite them in your response
3. If the answer is not there, answer from general knowlege, explicitly say so and suggest `/research`

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
