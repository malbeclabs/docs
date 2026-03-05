#!/usr/bin/env python3
"""Auto-translate MkDocs markdown files using Claude API."""

import os
import sys
import anthropic

client = anthropic.Anthropic()

LANGUAGES = {
    "zh": "Chinese (Simplified)",
    "ja": "Japanese",
    "ko": "Korean",
    "pt": "Portuguese",
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
}

SYSTEM_PROMPT = """\
You are a technical documentation translator.

Rules:
- Preserve ALL markdown formatting exactly: headings, bold, italic, lists, tables, admonitions, code fences
- Do NOT translate: code blocks, inline code, file paths, URLs, hostnames, IP addresses, CLI commands,
  flags, env variable names, config keys, YAML/TOML keys, product names, brand names
- Translate all human-readable prose, headings, descriptions, and UI labels
- Keep the exact same document structure, blank lines, and whitespace patterns
- Output ONLY the translated document — no preamble, no explanation"""


def translate(content: str, lang_name: str) -> str:
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=8192,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Translate the following documentation to {lang_name}:\n\n{content}",
            }
        ],
    )
    return message.content[0].text


def main():
    changed_files = os.environ.get("CHANGED_FILES", "").strip().splitlines()
    target_langs = [
        lang.strip()
        for lang in os.environ.get("LANGUAGES", "zh,ja,ko,pt,es,fr,it").split(",")
        if lang.strip()
    ]

    source_files = [f.strip() for f in changed_files if f.strip() and f.endswith(".md")]

    if not source_files:
        print("No changed source files.")
        return

    for filepath in source_files:
        print(f"\n{filepath}")

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except FileNotFoundError:
            print("  skipped (deleted)")
            continue

        base = filepath[:-3]  # strip .md

        for lang in target_langs:
            if lang not in LANGUAGES:
                print(f"  {lang}: unknown locale, skipping")
                continue

            output_path = f"{base}.{lang}.md"
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
