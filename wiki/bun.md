# Bun

Bun is an all-in-one toolkit for JavaScript and TypeScript applications, shipping as a single executable that combines a runtime, package manager, test runner, and bundler (source: bun-docs-overview-2026.md).

## Architecture

Bun uses JavaScriptCore, Apple's engine developed for Safari, rather than V8 which powers Node.js and Deno (source: wikipedia-bun-software-2026.md). The project was originally written in Zig. In May 2026 creator Jarred Sumner began a major rewrite in Rust, encompassing over one million lines of code while maintaining compatibility with existing test suites (source: wikipedia-bun-software-2026.md).

## History

Jarred Sumner released Bun in September 2021. Version 1.0 reached stable on September 8, 2023. Version 1.1 in 2024 expanded platform support to Windows 10/11 and introduced the cross-platform [[bun-shell|Bun Shell]]. Version 1.3 in 2025 added hot module replacement to the dev server (source: wikipedia-bun-software-2026.md).

Oven, Bun's parent company, raised $7 million in August 2022 in a round led by Kleiner Perkins (source: wikipedia-bun-software-2026.md). On December 2, 2025, Anthropic acquired Bun. The acquisition announcement stated that Bun will remain open-source under the MIT License, with the goal of supporting Claude Code and the Claude Agent SDK (source: wikipedia-bun-software-2026.md).

## Platform support

Bun runs on Linux (x64 and arm64), macOS (x64 and Apple Silicon), and Windows (x64 and arm64) (source: bun-github-readme-2026.md). Installation is available through curl, Homebrew, npm, and Docker (source: bun-github-readme-2026.md):

```bash
curl -fsSL https://bun.com/install | bash
brew install bun
npm install -g bun
docker pull oven/bun
```

Upgrade with `bun upgrade` or `bun upgrade --canary` for canary builds (source: bun-github-readme-2026.md).

## Components

The four main components each have their own wiki page:

- **[[bun-runtime|Runtime]]** executes JavaScript and TypeScript with native transpilation, 4x faster startup than Node.js, and web-standard APIs (source: bun-docs-runtime-2026.md).
- **[[bun-package-manager|Package manager]]** installs dependencies up to 30x faster than npm with global caching and workspace support (source: bun-docs-overview-2026.md).
- **[[bun-test-runner|Test runner]]** provides Jest-compatible testing with TypeScript support, snapshots, and watch mode (source: bun-docs-overview-2026.md).
- **[[bun-bundler|Bundler]]** handles native bundling for JS/TS/JSX with code splitting, plugins, and HTML imports (source: bun-docs-overview-2026.md).

## APIs

Bun provides built-in APIs beyond the runtime basics:

- **[[bun-http-server|HTTP server]]** via `Bun.serve()` with routing, WebSocket, and HTTP/2 support.
- **[[bun-file-io|File I/O]]** via `Bun.file()` and `Bun.write()` with platform-optimized syscalls.
- **[[bun-sqlite|SQLite]]** via `bun:sqlite` with a synchronous, high-performance driver.
- **[[bun-shell|Shell]]** via the `$` template tag for cross-platform scripting.

Configuration is handled through [[bun-configuration|bunfig.toml]], and module resolution details are covered in [[bun-modules]].

## Stats

The GitHub repository at oven-sh/bun has 95.9k stars and 5k forks (source: bun-github-readme-2026.md).

**Related pages:** [[bun-runtime]], [[bun-package-manager]], [[bun-test-runner]], [[bun-bundler]], [[bun-http-server]], [[bun-file-io]], [[bun-sqlite]], [[bun-shell]], [[bun-configuration]], [[bun-modules]]
