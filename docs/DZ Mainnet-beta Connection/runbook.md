---
description: Eight-step runbook to connect a Solana Mainnet-Beta validator to DoubleZero in IBRL mode.
---

# Connect validator (IBRL Mainnet)

**Goal:** `doublezero status` shows tunnel **up**, User Type **IBRL**, Network **mainnet-beta**.

**Prereq:** [Install client](../setup/runbook.md)  
**Full guide:** [Validator IBRL Mainnet](../DZ%20Mainnet-beta%20Connection.md)

Also need: Solana CLI on `$PATH`, access to validator identity keypair, ≥1 SOL on identity, GRE + BGP allowed.

---

## 1 — Env = mainnet-beta

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
  && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
  && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
  && sudo systemctl daemon-reload \
  && sudo systemctl restart doublezerod \
  && doublezero config set --env $DESIRED_DOUBLEZERO_ENV > /dev/null \
  && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

---

## 2 — Firewall (GRE / BGP / DZ)

See full commands in the [guide](../DZ%20Mainnet-beta%20Connection.md) (iptables or UFW). Allow GRE (proto 47), BGP on `169.254.0.0/16` tcp/179, and DZ control as documented.

---

## 3 — DoubleZero address

```bash
doublezero address
```

Pubkey must match `~/.config/doublezero/id.json`. Back up that file.

---

## 4 — Find validator identity (node ID)

Confirm the identity pubkey that appears in gossip for this host (primary; backups optional, up to 3).

---

## 5 — Prepare + sign access message

Follow the guide sections for preparing the connection message and signing with the **validator identity** key (not only the DoubleZero key).

---

## 6 — Request validator access

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

Wait for Sentinel / access pass provisioning.

---

## 7 — Connect IBRL

```bash
doublezero connect ibrl
doublezero status
```

Expect: Tunnel **up**, User Type **IBRL**, Network **mainnet-beta**. Wait ~1 minute if status is still down while GRE comes up.

---

## 8 — Confirm

```bash
ip route
doublezero status
```

**Pass:** status `up`, tunnel name typically `doublezero0`.

---

## Next

- Publish Edge shreds → [publish-edge-shreds](../Validator%20Multicast%20Connection/runbook.md)
- Issues → [troubleshooting](../troubleshooting.md)
