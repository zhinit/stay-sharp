import json

from staysharp.paths import CONFIG_FILE, ensure_data_dirs

DIFFICULTIES = ("easy", "medium", "hard")


def load_config() -> dict | None:
    try:
        cfg = json.loads(CONFIG_FILE.read_text())
    except (OSError, json.JSONDecodeError):
        return None
    if cfg.get("topic_source") not in ("project", "manual"):
        return None
    if cfg.get("difficulty") not in DIFFICULTIES:
        return None
    return cfg


def save_config(cfg: dict) -> None:
    ensure_data_dirs()
    CONFIG_FILE.write_text(json.dumps(cfg, indent=2) + "\n")


def prompt_config() -> dict:
    print("StaySharp setup (saved to ~/.staysharp/config.json)")
    while True:
        source = input("Topic source, [p]roject-based or [m]anual? ").strip().lower()
        if source in ("p", "project"):
            source = "project"
            topics = []
            break
        if source in ("m", "manual"):
            source = "manual"
            raw = input("Topics (comma-separated): ").strip()
            topics = [t.strip() for t in raw.split(",") if t.strip()]
            if topics:
                break
            print("Enter at least one topic.")
    while True:
        difficulty = input("Difficulty (easy/medium/hard): ").strip().lower()
        if difficulty in DIFFICULTIES:
            break
        print("Pick easy, medium, or hard.")
    cfg = {"topic_source": source, "topics": topics, "difficulty": difficulty}
    save_config(cfg)
    return cfg
