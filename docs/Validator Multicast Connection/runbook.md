---
description: Runbook for Solana validators to publish leader shreds to the DoubleZero Edge multicast group edge-solana-shreds.
---

# Publish shreds (Edge)

**Goal:** Validator publishes leader shreds to `edge-solana-shreds` (`233.84.178.1:7733`); visible on the [publisher-check](https://data.doublezero.xyz/dz/publisher-check) dashboard after at least one leader slot.

**Prereq:** IBRL already up — [solana-ibrl-mainnet](../DZ%20Mainnet-beta%20Connection/runbook.md)  
**Full guide:** [Publish shreds (Edge)](../Validator%20Multicast%20Connection.md)

**Client versions:** Jito-Agave **3.1.9+**, JitoBam 3.1.9+, Frankendancer, or Harmonic **3.1.11+**. STOP if older.

---

## 1 — Confirm IBRL

```bash
doublezero status
```

Expect IBRL **up**. If not, finish the IBRL runbook first.

---

## 2 — Configure validator client

**Jito-Agave / Harmonic** — start script:

```bash
--shred-receiver-address 233.84.178.1:7733
```

You may send to Jito and Edge at the same time.

**Frankendancer** — `config.toml`:

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

---

## 3 — Disable unwanted retransmit (if applicable)

Remove `--shred-retransmit-receiver-address` from Jito-Agave if you must not retransmit on Edge. Check the publisher dashboard **No Retransmit Shreds** column.

---

## 4 — Restart validator

Apply config and restart so the shred destination is live.

---

## 5 — Subscribe as publisher

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

---

## 6 — Confirm groups

```bash
doublezero status
doublezero multicast group list
```

Group: `edge-solana-shreds` → `233.84.178.1` port `7733`.

---

## 7 — Confirm publishing

After you have been leader for ≥1 slot, check [publisher-check](https://data.doublezero.xyz/dz/publisher-check).

---

## 8 — Done

Optional: [Validator Rewards](../Validator%20Rewards/runbook.md) after you are publishing. Issues → [troubleshoot-edge](../troubleshooting/runbook.md).

### Related groups (receive / ops)

| Group | Address |
|-------|---------|
| Leader | `233.84.178.1:7733` |
| Retrans EU | `233.84.178.12:7733` |
| Retrans APAC | `233.84.178.13:7733` |
| Retrans AMER | `233.84.178.14:7733` |
