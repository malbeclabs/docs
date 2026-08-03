---
description: Eight-step runbook to connect a Solana Testnet validator to DoubleZero in IBRL mode.
---

# Connect validator (IBRL Testnet)

**Goal:** `doublezero status` shows tunnel **up**, User Type **IBRL**, Network **testnet**.

**Prereq:** [Install client](../setup/runbook.md) with **Testnet** packages (see [Setup](../setup.md))  
**Full guide:** [Validator IBRL Testnet](../DZ%20Testnet%20Connection.md)

Same shape as Mainnet; use testnet env and `-u testnet` / testnet package repo.

---

## 1 — Env = testnet

Configure `doublezerod` and CLI for `testnet` (override.conf + `doublezero config set --env testnet`). Exact block: [Testnet guide](../DZ%20Testnet%20Connection.md).

---

## 2 — Firewall

GRE + BGP as in the Testnet guide.

---

## 3 — Identity

```bash
doublezero address
```

Back up `~/.config/doublezero/id.json`.

---

## 4–6 — Attest + request access

Find validator identity → sign message →:

```bash
doublezero-solana passport request-validator-access ... -u testnet ...
```

Details: [Testnet guide](../DZ%20Testnet%20Connection.md).

---

## 7 — Connect

```bash
doublezero connect ibrl
doublezero status
```

---

## 8 — Confirm

Tunnel **up** on **testnet**.

---

## Next

Mainnet production path: [solana-ibrl-mainnet](../DZ%20Mainnet-beta%20Connection/runbook.md)
