"""The practice loop: one ClaudeSDKClient session per run, so the whole
tab is a single continuous conversation. The model generates a question,
the user answers in their editor, the model grades as the next turn."""

import asyncio
import re
import sys
from datetime import datetime, timezone

from staysharp.context import project_context
from staysharp.editor import edit_file
from staysharp.history import append_history
from staysharp.paths import ANSWERS_DIR, ensure_data_dirs
from staysharp.status import StatusWatcher, print_notice_if_any

SYSTEM_PROMPT = """You are a practice coach for a developer waiting on a \
long-running task. You generate short handcoding or conceptual questions \
and grade the answers.

Rules for questions:
- Short only: a one-liner, a few lines of code, or a conceptual question. \
Never long leetcode-style problems.
- Difficulty is conceptual difficulty, since every question is short.
- Output only the question text, nothing else.

Rules for grading:
- First line: "Grade: <letter grade>".
- Then "Good:" with what was good.
- Then "Improve:" with what to improve.
- Be brief and concrete. Nothing after that.

When asked for the next question, ask something new, related to the same \
topics but not a repeat."""

ANSWER_MARKER = "--- write your answer below this line ---"


def _build_first_prompt(context: str | None, topics: list[str], difficulty: str) -> str:
    if context:
        basis = (
            "Base questions on what the user is currently building:\n" + context
        )
    else:
        basis = "Topics to draw questions from: " + ", ".join(topics)
    return (
        f"{basis}\n\nDifficulty: {difficulty}.\n"
        "Give me the first question."
    )


async def _ask(client, text: str) -> str:
    await client.query(text)
    parts: list[str] = []
    final = None
    async for message in client.receive_response():
        content = getattr(message, "content", None)
        if isinstance(content, list):
            for block in content:
                block_text = getattr(block, "text", None)
                if isinstance(block_text, str):
                    parts.append(block_text)
        result = getattr(message, "result", None)
        if isinstance(result, str):
            final = result
    if parts:
        return "\n".join(parts).strip()
    return (final or "").strip()


def _collect_answer(question: str, number: int) -> tuple[str, str]:
    ensure_data_dirs()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    path = ANSWERS_DIR / f"{stamp}-q{number}.md"
    commented_question = "\n".join(f"# {line}" for line in question.splitlines())
    path.write_text(
        f"{commented_question}\n#\n# Save and close your editor when done.\n"
        f"{ANSWER_MARKER}\n\n"
    )
    edit_file(path)
    text = path.read_text()
    if ANSWER_MARKER in text:
        answer = text.split(ANSWER_MARKER, 1)[1].strip()
    else:
        answer = text.strip()
    return answer, str(path)


def _grade_of(feedback: str) -> str:
    match = re.search(r"^\s*Grade\s*[:\-]\s*(.+)$", feedback, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return feedback.splitlines()[0].strip() if feedback else ""


def _continue_prompt() -> bool:
    with StatusWatcher():
        try:
            reply = input("\nNext question? [Y/n] ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            return False
    return reply in ("", "y", "yes")


async def _run(topics: list[str], topic_label: str, difficulty: str) -> None:
    from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient

    options = ClaudeAgentOptions(
        system_prompt=SYSTEM_PROMPT,
        allowed_tools=[],
        permission_mode="dontAsk",
    )
    context = None
    if not topics:
        context = project_context()
        if context is None:
            sys.exit(
                "No project context found (no active Claude Code session, no "
                "git history). Run with --topic, or `staysharp config` to set "
                "manual topics."
            )
    async with ClaudeSDKClient(options=options) as client:
        prompt = _build_first_prompt(context, topics, difficulty)
        number = 1
        while True:
            print("Thinking of a question...\n")
            question = await _ask(client, prompt)
            if not question:
                sys.exit("Got no question back from the model.")
            print(question)
            print_notice_if_any()
            answer, answer_file = _collect_answer(question, number)
            if not answer:
                print("Empty answer, skipping grading.")
            else:
                print("\nGrading...\n")
                feedback = await _ask(
                    client, f"My answer:\n\n{answer}\n\nGrade it."
                )
                print(feedback)
                append_history(
                    topic_label, difficulty, question, answer_file,
                    _grade_of(feedback),
                )
            print_notice_if_any()
            if not _continue_prompt():
                break
            number += 1
            prompt = "Next question."


def run_practice(cfg: dict, topic_override: str | None, difficulty_override: str | None) -> None:
    # Auth comes from the SDK's shared Claude Code auth layer: subscription
    # OAuth from /login, CLAUDE_CODE_OAUTH_TOKEN, or ANTHROPIC_API_KEY.
    # An API key takes precedence over the subscription if both are present.
    difficulty = difficulty_override or cfg["difficulty"]
    if topic_override:
        topics = [topic_override]
        topic_label = topic_override
    elif cfg["topic_source"] == "manual":
        topics = cfg["topics"]
        topic_label = ", ".join(topics)
    else:
        topics = []
        topic_label = "project"
    try:
        asyncio.run(_run(topics, topic_label, difficulty))
    except KeyboardInterrupt:
        print()
