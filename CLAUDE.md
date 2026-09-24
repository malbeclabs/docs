# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

This is the documentation site for **DoubleZero**, a decentralized high-performance networking protocol built by Malbec Labs. The site is built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and deployed to GitHub Pages at `https://docs.malbeclabs.com/`.

## Commands

Install dependencies:
```bash
pip install mkdocs-material
```

Preview locally with live reload:
```bash
mkdocs serve
```

Build static site to `./site/`:
```bash
mkdocs build
```

## Deployment

Merging to `main` triggers the GitHub Actions workflow (`.github/workflows/`) which builds and deploys the site to GitHub Pages automatically. There is no manual deploy step.

## Site Structure

Navigation is defined in `mkdocs.yml`. The docs directory is flat — all content pages live directly under `docs/`. The two primary audiences are:

- **Users** — validators, RPC nodes, and MEV infrastructure that connect to DoubleZero to use the network. Docs cover setup, connection modes (IBRL and multicast), paying fees, and troubleshooting.
- **Contributors** — entities with underutilized fiber optic links and hardware who extend the network. Docs cover hardware requirements, device provisioning, and operations.

## Key Concepts

- **DoubleZero Device (DZD)**: Physical switching hardware running the DoubleZero Agent software at each end of a contributor's fiber link.
- **DoubleZero Exchange (DZX)**: Interconnect points (like internet exchanges) where contributor links peer together in major metros.
- **Multicast groups**: Logical groups with publisher/subscriber allowlists for efficient multi-recipient data distribution. Only the DoubleZero Foundation can create groups; owners manage the allowlists.
- **Connection modes**: IBRL (individual routing) and multicast — both require users to first run `doublezero keygen` and complete setup as described in `docs/setup.md`.

## MkDocs Extensions in Use

The site uses several pymdownx extensions — notably `pymdownx.superfences` with Mermaid diagram support, `admonition` for warning/note callouts, and `pymdownx.arithmatex` for MathJax. When adding content, use the existing patterns for these (e.g., `??? warning` for collapsible warnings, ` ```mermaid ` fences for diagrams).
