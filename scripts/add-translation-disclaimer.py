#!/usr/bin/env python3
"""Add AI translation disclaimer to every translated docs page.
Inserts the disclaimer after the first line (title) so it appears above any ToS warning.
"""
import re
from pathlib import Path

DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"
LOCALES = ("zh", "ja", "ko", "pt", "es", "fr", "it")
DISCLAIMER = '''!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."
'''
EXISTING_MARKER = "This translation was generated using artificial intelligence"


def is_translated(path: Path) -> bool:
    return path.suffix == ".md" and any(path.stem.endswith(f".{loc}") for loc in LOCALES)


def main():
    translated = sorted(DOCS_DIR.glob("*.*.md"))
    translated = [p for p in translated if is_translated(p)]
    for path in translated:
        text = path.read_text(encoding="utf-8")
        if EXISTING_MARKER in text:
            continue
        # Insert after first line (title or first line)
        first_newline = text.find("\n")
        if first_newline == -1:
            insert_at = len(text)
            before, after = text, ""
        else:
            insert_at = first_newline + 1
            before, after = text[:insert_at], text[insert_at:]
        new_content = before + DISCLAIMER + "\n" + after
        path.write_text(new_content, encoding="utf-8")
        print(path.name)


if __name__ == "__main__":
    main()
