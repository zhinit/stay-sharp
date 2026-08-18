import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from staysharp.context import git_context, recent_prompts


def _entry(type_, content):
    return json.dumps({"type": type_, "message": {"role": "user", "content": content}})


class RecentPromptsTest(unittest.TestCase):
    def _write(self, lines):
        tmp = tempfile.NamedTemporaryFile(
            "w", suffix=".jsonl", delete=False, encoding="utf-8"
        )
        tmp.write("\n".join(lines) + "\n")
        tmp.close()
        self.addCleanup(Path(tmp.name).unlink)
        return Path(tmp.name)

    def test_extracts_string_user_prompts_in_order(self):
        path = self._write(
            [
                _entry("user", "first prompt"),
                _entry("assistant", "irrelevant"),
                _entry("user", "second prompt"),
            ]
        )
        self.assertEqual(recent_prompts(path), ["first prompt", "second prompt"])

    def test_skips_tool_results_and_injected_context(self):
        path = self._write(
            [
                _entry("user", [{"type": "tool_result", "content": "output"}]),
                _entry("user", "<system-reminder>injected</system-reminder>"),
                _entry("user", "the actual task"),
            ]
        )
        self.assertEqual(recent_prompts(path), ["the actual task"])

    def test_keeps_only_last_three(self):
        path = self._write([_entry("user", f"prompt {i}") for i in range(5)])
        self.assertEqual(
            recent_prompts(path), ["prompt 2", "prompt 3", "prompt 4"]
        )

    def test_malformed_lines_fall_through(self):
        path = self._write(["not json at all", '{"type": "user"}', _entry("user", "ok")])
        self.assertEqual(recent_prompts(path), ["ok"])

    def test_missing_file_returns_empty(self):
        self.assertEqual(recent_prompts(Path("/nonexistent/x.jsonl")), [])


class GitContextTest(unittest.TestCase):
    def test_git_repo_yields_subjects(self):
        tmp = tempfile.mkdtemp()
        env_args = dict(cwd=tmp, capture_output=True, check=True)
        subprocess.run(["git", "init", "-q"], **env_args)
        subprocess.run(["git", "config", "user.email", "t@t"], **env_args)
        subprocess.run(["git", "config", "user.name", "t"], **env_args)
        Path(tmp, "a.txt").write_text("x")
        subprocess.run(["git", "add", "."], **env_args)
        subprocess.run(["git", "commit", "-q", "-m", "add feature foo"], **env_args)
        ctx = git_context(tmp)
        self.assertIsNotNone(ctx)
        self.assertIn("add feature foo", ctx)

    def test_non_repo_returns_none(self):
        tmp = tempfile.mkdtemp()
        self.assertIsNone(git_context(tmp))


if __name__ == "__main__":
    unittest.main()
