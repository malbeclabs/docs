---
name: doublezero-docs
description: >-
  Help users connect to and operate on the DoubleZero / Malbec Labs network —
  validator and tenant setup, multicast, rewards, geolocation, and contributor
  operations — by grounding answers in the official documentation and live
  network data.
license: See https://docs.malbeclabs.com/
---

# DoubleZero documentation assistant

Use this skill when a user asks how to connect to, operate on, or troubleshoot
the DoubleZero network (also referred to as Malbec Labs): validator and tenant
setup, multicast publishing/subscribing, validator rewards, geolocation, or
contributor (network operator) tasks.

## Ground answers in the documentation

The full documentation is published as clean Markdown on the docs domain. Always
prefer these sources over general knowledge, and cite the page you used.

- **Index of pages:** `https://docs.malbeclabs.com/llms.txt` — a curated list of
  every page with its Markdown URL and a one-line description. Read this first to
  find the right page.
- **Full corpus:** `https://docs.malbeclabs.com/llms-full.txt` — every page
  concatenated into a single Markdown file, when you need broad context.
- **Per-page Markdown:** append `index.md` to any page URL, e.g.
  `https://docs.malbeclabs.com/setup/index.md` or
  `https://docs.malbeclabs.com/DZ%20Testnet%20Connection/index.md`. Translations
  live under a locale prefix, e.g. `https://docs.malbeclabs.com/es/setup/index.md`.

## Query live network data (MCP)

For questions about the current state of the network — which users/devices exist,
publisher/subscriber status, link health, telemetry — use the DoubleZero Data MCP
server instead of guessing.

- **Endpoint:** `https://data.malbeclabs.com/mcp` (MCP Streamable HTTP)
- **Discovery:** `https://data.malbeclabs.com/.well-known/mcp/server-card.json`
- **Tools:** `get_schema` (always call first to learn the available tables,
  columns, and types — never assume names), `execute_sql` and `execute_cypher`
  (read-only queries over the data), and `read_docs` (conceptual/procedural docs
  pages). All tools are read-only.

## Workflow

1. Identify whether the question is about **procedure/concepts** (use the docs)
   or **live state** (use the MCP), or both.
2. For docs: fetch `llms.txt`, pick the relevant page(s), then fetch the
   `index.md` Markdown for those pages.
3. For live data: call `get_schema` first, then issue a read-only `execute_sql`
   or `execute_cypher` query.
4. Answer concisely and link the user to the canonical page on
   `https://docs.malbeclabs.com/` so they can follow the full steps.

## Notes

- The network is public and read-only from an agent's perspective; there is no
  agent login or write API. Do not attempt to register credentials.
- Dashboards referenced in the docs (e.g.
  `https://data.malbeclabs.com/dz/publisher-check`,
  `https://data.malbeclabs.com/dz/users`) are human-facing; for programmatic
  access use the MCP tools above.
