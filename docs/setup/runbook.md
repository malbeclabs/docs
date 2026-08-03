---
description: Install the DoubleZero client, verify doublezerod, create and back up the DoubleZero identity keypair.
---

# Install client

**Goal:** `doublezerod` running and a DoubleZero identity ready for connection.

**Full guide:** [Setup](../setup.md)

---

## 1 — Prereqs

| Check | Requirement | STOP if |
|-------|-------------|---------|
| Arch | `x86_64` | other |
| OS | Ubuntu 22.04+ / Debian 11+ / Rocky or RHEL 9+ | unsupported |
| Privileges | root or sudo | no |
| Install location | **on the host**, not in a container (validators) | container-only |
| Public IP | public IPv4 (no NAT) for validators / Edge | NAT without 1:1 |

```bash
uname -m
. /etc/os-release; echo "$ID $VERSION_ID"
```

---

## 2 — Install packages

**Ubuntu / Debian (Mainnet-Beta):**

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

**Rocky / RHEL (Mainnet-Beta):**

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

For Testnet package repos, see [Setup](../setup.md).

---

## 3 — Verify daemon

```bash
sudo systemctl status doublezerod
sudo journalctl -u doublezerod -n 50 --no-pager
```

Expect **active (running)**.

---

## 4 — Identity (save the key)

```bash
doublezero keygen          # skip if ~/.config/doublezero/id.json already exists
doublezero address
```

- Keypair path: **`~/.config/doublezero/id.json`** — **back it up**. Access and allow lists are tied to this key.
- Do **not** run `keygen -f` unless you intend to rotate and re-request access.
- Record pubkey: `________________`

---

## 5 — Discover devices

```bash
doublezero latency
```

If empty, wait 10–20s and retry.

---

## 6 — Disconnect before tenant connect

```bash
doublezero status
# if up:
doublezero disconnect
```

Avoid multiple tunnels / wrong env before the next runbook.

---

## Next

| Goal | Next runbook |
|------|----------------|
| Validator IBRL Mainnet | [solana-ibrl-mainnet](../DZ%20Mainnet-beta%20Connection/runbook.md) |
| Validator IBRL Testnet | [solana-ibrl-testnet](../DZ%20Testnet%20Connection/runbook.md) |
| Subscribe Edge shreds | [subscribe-edge-shreds](../Edge%20Subscriber%20Connection/runbook.md) |
| Permissioned RPC | [permissioned-rpc](../Permissioned%20Connection/runbook.md) |
