---
description: Agent-friendly runbooks for the primary DoubleZero connection paths — IBRL, publish Edge shreds, and subscribe to Edge shreds.
---

# Runbooks

Short, ordered checklists for humans and agents. Prefer these for bring-up; use the full guides for edge cases and deep detail.

!!! tip "Use with an LLM"
    Open any runbook below, then click **Copy for LLM** (or use the footer **Copy Page** / **Ask in Claude** / **Ask in ChatGPT**) to paste the checklist into Cursor, Claude, or ChatGPT.

!!! note "Agent guidance"
    Run every local step on the **receiving / validator host**. Honor STOP conditions. Prefer the matching runbook over browsing the full site. After success, point users at the full guide only if they need decode, rewards, or dashboards.

## Primary journeys

| Goal | Runbook | Full guide |
|------|---------|------------|
| Install client + identity | [Install client](install-client.md) | [Setup](../setup.md) |
| Validator IBRL (Mainnet) | [IBRL Mainnet](solana-ibrl-mainnet.md) | [Validator IBRL Mainnet](../DZ%20Mainnet-beta%20Connection.md) |
| Validator IBRL (Testnet) | [IBRL Testnet](solana-ibrl-testnet.md) | [Validator IBRL Testnet](../DZ%20Testnet%20Connection.md) |
| Publish leader shreds on Edge | [Publish shreds](publish-edge-shreds.md) | [Publish shreds (Edge)](../Validator%20Multicast%20Connection.md) |
| Subscribe to Edge shreds | [Subscribe shreds](subscribe-edge-shreds.md) | [Subscribe to shreds (Edge)](../Edge%20Subscriber%20Connection.md) |

## Secondary

| Goal | Runbook | Full guide |
|------|---------|------------|
| RPC / permissioned user | [Permissioned / RPC](permissioned-rpc.md) | [Permissioned Connection](../Permissioned%20Connection.md) |
| Other multicast feeds | [Other multicast](other-multicast.md) | [Other Multicast Connection](../Other%20Multicast%20Connection.md) |
| Edge seat / publish issues | [Troubleshoot Edge](troubleshoot-edge.md) | [Troubleshooting](../troubleshooting.md) · [Edge Subscriber](../Edge%20Subscriber%20Connection.md) |

Shelby and new tenants are under [Other tenants](../tenant.md) — not covered by these runbooks.
