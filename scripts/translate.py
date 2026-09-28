#!/usr/bin/env python3
"""Auto-translate MkDocs markdown files using Claude API.

Choosing what to translate (combine with --dry-run to preview):

  CHANGED_FILES env / --files   explicit English sources
  --pr-base SHA                 pages changed in the PR since the last
                                "chore: auto-translate docs" commit (or since
                                SHA if the bot has not run yet)
  --since REF --skip-translated pages changed in REF..HEAD whose translations
                                were not updated in the same range
  --stale                       every page with a missing translation or one
                                last committed before its English source
"""

import argparse
import glob
import os
import subprocess
import sys

LANGUAGES = {
    "zh": "Chinese (Simplified)",
    "ja": "Japanese",
    "ko": "Korean",
    "pt": "Portuguese",
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
}

BOT_COMMIT_MESSAGE = "chore: auto-translate docs"

SYSTEM_PROMPT = """\
You are a technical documentation translator.

Rules:
- Preserve ALL markdown formatting exactly: headings, bold, italic, lists, tables, admonitions, code fences
- Do NOT translate: code blocks, inline code, file paths, URLs, hostnames, IP addresses, CLI commands,
  flags, env variable names, config keys, YAML/TOML keys, product names, brand names
- Do NOT translate heading IDs like `{#feed-addresses}` or in-page link anchors like `(#feed-addresses)`;
  copy them exactly so jump links keep working in every language
- Translate all human-readable prose, headings, descriptions, and UI labels
- Keep the exact same document structure, blank lines, and whitespace patterns
- Output ONLY the translated document — no preamble, no explanation"""

_client = None


def translate(content: str, lang_name: str) -> str:
    global _client
    if _client is None:
        import anthropic

        _client = anthropic.Anthropic()
    # Long outputs require streaming; the SDK rejects large max_tokens on plain create().
    with _client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=64000,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Translate the following documentation to {lang_name}:\n\n{content}",
            }
        ],
    ) as stream:
        message = stream.get_final_message()
    if message.stop_reason != "end_turn":
        raise RuntimeError(f"incomplete translation (stop_reason={message.stop_reason})")
    return message.content[0].text


def _is_runbook(filepath: str) -> bool:
    name = filepath.replace("\\", "/").rsplit("/", 1)[-1]
    return name == "runbooks.md" or name.endswith("-runbook.md")


def _is_translation(filepath: str) -> bool:
    stem = filepath[:-3]
    return "." in stem.rsplit("/", 1)[-1] and stem.rsplit(".", 1)[-1] in LANGUAGES


def _is_source(filepath: str) -> bool:
    return (
        filepath.startswith("docs/")
        and filepath.endswith(".md")
        and not _is_translation(filepath)
        and not _is_runbook(filepath)
    )


def _git(*args: str) -> str:
    return subprocess.run(["git", *args], check=True, capture_output=True, text=True).stdout


def _changed(since: str, until: str = "HEAD") -> set:
    return {f for f in _git("diff", "--name-only", since, until, "--", "docs/").splitlines() if f}


def _last_commit_time(path: str) -> int:
    out = _git("log", "-1", "--format=%ct", "--", path).strip()
    return int(out) if out else 0


def _translation_path(source: str, lang: str) -> str:
    return f"{source[:-3]}.{lang}.md"


def plan_pr(base: str, langs: list) -> dict:
    """Pages changed since the bot last translated this PR, limited to the PR's own changes."""
    last_bot = _git(
        "log", "-1", "--format=%H", "--fixed-strings", f"--grep={BOT_COMMIT_MESSAGE}", f"{base}..HEAD"
    ).strip()
    in_pr = _changed(base)
    touched = _changed(last_bot) & in_pr if last_bot else in_pr
    if last_bot:
        print(f"Bot last translated at {last_bot[:12]}; only pages changed since then.")
    return {f: list(langs) for f in sorted(touched) if _is_source(f)}


def plan_since(since: str, langs: list, skip_translated: bool) -> dict:
    changed = _changed(since)
    plan = {}
    for f in sorted(changed):
        if not _is_source(f):
            continue
        todo = [l for l in langs if not (skip_translated and _translation_path(f, l) in changed)]
        if todo:
            plan[f] = todo
    return plan


def plan_stale(langs: list) -> dict:
    plan = {}
    for f in sorted(glob.glob("docs/**/*.md", recursive=True)):
        if not _is_source(f):
            continue
        source_time = _last_commit_time(f)
        todo = []
        for l in langs:
            t = _translation_path(f, l)
            if not os.path.exists(t) or _last_commit_time(t) < source_time:
                todo.append(l)
        if todo:
            plan[f] = todo
    return plan


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--files", nargs="*", default=None, help="English source files to translate")
    parser.add_argument("--pr-base", metavar="SHA", help="PR base commit")
    parser.add_argument("--since", metavar="REF", help="translate pages changed in REF..HEAD")
    parser.add_argument(
        "--skip-translated",
        action="store_true",
        help="with --since: skip languages whose translation changed in the same range",
    )
    parser.add_argument("--stale", action="store_true", help="translate missing or outdated translations")
    parser.add_argument("--dry-run", action="store_true", help="list what would be translated and exit")
    args = parser.parse_args()

    target_langs = [
        lang.strip()
        for lang in os.environ.get("LANGUAGES", ",".join(LANGUAGES)).split(",")
        if lang.strip()
    ]
    unknown = [l for l in target_langs if l not in LANGUAGES]
    if unknown:
        sys.exit(f"Unknown locale(s): {', '.join(unknown)}")

    if args.files is not None or os.environ.get("CHANGED_FILES", "").strip():
        files = args.files if args.files is not None else os.environ["CHANGED_FILES"].split("\n")
        plan = {f.strip(): list(target_langs) for f in files if f.strip() and _is_source(f.strip())}
    elif args.pr_base:
        plan = plan_pr(args.pr_base, target_langs)
    elif args.since:
        plan = plan_since(args.since, target_langs, args.skip_translated)
    elif args.stale:
        plan = plan_stale(target_langs)
    else:
        parser.error("choose what to translate: --files, --pr-base, --since, --stale, or CHANGED_FILES")

    if not plan:
        print("Nothing to translate.")
        return

    for filepath, langs in plan.items():
        print(f"\n{filepath}: {', '.join(langs)}")
        if args.dry_run:
            continue

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except FileNotFoundError:
            print("  skipped (deleted)")
            continue

        for lang in langs:
            output_path = _translation_path(filepath, lang)
            print(f"  → {output_path} ... ", end="", flush=True)

            try:
                translated = translate(content, LANGUAGES[lang])
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(translated)
                print("✓")
            except Exception as e:
                print(f"✗ {e}")
                sys.exit(1)


if __name__ == "__main__":
    main()
