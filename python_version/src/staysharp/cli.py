import argparse

from staysharp import __version__
from staysharp.config import DIFFICULTIES, load_config, prompt_config


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="staysharp",
        description="Practice short handcoding problems while your AI "
        "coding agent works. Run with no arguments to start practicing.",
    )
    parser.add_argument(
        "--version", action="version", version=f"staysharp {__version__}"
    )
    parser.add_argument("--topic", help="practice this topic for this run only")
    parser.add_argument(
        "--difficulty",
        choices=DIFFICULTIES,
        help="difficulty for this run only",
    )
    sub = parser.add_subparsers(dest="command")
    init = sub.add_parser(
        "init", help="install the Claude Code hooks (session tracking, notifications)"
    )
    init.add_argument(
        "--remove", action="store_true", help="remove the StaySharp hooks"
    )
    sub.add_parser("config", help="change saved topic source and difficulty")
    hook = sub.add_parser("hook")  # internal, invoked by the installed hooks
    hook.add_argument("event", choices=["prompt", "stop", "notification"])

    args = parser.parse_args()

    if args.command == "hook":
        from staysharp.hooks import run_hook

        run_hook(args.event)
        return
    if args.command == "init":
        from staysharp.hooks import install_hooks

        install_hooks(remove=args.remove)
        return
    if args.command == "config":
        prompt_config()
        return

    cfg = load_config()
    if cfg is None:
        cfg = prompt_config()
    from staysharp.practice import run_practice

    run_practice(cfg, args.topic, args.difficulty)


if __name__ == "__main__":
    main()
