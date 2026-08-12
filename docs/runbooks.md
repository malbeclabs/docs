---
description: Machine-readable index of onboarding runbooks for the DoubleZero MCP. Not linked in the docs nav.
search:
  exclude: true
---

# Runbooks

The DoubleZero MCP loads this file from GitHub raw
(`https://raw.githubusercontent.com/malbeclabs/docs/main/docs/runbooks.md`)
to discover walkthroughs. Humans use [Connect your AI](mcp.md); do not add this
page to the site nav.

To register a runbook, add a list item under **Index** in this shape:

```markdown
- `service-id` — [Human title](page-slug.md)
```

## Index

- `solana-ibrl` — [Connect validator (IBRL Mainnet)](solana-ibrl-runbook.md)
- `solana-shreds-publisher` — [Publish shreds (Edge)](solana-shreds-publisher-runbook.md)
- `solana-shreds` — [Subscribe to shreds (Edge)](solana-shreds-runbook.md)
