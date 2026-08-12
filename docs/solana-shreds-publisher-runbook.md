---
description: LLM-oriented runbook — configure a connected Solana validator to publish leader shreds to DoubleZero Edge. Served to the MCP via GitHub raw; not published on the docs site.
---

# Publish shreds (Edge) — runbook

This page is for the DoubleZero MCP (`get_onboarding_runbook`) via GitHub raw. It is
not published on the docs site.

1. Connect the [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Confirm the validator is **already on DoubleZero IBRL** (mainnet-beta). If not, finish [Connect validator (IBRL Mainnet)](solana-ibrl-runbook.md) first.
3. Walk the steps below. Human guide: [Validator Multicast Connection](Validator Multicast Connection.md).

**What success looks like:** validator sends leader shreds to `233.84.178.1:7733`, multicast publish on `edge-solana-shreds` is up, and [publisher-check](https://data.doublezero.xyz/dz/publisher-check) shows publishing after at least one leader slot.

This path is for **validators**. Trading firms that want to *subscribe* use [Subscribe to shreds](solana-shreds-runbook.md).

---

## Prerequisites

| Need | Notes |
|------|--------|
| IBRL tunnel already up | [IBRL Mainnet runbook](solana-ibrl-runbook.md) / [human guide](DZ Mainnet-beta Connection.md). |
| Supported client | Jito-Agave **3.1.9+**, JitoBam 3.1.9+, Frankendancer, or Harmonic **3.1.11+**. Other versions will not publish. |
| Restart window | Adding the shred destination requires a validator restart. |

---

## Steps

### 1. Point the client at the Edge shred group

**Jito-Agave (v3.1.9+) and Harmonic (3.1.11+)** — in the validator start script add:

```text
--shred-receiver-address 233.84.178.1:7733
```

You can send to Jito and `edge-solana-shreds` at the same time. Restart the validator.

**Frankendancer** — in `config.toml`:

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

Restart the validator.

### 2. Publish on the multicast group

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

**Verify:** `doublezero status` still IBRL/up, and the user is a publisher on `edge-solana-shreds`.

Live group IPs: `doublezero multicast group list`. All shred feeds use UDP **`7733`**; the IP selects the feed.

| Feed | Address |
|------|---------|
| `edge-solana-shreds` (leader) | `233.84.178.1:7733` |
| `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| `edge-solana-retrans-amer` | `233.84.178.14:7733` |

### 3. Confirm publishing

Open [publisher-check](https://data.doublezero.xyz/dz/publisher-check). You will not see confirmation until the validator has published leader shreds for **at least one slot**.

Healthy: outbound spikes aligned with leader slots (sawtooth). Steady outbound with no slot pattern is **retransmit** (bad).

---

## Gotchas

1. **Wrong client version.** Not 3.1.9+ / 3.1.11+ → nothing useful on the wire.
2. **Retransmit flag left on.** Remove `--shred-retransmit-receiver-address` from Jito-Agave. Check the **No Retransmit Shreds** column on publisher-check (2-epoch vs recent-slot views).
3. **Not yet a leader.** Dashboard stays empty until a leader slot.
4. **IBRL not up.** Do not start here; finish IBRL first.

---

## See also

- [Validator Multicast Connection](Validator Multicast Connection.md)
- [Validator Rewards](Validator Rewards.md)
