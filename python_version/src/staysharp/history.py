import json
from datetime import datetime, timezone

from staysharp.paths import HISTORY_FILE, ensure_data_dirs


def append_history(
    topic: str, difficulty: str, question: str, answer_file: str, grade: str
) -> None:
    ensure_data_dirs()
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "topic": topic,
        "difficulty": difficulty,
        "question": question,
        "answer_file": answer_file,
        "grade": grade,
    }
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
