# StaySharp Spec

## Problem

Developers spend a lot of time waiting on AI coding agents.
That idle time could be used to practice handcoding fundamentals.

## Solution

A CLI tool that serves bite-sized coding exercises in the terminal.
Run `staysharp`, answer a few setup questions, and start practicing.

## Guiding Principles

- Least friction possible
- Enjoyable user experience
- Third-party agnostic (works with any LLM provider)

## Session Flow

1. User runs `staysharp`
2. Setup questions:
   - Mode: write code, read code, or conceptual?
   - Topic: user types in a topic (e.g. "rust ownership", "react hooks")
   - Difficulty: easy, medium, hard
3. LLM generates a question based on the selections
4. User answers in the terminal (multi-line input: Shift+Enter for newline, Enter to submit)
5. LLM grades the answer, gives feedback
6. User can ask clarifying questions about the answer/topic. Loop until they're done.
7. Next question. Repeat from step 3 until the user quits.

## Question Types

Determined based on response to first question.

- **Write code**: short problems answerable in a few lines. Not leetcode.
- **Read code**: given a short code snippet, what's the output? Is there a bug?
- **Conceptual**: answer in a few sentences.

## LLM

User provides their own API key. Provider support decided during implementation.

## Distribution

Prebuilt binaries via GitHub releases and Homebrew. `cargo install` as a secondary option.

## Out of Scope (for now)

- Project/chat scanning for automatic topic selection
- Saving question history
- Code editor integration
- Config files
