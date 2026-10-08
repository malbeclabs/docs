"""MkDocs hook: keep moved pages reachable at their old URLs.

``redirects.json`` at the repo root maps old page URLs to new ones (paths
relative to the site root, ending in ``/``). For every locale this writes a
stub ``index.html`` at the old location that forwards to the new page and
keeps the ``#fragment``, plus an ``index.md`` stub naming the new Markdown URL
for agents that fetch raw Markdown.

The stubs serve GitHub Pages and ``mkdocs serve``. On Vercel,
``scripts/build-vercel-output.sh`` turns the same file into 308 redirects that
fire before these stubs are reached.
"""

from __future__ import annotations

import html
import json
import logging
import os
import posixpath
from urllib.parse import quote

from mkdocs.plugins import event_priority

LOCALES = ["", "zh/", "ja/", "ko/", "pt/", "es/", "fr/", "it/"]

log = logging.getLogger("mkdocs.hooks.redirects")

STUB = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="{canonical}">
<meta name="robots" content="noindex">
<meta name="generator" content="hooks/redirects.py">
<meta http-equiv="refresh" content="0; url={target}">
<script>location.replace({target_js} + location.search + location.hash);</script>
</head>
<body>
<p>This page moved to <a href="{target}">{canonical}</a>.</p>
</body>
</html>
"""


def _load(config) -> dict[str, str]:
    path = os.path.join(os.path.dirname(os.path.abspath(config["config_file_path"])), "redirects.json")
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        return {}


def _is_built_page(path: str) -> bool:
    try:
        with open(path, encoding="utf-8") as fh:
            return 'content="hooks/redirects.py"' not in fh.read(1024)
    except FileNotFoundError:
        return False


# mkdocs-static-i18n builds the other locales from its own on_post_build
# (priority -100), and this hook runs again inside each of those builds. Running
# after it means the outermost call sees every locale; inner calls skip
# locales that are not built yet.
@event_priority(-200)
def on_post_build(config, **kwargs) -> None:
    site_dir = config["site_dir"]
    site_url = (config.get("site_url") or "/").rstrip("/") + "/"
    for old, new in _load(config).items():
        for prefix in LOCALES:
            old_dir = prefix + old
            new_dir = prefix + new
            if not os.path.isfile(os.path.join(site_dir, new_dir, "index.html")):
                if not prefix:
                    log.warning("redirect target %r for %r is not a built page", new_dir, old_dir)
                continue
            out_dir = os.path.join(site_dir, old_dir)
            if _is_built_page(os.path.join(out_dir, "index.html")):
                log.warning("redirect source %r is still a built page; skipping", old_dir)
                continue
            target = quote(posixpath.relpath(new_dir, old_dir.rstrip("/")) + "/", safe="/._-~")
            canonical = site_url + quote(new_dir, safe="/._-~")
            os.makedirs(out_dir, exist_ok=True)
            with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as fh:
                fh.write(
                    STUB.format(
                        target=html.escape(target),
                        target_js=json.dumps(target),
                        canonical=html.escape(canonical),
                    )
                )
            with open(os.path.join(out_dir, "index.md"), "w", encoding="utf-8") as fh:
                fh.write(f"This page moved to {canonical}index.md\n")
