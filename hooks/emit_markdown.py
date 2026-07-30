"""MkDocs hook: AI-agent friendly outputs.

Two things, both driven off the default (English) locale:

1. Emit raw Markdown next to every built HTML page as ``index.md`` so the source
   Markdown is served from the docs domain itself (e.g. ``/setup/index.md``,
   ``/es/setup/index.md``). Intra-doc links are rewritten to absolute
   ``…/index.md`` URLs so agents do not 404 on source-relative paths
   (see https://github.com/malbeclabs/docs/issues/177).

2. Generate ``llms.txt`` (curated index, see https://llmstxt.org) and
   ``llms-full.txt`` (full concatenated content) at the site root. Section
   order is derived from ``nav`` in ``mkdocs.yml`` so the two cannot drift
   (see https://github.com/malbeclabs/docs/issues/178).

We build the llms files here instead of using the mkdocs-llmstxt plugin because
that plugin cannot resolve localized page URIs under mkdocs-static-i18n.
"""

from __future__ import annotations

import os
import re
from pathlib import PurePosixPath
from urllib.parse import unquote, urljoin, urlsplit

# Locale subdirectories produced by mkdocs-static-i18n. A page whose built path
# starts with one of these belongs to a translation, not the default locale.
LOCALES = {"zh", "ja", "ko", "pt", "es", "fr", "it"}

# Markdown inline links/images: ![alt](href) or [text](href) or [text](href "title")
_LINK_RE = re.compile(r"(!?\[[^\]]*\]\()([^)\s]+)(?:\s+(?:\"[^\"]*\"|'[^']*'))?(\))")

# Collected default-locale pages, keyed by source filename (e.g. "setup.md").
_pages: dict[str, dict] = {}

# src_uri -> File, refreshed each build via on_files.
_files_by_src: dict[str, object] = {}

# (section title, [src_uri, ...]) from default-locale nav.
_nav_sections: list[tuple[str, list[str]]] = []


def _is_default_locale(dest_uri: str) -> bool:
    first = dest_uri.replace(os.sep, "/").split("/", 1)[0]
    return first not in LOCALES


def _locale_from_src(src_uri: str) -> str | None:
    """Return locale code for suffix-structured sources like ``setup.es.md``."""
    name = PurePosixPath(src_uri).name
    if not name.endswith(".md"):
        return None
    stem = name[: -len(".md")]
    if "." not in stem:
        return None
    maybe = stem.rsplit(".", 1)[-1]
    return maybe if maybe in LOCALES else None


def _nav_to_sections(nav) -> list[tuple[str, list[str]]]:
    """Flatten MkDocs nav into llms.txt sections (one level of children)."""
    sections: list[tuple[str, list[str]]] = []
    for item in nav:
        if getattr(item, "is_page", False) and getattr(item, "file", None):
            sections.append((item.title, [item.file.src_uri]))
        elif getattr(item, "is_section", False):
            files: list[str] = []
            for child in item.children or []:
                if getattr(child, "is_page", False) and getattr(child, "file", None):
                    files.append(child.file.src_uri)
                elif getattr(child, "is_section", False):
                    for grandchild in child.children or []:
                        if getattr(grandchild, "is_page", False) and getattr(
                            grandchild, "file", None
                        ):
                            files.append(grandchild.file.src_uri)
            if files:
                sections.append((item.title, files))
    return sections


def _nav_is_default_locale(nav) -> bool:
    for item in nav:
        pages = []
        if getattr(item, "is_page", False):
            pages = [item]
        elif getattr(item, "is_section", False):
            pages = [
                c
                for c in (item.children or [])
                if getattr(c, "is_page", False)
            ]
        for page in pages:
            f = getattr(page, "file", None)
            if f is not None and not _is_default_locale(f.dest_uri):
                return False
    return True


def _resolve_doc_file(page, href_path: str):
    """Resolve a relative markdown href to a MkDocs File, if it is a doc page."""
    path = unquote(href_path).strip()
    if not path or path.startswith(("/", "http://", "https://", "mailto:", "#")):
        return None

    src_dir = PurePosixPath(page.file.src_uri).parent
    resolved = PurePosixPath(os.path.normpath((src_dir / path).as_posix()))
    key = resolved.as_posix()
    if key.startswith("../") or key == "..":
        return None

    locale = _locale_from_src(page.file.src_uri)
    target = None
    if locale and key.endswith(".md"):
        # ``glossary.md`` from ``setup.es.md`` → prefer ``glossary.es.md``
        base = key[: -len(".md")]
        if not base.endswith(f".{locale}"):
            target = _files_by_src.get(f"{base}.{locale}.md")
        else:
            target = _files_by_src.get(key)
    if target is None:
        target = _files_by_src.get(key)

    if target is None:
        return None
    dest = getattr(target, "dest_uri", "") or ""
    if not dest.endswith(".html"):
        return None
    return target


def _absolute_md_url(file_obj, site_url: str, fragment: str) -> str:
    page_url = getattr(file_obj, "url", "") or ""
    abs_url = urljoin(site_url if site_url.endswith("/") else site_url + "/", page_url)
    if not abs_url.endswith("/"):
        abs_url += "/"
    md_url = abs_url + "index.md"
    if fragment:
        md_url += "#" + fragment
    return md_url


def rewrite_markdown_links(markdown: str, page, site_url: str) -> str:
    """Rewrite intra-doc ``.md`` links to absolute ``…/index.md`` site URLs."""

    def repl(match: re.Match[str]) -> str:
        prefix, href, suffix = match.group(1), match.group(2), match.group(3)
        raw = href.strip()
        if raw.startswith(("http://", "https://", "mailto:", "//", "#")):
            return match.group(0)

        parts = urlsplit(raw)
        # urlsplit treats "foo.md#x" as path + fragment; good.
        # Windows-ish schemes are not expected in docs links.
        path = parts.path
        if not path:
            return match.group(0)

        target = _resolve_doc_file(page, path)
        if target is None:
            return match.group(0)

        new_href = _absolute_md_url(target, site_url, parts.fragment)
        # Preserve optional title attribute if present in the original match.
        full = match.group(0)
        title_part = full[len(prefix) + len(href) : -len(suffix)]
        return f"{prefix}{new_href}{title_part}{suffix}"

    return _LINK_RE.sub(repl, markdown)


def on_pre_build(config, **kwargs) -> None:
    _pages.clear()
    _files_by_src.clear()
    _nav_sections.clear()


def on_files(files, config, **kwargs):
    _files_by_src.clear()
    _files_by_src.update({f.src_uri: f for f in files})
    return files


def on_nav(nav, config, **kwargs):
    """Capture default-locale nav for llms.txt section order."""
    global _nav_sections
    if _nav_is_default_locale(nav):
        _nav_sections = _nav_to_sections(nav)
    return nav


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

    site_url = (config.get("site_url") or "/").strip() or "/"
    markdown = rewrite_markdown_links(markdown, page, site_url)

    os.makedirs(os.path.dirname(dest_md), exist_ok=True)
    with open(dest_md, "w", encoding="utf-8") as fh:
        fh.write(markdown)

    if _is_default_locale(page.file.dest_uri):
        _pages[page.file.src_uri] = {
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

    sections = _nav_sections
    if not sections:
        # Fallback: single flat section from whatever pages we collected.
        sections = [("Docs", sorted(_pages.keys()))]

    for title, files in sections:
        index_lines.append(f"## {title}")
        index_lines.append("")
        for src in files:
            page = _pages.get(src)
            if not page:
                continue
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
