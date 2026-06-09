"""MkDocs hook: AI-agent friendly outputs.

Two things, both driven off the default (English) locale:

1. Emit raw Markdown next to every built HTML page as ``index.md`` so the source
   Markdown is served from the docs domain itself (e.g. ``/setup/index.md``,
   ``/es/setup/index.md``). This powers the page toolbar's "View Markdown" /
   "Copy Page" buttons and lets AI agents fetch clean Markdown for every
   language without depending on GitHub.

2. Generate ``llms.txt`` (curated index, see https://llmstxt.org) and
   ``llms-full.txt`` (full concatenated content) at the site root.

We build the llms files here instead of using the mkdocs-llmstxt plugin because
that plugin cannot resolve localized page URIs under mkdocs-static-i18n.
"""

from __future__ import annotations

import os

# Locale subdirectories produced by mkdocs-static-i18n. A page whose built path
# starts with one of these belongs to a translation, not the default locale.
LOCALES = {"zh", "ja", "ko", "pt", "es", "fr", "it"}

# Curated llms.txt layout: (section title, [source files in order]).
SECTIONS = [
    ("Welcome", ["index.md"]),
    ("Quick start", ["quick-connect.md"]),
    (
        "Users",
        [
            "setup.md",
            "tenant.md",
            "DZ Mainnet-beta Connection.md",
            "DZ Testnet Connection.md",
            "Permissioned Connection.md",
            "Validator Multicast Connection.md",
            "Validator Rewards.md",
            "Other Multicast Connection.md",
            "Edge Subscriber Connection.md",
            "troubleshooting.md",
            "geolocation.md",
            "Shelby Permissioned Connection.md",
            "New Tenant.md",
        ],
    ),
    (
        "Contributors",
        [
            "contribute-overview.md",
            "contribute.md",
            "contribute-provisioning.md",
            "contribute-operations.md",
            "contribute-ops-management.md",
            "contribute-geolocation.md",
        ],
    ),
    ("Reference", ["architecture.md", "glossary.md"]),
]

# Collected default-locale pages, keyed by source filename (e.g. "setup.md").
_pages: dict[str, dict] = {}


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

    for title, files in SECTIONS:
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
