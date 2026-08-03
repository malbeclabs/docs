---
description: Runbook to configure ValidatorPublisherRewards so Edge shred publishers get paid each epoch.
---

# Validator Rewards

**Goal:** Register where Edge publisher rewards go (`ValidatorPublisherRewards` on Solana) so payouts can land each epoch.

**Prereq:** Publishing leader shreds — [Publish shreds (Edge)](../Validator%20Multicast%20Connection/runbook.md)  
**Full guide:** [Validator Rewards](../Validator%20Rewards.md)

**Also need:**

- `doublezero-solana` **≥ 0.5.6** (`sudo apt update && sudo apt install doublezero-solana`)
- Validator identity keypair (or offline signing via the full guide)
- Destination wallet pubkey that will own the rewards ATA (default mint: **2z**)

---

## 1 — Configure (direct path)

Run with the **validator identity** as `-k` (pubkey must equal `--node-id`):

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity...> \
    --rewards-token-owner <RewardsWallet...> \
    -k <path-to-validator-identity-keypair.json>
```

Optional: `--rewards-token-mint` (`2z` default; also `usdc`, `wsol`).

Expect output including `Configured validator publisher rewards: <pubkey>` (viewable on an explorer). The ATA is created in the same tx if missing.

**STOP:** If `-k` pubkey ≠ `--node-id`, use the identity keypair or the [offchain path in the full guide](../Validator%20Rewards.md#apendix-offchain-path-alternative).

---

## 2 — Verify

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

Confirm Node ID, Rewards owner, Rewards mint, Resolved ATA, and ATA status.

---

## Done

Rewards pay automatically each epoch after configure. To change owner/mint later, re-run `configure`.

Offline signing (identity not on the box): full guide appendix — prepare → `solana sign-offchain-message` → configure with `--signature` + `--deadline-slot`.
