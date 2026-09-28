#!/usr/bin/env python3
"""Auto-translate MkDocs markdown files using Claude API.

translations.json records, for every translation, the git blob hash of the
English source it was made from. A translation is out of date when it is
missing or its recorded hash differs from the source's current hash.

Choosing what to translate (combine with --dry-run to preview):

  (no selector)   every out-of-date translation
  --changed REF   out-of-date translations of pages changed in REF...HEAD
  --files A B     every translation of A and B, current or not (repairs)
"""

import argparse
import glob
import hashlib
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

LANGUAGES = {
    "zh": "Chinese (Simplified)",
    "ja": "Japanese",
    "ko": "Korean",
    "pt": "Portuguese",
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
}

MANIFEST = "translations.json"

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


def translate(client, content: str, lang_name: str) -> str:
    # Long outputs require streaming; the SDK rejects large max_tokens on plain create().
    with client.messages.stream(
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


def _changed(since: str) -> set:
    # Three dots: diff from the merge base, so commits on the other side don't count.
    return {f for f in _git("diff", "--name-only", f"{since}...HEAD", "--", "docs/").splitlines() if f}


def _translation_path(source: str, lang: str) -> str:
    return f"{source[:-3]}.{lang}.md"


def _blob_hash(data: bytes) -> str:
    """Same value as `git hash-object`, so the seed can read it from history."""
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def _load_manifest() -> dict:
    try:
        with open(MANIFEST, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def _save_manifest(manifest: dict) -> None:
    # Nested by source so the separator lines between pages stay unchanged and
    # two PRs editing different pages merge cleanly.
    kept = {src: langs for src, langs in manifest.items() if os.path.isfile(src)}
    with open(MANIFEST, "w", encoding="utf-8") as f:
        f.write(json.dumps(kept, indent=2, sort_keys=True, ensure_ascii=False) + "\n")


def _out_of_date(source: str, lang: str, manifest: dict, source_hash: str) -> bool:
    if not os.path.exists(_translation_path(source, lang)):
        return True
    return manifest.get(source, {}).get(lang) != source_hash


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--files", nargs="*", default=None, help="English sources to translate, current or not")
    parser.add_argument("--changed", metavar="REF", help="only pages changed in REF...HEAD")
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

    manifest = _load_manifest()

    if args.files is not None:
        files = [f.strip() for f in args.files if f.strip()]
        # Hand-picked files: a typo must fail the run, not pass as "nothing to translate".
        bad = [f for f in files if not (_is_source(f) and os.path.isfile(f))]
        if bad:
            sys.exit(f"Not English source pages under docs/: {', '.join(bad)}")
        plan = {f: list(target_langs) for f in files}
    else:
        candidates = _changed(args.changed) if args.changed else glob.glob("docs/**/*.md", recursive=True)
        plan = {}
        for f in sorted(candidates):
            if not _is_source(f) or not os.path.isfile(f):
                continue
            with open(f, "rb") as fh:
                source_hash = _blob_hash(fh.read())
            todo = [l for l in target_langs if _out_of_date(f, l, manifest, source_hash)]
            if todo:
                plan[f] = todo

    if not plan:
        print("Nothing to translate.")
        return

    for filepath, langs in plan.items():
        print(f"{filepath}: {', '.join(langs)}")
    print(f"{sum(len(l) for l in plan.values())} translation(s)")
    if args.dry_run:
        return

    import anthropic

    client = anthropic.Anthropic()
    workers = int(os.environ.get("TRANSLATE_WORKERS", "4"))
    failed = []
    try:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            jobs = {}
            for filepath, langs in plan.items():
                with open(filepath, "rb") as f:
                    data = f.read()
                # Hash what was sent, so an edit mid-run can't mark newer text as translated.
                source_hash = _blob_hash(data)
                content = data.decode("utf-8")
                for lang in langs:
                    job = pool.submit(translate, client, content, LANGUAGES[lang])
                    jobs[job] = (filepath, lang, source_hash)
            for job in as_completed(jobs):
                filepath, lang, source_hash = jobs[job]
                output_path = _translation_path(filepath, lang)
                try:
                    translated = job.result()
                except Exception as e:
                    print(f"✗ {output_path}: {e}")
                    failed.append(output_path)
                    continue
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(translated)
                manifest.setdefault(filepath, {})[lang] = source_hash
                print(f"✓ {output_path}")
    finally:
        # Keep whatever finished; failed translations stay out of date for the next run.
        _save_manifest(manifest)

    if failed:
        sys.exit(f"{len(failed)} translation(s) failed: {', '.join(sorted(failed))}")


if __name__ == "__main__":
    main()
