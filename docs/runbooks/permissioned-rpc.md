---
description: Short runbook for permissioned Solana RPC / MEV users connecting to DoubleZero.
---

# Runbook — Permissioned / RPC

**Goal:** Permissioned user connected in IBRL (or as instructed after onboarding).

**Prereq:** [Install client](install-client.md)  
**Full guide:** [Permissioned Connection](../Permissioned%20Connection.md)

---

## Steps

1. Complete [install-client](install-client.md); back up `~/.config/doublezero/id.json`.
2. Follow **Permissioned User Onboarding** in the full guide (form / access approval).
3. Configure env (mainnet-beta or testnet) as directed.
4. Connect: `doublezero connect ibrl` (see guide section).
5. Verify: `doublezero status` → tunnel up.

Shelby Testnet RPCs/storage: [Shelby Connection](../Shelby%20Permissioned%20Connection.md) (not this runbook).
