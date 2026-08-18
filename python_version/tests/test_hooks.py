import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from staysharp import hooks


class InstallHooksTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.settings = self.tmp / "settings.json"
        patcher = mock.patch.dict(
            os.environ, {"CLAUDE_CONFIG_DIR": str(self.tmp)}
        )
        patcher.start()
        self.addCleanup(patcher.stop)

    def _read(self):
        return json.loads(self.settings.read_text())

    def test_installs_three_events(self):
        hooks.install_hooks()
        data = self._read()
        for event in ("UserPromptSubmit", "Stop", "Notification"):
            self.assertIn(event, data["hooks"])

    def test_userpromptsubmit_is_async(self):
        hooks.install_hooks()
        handler = self._read()["hooks"]["UserPromptSubmit"][0]["hooks"][0]
        self.assertTrue(handler["async"])
        self.assertEqual(handler["type"], "command")

    def test_idempotent(self):
        hooks.install_hooks()
        hooks.install_hooks()
        data = self._read()
        for event in ("UserPromptSubmit", "Stop", "Notification"):
            self.assertEqual(len(data["hooks"][event]), 1)

    def test_preserves_foreign_hooks(self):
        existing = {
            "hooks": {
                "Stop": [{"hooks": [{"type": "command", "command": "echo hi"}]}]
            },
            "model": "opus",
        }
        self.settings.write_text(json.dumps(existing))
        hooks.install_hooks()
        data = self._read()
        self.assertEqual(data["model"], "opus")
        stop_commands = [
            h["command"] for g in data["hooks"]["Stop"] for h in g["hooks"]
        ]
        self.assertIn("echo hi", stop_commands)
        self.assertEqual(len(data["hooks"]["Stop"]), 2)

    def test_remove_strips_only_ours(self):
        existing = {
            "hooks": {
                "Stop": [{"hooks": [{"type": "command", "command": "echo hi"}]}]
            }
        }
        self.settings.write_text(json.dumps(existing))
        hooks.install_hooks()
        hooks.install_hooks(remove=True)
        data = self._read()
        self.assertEqual(len(data["hooks"]["Stop"]), 1)
        self.assertNotIn("UserPromptSubmit", data["hooks"])
        self.assertNotIn("Notification", data["hooks"])

    def test_remove_on_clean_file_leaves_no_hooks_key(self):
        hooks.install_hooks()
        hooks.install_hooks(remove=True)
        self.assertNotIn("hooks", self._read())


if __name__ == "__main__":
    unittest.main()
