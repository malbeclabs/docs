---
description: Solana — short runbooks and full guides for IBRL, Edge shreds publish/subscribe, and related paths.
---

# Solana

Short, ordered checklists for humans and agents. Prefer the **runbook** for bring-up; use the **full guide** for edge cases and deep detail.

!!! tip "Use with an LLM"
    Open any runbook below, then click **Copy for LLM** (or use the footer **Copy Page** / **Ask in Claude** / **Ask in ChatGPT**) to paste the checklist into Cursor, Claude, or ChatGPT.

!!! note "Agent guidance"
    Run every local step on the **receiving / validator host**. Honor STOP conditions. Prefer the matching runbook over browsing the full site. After success, point users at the full guide only if they need decode, rewards, or dashboards.

## Primary journeys

Install the DoubleZero client first (any chain): [Setup](../setup.md) — use the **Runbook** toggle there for the short checklist.

| Goal | Runbook | Full guide |
|------|---------|------------|
| Validator IBRL (Mainnet) | [IBRL Mainnet](../DZ%20Mainnet-beta%20Connection/runbook.md) | [Validator IBRL Mainnet](../DZ%20Mainnet-beta%20Connection.md) |
| Validator IBRL (Testnet) | [IBRL Testnet](../DZ%20Testnet%20Connection/runbook.md) | [Validator IBRL Testnet](../DZ%20Testnet%20Connection.md) |
| Publish leader shreds on Edge | [Publish shreds](../Validator%20Multicast%20Connection/runbook.md) | [Publish shreds (Edge)](../Validator%20Multicast%20Connection.md) |
| Subscribe to Edge shreds | [Subscribe shreds](../Edge%20Subscriber%20Connection/runbook.md) | [Subscribe to shreds (Edge)](../Edge%20Subscriber%20Connection.md) |

## Secondary

| Goal | Runbook | Full guide |
|------|---------|------------|
| RPC / permissioned user | [Permissioned / RPC](../Permissioned%20Connection/runbook.md) | [Permissioned Connection](../Permissioned%20Connection.md) |
| Other multicast feeds | [Other multicast](../Other%20Multicast%20Connection/runbook.md) | [Other Multicast Connection](../Other%20Multicast%20Connection.md) |
| Edge seat / publish issues | [Troubleshoot Edge](../troubleshooting/runbook.md) | [Troubleshooting](../troubleshooting.md) · [Edge Subscriber](../Edge%20Subscriber%20Connection.md) |
| Validator rewards | [Validator Rewards](../Validator%20Rewards/runbook.md) | [Validator Rewards](../Validator%20Rewards.md) |

Shelby and new tenants are under [Other tenants](../tenant.md) — not covered here.
