"""Launch the user's editor on a file and wait for it to exit.

Resolution: VISUAL, then EDITOR. The value goes through the shell since
it may contain flags or spaced paths. Unix default is vi. No documented
Windows default exists, so Windows with neither set is an error.
"""

import os
import subprocess
import sys
from pathlib import Path


def resolve_editor() -> str:
    for var in ("VISUAL", "EDITOR"):
        value = os.environ.get(var, "").strip()
        if value:
            return value
    if os.name == "nt":
        sys.exit("No editor configured. Set the EDITOR environment variable.")
    return "vi"


def edit_file(path: Path) -> None:
    editor = resolve_editor()
    result = subprocess.run(f'{editor} "{path}"', shell=True)
    if result.returncode != 0:
        print(f"[staysharp] editor exited with code {result.returncode}")
