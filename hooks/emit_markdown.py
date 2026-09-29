"""MkDocs hook: AI-agent friendly outputs.

Two things, both driven off the default (English) locale:

1. Emit raw Markdown next to every built HTML page as ``index.md`` so the source
   Markdown is served from the docs domain itself (e.g. ``/setup/index.md``,
   ``/es/setup/index.md``). This powers the page toolbar's "View Markdown" /
   "Copy Page" buttons and lets AI agents fetch clean Markdown for every
   language without depending on GitHub.

2. Generate ``llms.txt`` (index, see https://llmstxt.org) and ``llms-full.txt``
   (those same pages, concatenated) at the site root.

Both files follow the English ``nav`` in mkdocs.yml. A page added to the nav is
indexed on the next build. Translations stay out of these two files; each
translated page still gets its own ``index.md``. Pages that are built but left
out of the nav (redirects, for example) are not indexed.

We build the llms files here instead of using the mkdocs-llmstxt plugin because
that plugin cannot resolve localized page URIs under mkdocs-static-i18n.
"""

from __future__ import annotations

import logging
import os

# Locale subdirectories produced by mkdocs-static-i18n. A page whose built path
# starts with one of these belongs to a translation, not the default locale.
LOCALES = {"zh", "ja", "ko", "pt", "es", "fr", "it"}

log = logging.getLogger("mkdocs.hooks.emit_markdown")

# Collected default-locale pages, keyed by source path (e.g. "setup.md").
_pages: dict[str, dict] = {}


def _norm(src: str) -> str:
    return src.replace("\\", "/")


def nav_sections(nav) -> list[tuple[str, list[str]]]:
    """Turn the mkdocs nav into ``(section title, source paths)`` in nav order.

    A top-level page becomes a one-page section named with its nav title. A
    group becomes one section, with nested groups flattened in reading order.
    """
    sections: list[tuple[str, list[str]]] = []
    for item in nav or []:
        if isinstance(item, str):
            sections.append((item, [_norm(item)]))
            continue
        if not isinstance(item, dict):
            log.warning("llms nav item is not a page or section: %r", item)
            continue
        for title, value in item.items():
            if isinstance(value, str):
                sections.append((str(title), [_norm(value)]))
            elif isinstance(value, list):
                sections.append((str(title), _collect_nav_pages(value)))
            else:
                log.warning("llms nav section %r has no pages: %r", title, value)
    return sections


def _collect_nav_pages(items) -> list[str]:
    pages: list[str] = []
    for item in items:
        if isinstance(item, str):
            pages.append(_norm(item))
            continue
        if not isinstance(item, dict):
            log.warning("llms nav item is not a page: %r", item)
            continue
        for _title, value in item.items():
            if isinstance(value, str):
                pages.append(_norm(value))
            elif isinstance(value, list):
                pages.extend(_collect_nav_pages(value))
            else:
                log.warning("llms nav entry %r is not a page: %r", _title, value)
    return pages


def _is_default_locale(dest_uri: str) -> bool:
    first = dest_uri.replace(os.sep, "/").split("/", 1)[0]
    return first not in LOCALES


def on_post_page(output: str, page, config, **kwargs) -> str:
    """Write the page's source Markdown beside its generated HTML and, for the
    default locale, record it for the llms.txt files."""
    dest_html = page.file.abs_dest_path  # e.g. <site_dir>/setup/index.html
    if not dest_html.endswith(".html"):
        return output

    dest_md = dest_html[: -len(".html")] + ".md"

    # Prefer the parsed Markdown (front matter already stripped by MkDocs);
    # fall back to reading the raw source file.
    markdown = getattr(page, "markdown", None)
    if markdown is None:
        try:
            with open(page.file.abs_src_path, encoding="utf-8") as fh:
                markdown = fh.read()
        except OSError:
            return output

    os.makedirs(os.path.dirname(dest_md), exist_ok=True)
    with open(dest_md, "w", encoding="utf-8") as fh:
        fh.write(markdown)

    if _is_default_locale(page.file.dest_uri):
        _pages[_norm(page.file.src_uri)] = {
            "title": page.title or page.file.src_uri,
            "url": page.canonical_url,  # absolute, ends with "/"
            "md_url": page.canonical_url + "index.md",
            "description": (page.meta or {}).get("description", "").strip(),
            "markdown": markdown,
        }

    return output


def on_post_build(config, **kwargs) -> None:
    """Write llms.txt and llms-full.txt at the site root."""
    if not _pages:
        return

    site_dir = config["site_dir"]
    site_name = config.get("site_name", "Documentation")
    site_description = (config.get("site_description") or "").strip()

    index_lines = [f"# {site_name}", ""]
    if site_description:
        index_lines += [f"> {site_description}", ""]

    full_lines = [f"# {site_name}", ""]
    if site_description:
        full_lines += [f"> {site_description}", ""]

    for title, files in nav_sections(config.get("nav")):
        resolved = []
        for src in files:
            page = _pages.get(_norm(src))
            if not page:
                log.warning(
                    "llms nav entry %r under %r did not resolve to a built page",
                    src,
                    title,
                )
                continue
            resolved.append(page)
        if not resolved:
            continue

        index_lines.append(f"## {title}")
        index_lines.append("")
        for page in resolved:
            entry = f"- [{page['title']}]({page['md_url']})"
            if page["description"]:
                entry += f": {page['description']}"
            index_lines.append(entry)

            full_lines.append(f"# {page['title']}")
            full_lines.append("")
            full_lines.append(f"Source: {page['url']}")
            full_lines.append("")
            full_lines.append(page["markdown"].strip())
            full_lines.append("")
            full_lines.append("---")
            full_lines.append("")
        index_lines.append("")

    with open(os.path.join(site_dir, "llms.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(index_lines).rstrip() + "\n")

    with open(os.path.join(site_dir, "llms-full.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(full_lines).rstrip() + "\n")
