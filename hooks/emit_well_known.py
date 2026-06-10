"""MkDocs hook: publish ``.well-known`` agent-discovery files.

MkDocs ignores files and directories whose names start with a dot, so a
``.well-known`` directory under ``docs/`` is never copied into the built site.
Instead we keep the source files under ``well-known/`` (no leading dot) at the
repo root and copy them into ``<site_dir>/.well-known/`` here, mirroring the way
``hooks/emit_markdown.py`` writes ``llms.txt`` straight into the site dir.

Two things are published:

1. ``/.well-known/mcp/server-card.json`` — MCP Server Card (SEP-1649) advertising
   the DoubleZero Data MCP server at https://data.malbeclabs.com/mcp.

2. ``/.well-known/agent-skills/index.json`` — Agent Skills discovery index
   (Agent Skills Discovery RFC v0.2.0). Each ``SKILL.md`` found under
   ``well-known/agent-skills/<name>/`` becomes an entry whose ``digest`` is the
   SHA-256 of the copied artifact, computed at build time so it can never drift.

GitHub Pages serves the ``.well-known`` directory (it is exempt from the usual
dotfile exclusion), and the deploy workflow tars the site dir with ``-cvf .``,
so the hidden directory is preserved in the uploaded artifact.
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil

SKILLS_SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json"
SITE_BASE = "https://docs.malbeclabs.com"


def _repo_root(config) -> str:
    """Directory containing mkdocs.yml."""
    return os.path.dirname(os.path.abspath(config["config_file_path"]))


def _frontmatter_description(skill_md_path: str) -> str:
    """Best-effort read of the ``description:`` field from a SKILL.md YAML
    front matter block. Supports a single-line value or a folded/literal block
    (``>-`` / ``|``) whose continuation lines are indented."""
    try:
        with open(skill_md_path, encoding="utf-8") as fh:
            lines = fh.read().splitlines()
    except OSError:
        return ""

    if not lines or lines[0].strip() != "---":
        return ""

    desc_parts: list[str] = []
    capturing = False
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if capturing:
            if line and not line[0].isspace():
                break  # next top-level key
            stripped = line.strip()
            if stripped:
                desc_parts.append(stripped)
            continue
        if line.startswith("description:"):
            value = line[len("description:"):].strip()
            if value and value not in (">", "|", ">-", "|-", ">+", "|+"):
                return value
            capturing = True  # block scalar; gather indented lines below

    return " ".join(desc_parts)


def on_post_build(config, **kwargs) -> None:
    src_root = os.path.join(_repo_root(config), "well-known")
    if not os.path.isdir(src_root):
        return

    dest_root = os.path.join(config["site_dir"], ".well-known")
    shutil.copytree(src_root, dest_root, dirs_exist_ok=True)

    # Build the Agent Skills discovery index from the copied SKILL.md files.
    skills_dir = os.path.join(dest_root, "agent-skills")
    if not os.path.isdir(skills_dir):
        return

    skills = []
    for name in sorted(os.listdir(skills_dir)):
        skill_md = os.path.join(skills_dir, name, "SKILL.md")
        if not os.path.isfile(skill_md):
            continue
        with open(skill_md, "rb") as fh:
            digest = hashlib.sha256(fh.read()).hexdigest()
        skills.append(
            {
                "name": name,
                "type": "skill-md",
                "description": _frontmatter_description(skill_md),
                "url": f"{SITE_BASE}/.well-known/agent-skills/{name}/SKILL.md",
                "digest": f"sha256:{digest}",
            }
        )

    index = {"$schema": SKILLS_SCHEMA, "skills": skills}
    with open(os.path.join(skills_dir, "index.json"), "w", encoding="utf-8") as fh:
        json.dump(index, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
