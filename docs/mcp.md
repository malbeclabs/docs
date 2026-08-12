---
description: Use DoubleZero Data with your own AI assistant via the Model Context Protocol (MCP) — endpoint, tools, and how to connect.
---

# Connect your own AI

!!! info
    To receive Edge data on your host, purchase a feed first at [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). The MCP can then walk you through connecting.

Use DoubleZero Data with your own AI assistant via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). The same server is documented in the data app at [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp).

## What’s an MCP?

MCP is an open standard that lets an AI agent call tools on an external service. Without it, the model only knows what you paste into the chat. With it, the agent can read DoubleZero docs, load an onboarding runbook, and query public network data on your behalf.

DoubleZero runs **one** MCP. Point any compatible client at the endpoint below.

## Endpoint

```
https://data.doublezero.xyz/api/mcp
```

No login is required. The server uses [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http) transport.

## Available tools

| Tool | Description |
|------|-------------|
| `execute_sql` | Query ClickHouse for metrics, validators, and network data |
| `execute_cypher` | Query Neo4j for topology, paths, and connectivity (mainnet only) |
| `get_schema` | Get database schema (tables, columns, types) |
| `read_docs` | Read DoubleZero documentation |
| `get_onboarding_runbook` | Guided onboarding walkthrough. Omit service to list what’s available. |
| `check_edge_access` | Check whether an identity pubkey has an access pass for a receiving IP (exact match or `0.0.0.0`). The agent calls this during onboarding. |

You do not call these yourself. After the client is connected, ask in plain language, for example:

- “Walk me through connecting a market-data feed on this Linux host.”
- “What is DoubleZero?” / “How does Edge Connect work?”
- “How many Solana validators are on DoubleZero?”
- “What’s the path from NYC to Amsterdam?”
- “My tunnel shows Network Unreachable — check the runbook.”

For a guided setup, the agent should call `get_onboarding_runbook` (not just `read_docs`). For SQL or Cypher, it should call `get_schema` first.

Every tool is read-only: it cannot place trades, move funds, or see your keypair / `DZ_SECRET`.

## Connect your AI agent {#connect-your-ai-agent}

Use `https://data.doublezero.xyz/api/mcp` on every platform.

### Claude Desktop & Codex Desktop

1. Go to **Settings**
2. Click **Manage Connectors**
3. Click **Add Custom Connector**
4. Enter the endpoint URL above

### Code editors & IDEs

Works with Claude Code, Cursor, Windsurf, Continue, and other MCP-compatible tools. Add a `.mcp.json` file to your project root:

```json
{
  "mcpServers": {
    "doublezero": {
      "type": "http",
      "url": "https://data.doublezero.xyz/api/mcp"
    }
  }
}
```

=== "Claude Code"

    ```bash
    claude mcp add doublezero --transport http https://data.doublezero.xyz/api/mcp
    ```

    Then type `/mcp`, select **doublezero**, and confirm it is connected.

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**.
    2. Connect using the endpoint URL, or use the `.mcp.json` above.

=== "ChatGPT"

    1. Turn on **Developer Mode**.
    2. **Settings** → **Apps** → **Create app** (or add a connector).
    3. Paste `https://data.doublezero.xyz/api/mcp`.

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    Then `/mcp` and select **doublezero**.

=== "Other"

    Any MCP-compatible client can use the endpoint URL (Streamable HTTP). Name the server `doublezero`.

## Rate limits

Tool calls are rate limited to 100 requests per minute per IP. If you hit the limit, calls return an error — wait a moment and retry.

## Troubleshooting

- Confirm the client shows **doublezero** as connected. Disconnect and add the URL again if it does not.
- The URL must be exactly `https://data.doublezero.xyz/api/mcp` (include `/api/mcp`).
- The MCP cannot SSH to your machine. You still run (or approve) local commands.
- For feed / Edge Connect setup, connect the MCP and ask for an onboarding walkthrough. For other issues, see [Support](support.md).
