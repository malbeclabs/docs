---
name: doublezero-docs
description: >-
  Help users connect to and operate on the DoubleZero / Malbec Labs network —
  validator and tenant setup, multicast, rewards, geolocation, and contributor
  operations — by grounding answers in the official documentation.
license: See https://docs.doublezero.xyz/
---

# DoubleZero documentation assistant

Use this skill when a user asks how to connect to, operate on, or troubleshoot
the DoubleZero network (also referred to as Malbec Labs): validator and tenant
setup, multicast publishing/subscribing, validator rewards, geolocation, or
contributor (network operator) tasks.

## Ground answers in the documentation

The full documentation is published as clean Markdown on the docs domain. Always
prefer these sources over general knowledge, and cite the page you used.

- **Index of pages:** `https://docs.doublezero.xyz/llms.txt` — a curated list of
  every page with its Markdown URL and a one-line description. Read this first to
  find the right page.
- **Full corpus:** `https://docs.doublezero.xyz/llms-full.txt` — every page
  concatenated into a single Markdown file, when you need broad context.
- **Per-page Markdown:** append `index.md` to any page URL, e.g.
  `https://docs.doublezero.xyz/setup/index.md` or
  `https://docs.doublezero.xyz/DZ%20Testnet%20Connection/index.md`. Translations
  live under a locale prefix, e.g. `https://docs.doublezero.xyz/es/setup/index.md`.

## Workflow

1. Fetch `llms.txt`, pick the relevant page(s), then fetch the `index.md`
   Markdown for those pages.
2. Answer concisely and link the user to the canonical page on
   `https://docs.doublezero.xyz/` so they can follow the full steps.

## Notes

- The network is public and read-only from an agent's perspective; there is no
  agent login or write API. Do not attempt to register credentials.
- Dashboards referenced in the docs (e.g.
  `https://data.doublezero.xyz/dz/publisher-check`,
  `https://data.doublezero.xyz/dz/users`) are human-facing.
