"""Keep MCP runbook markdown in git (GitHub raw) but out of the MkDocs site.

mkdocs-static-i18n copies unsuffixed English pages into each locale as
``runbooks.zh.md`` (etc.). Those copies do not match ``exclude_docs: runbooks.md``,
so they would still be built and fail link-check. Drop every locale variant here.
"""

from __future__ import annotations


def _is_mcp_runbook(src_uri: str) -> bool:
    name = src_uri.replace("\\", "/").rsplit("/", 1)[-1]
    if not name.endswith(".md"):
        return False
    stem = name[:-3]
    if stem == "runbooks" or stem.startswith("runbooks."):
        return True
    return "-runbook" in stem


def on_files(files, config):
    for file in list(files):
        if _is_mcp_runbook(file.src_uri):
            files.remove(file)
    return files
