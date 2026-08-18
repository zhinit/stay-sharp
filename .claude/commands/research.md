# research

Research a topic and fold it into the wiki. Searches the web and arXiv for
primary sources, archives them into `raw/` (immutable), and ingests them into
`wiki/`.

Usage: `/research <topic or question>`

## 1. Discover sources

Search for high-quality primary sources across these classes:

1. **The open web** — blogs, guides, production write-ups, GitHub repos,
   official documentation.
2. **arXiv** — academic papers for theory relevant to the project's domain.

**Programming topics** — when the topic is a programming framework, language,
or library, pull in a large amount of official documentation. The goal is to
learn the current, idiomatic API surface so that code written in this project
uses modern, up-to-date syntax. Fetch multiple doc pages (guides, API
references, tutorials, migration notes) — not just a single overview. Check
GitHub first — if the docs live in a repo (e.g. a `docs/` folder or markdown
files), pull from there directly. Raw markdown from GitHub is much more
efficient than fetching HTML and converting.

Prefer primary sources over aggregators. Present the candidate sources to the
user as a list with titles and URLs, then wait for approval — unless the user
says to grab them all.

## 2. Archive raw sources

For each approved source:

1. Fetch the full raw HTML and save it to `raw/html/<descriptive-name>.html`.
2. Convert it to faithful markdown and save it to `raw/md/<same-name>.md`.

Use a descriptive, lowercase-hyphenated filename (e.g.
`<source-name>-<topic>-<year>.md`). The markdown in `raw/md/` is the source of
truth: it must be the **full source content as-is**, not a summary or
interpretation.

Files in `raw/html/` and `raw/md/` are **immutable** once saved — never modify
them. If a source can't be fetched (paywall, 429, etc.), note it and move on.

## 3. Ingest into the wiki

1. Read the full source document(s).
2. Discuss key takeaways with the user before writing anything.
3. Create or update **topic pages** — each page covers a concept, technique,
   entity, or idea, not an individual source. A source contributes cited facts
   to whichever topic pages it's relevant to; it never gets its own summary page.
4. Add wiki-links (`[[page-name]]`) to connect related pages.
5. Update `wiki/index.md` with new pages and one-line descriptions.
6. Append an entry to `wiki/log.md` with the date, source name, and what changed.

A single source may touch 10–15 wiki pages. That is normal.

## Wiki page format

Every wiki page follows this format:

- H1 title on line 1; content organized into `##` sections of prose.
- Every factual claim or section carries an inline citation
  `(source: <file>.md)` naming a file that exists in `raw/md/`. Citations
  point to raw sources only, never to other wiki pages.
- Wiki links are `[[page-name]]`, or `[[page-name|display text]]` for custom
  display text. The target page must exist.
- A closing **Related pages** section is optional.
- `wiki/index.md` lists every page with a one-line description;
  `wiki/log.md` is append-only.

Contradictions between sources are noted explicitly. Never fabricate facts,
figures, APIs, or claims about the domain.
