---
description: LLM-oriented runbook — connect a Solana Mainnet-Beta validator to DoubleZero in IBRL mode. Served to the MCP via GitHub raw; not published on the docs site.
---

# Connect validator (IBRL Mainnet) — runbook

This page is for the DoubleZero MCP (`get_onboarding_runbook`) via GitHub raw. It is
not published on the docs site.

1. Connect the [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Tell it this is a **Solana Mainnet-Beta validator**, the Linux host (or SSH), and where the validator identity keypair lives.
3. Walk the steps below in order. Prefer to do it by hand? Use the [human guide](DZ Mainnet-beta Connection.md).

**What success looks like:** `doublezero status` shows tunnel **up**, User Type **IBRL**, Network **mainnet-beta**. `Tunnel src` and `Doublezero IP` match the host public IPv4.

IBRL does not require restarting validator clients; it uses the existing public IP.

---

## Prerequisites

| Need | Notes |
|------|--------|
| Linux/amd64 host | Install DoubleZero **on the validator host**, not in a container. |
| Public IPv4, no NAT | Gossip IP must match this host. |
| Solana CLI on `$PATH` | For `solana sign-offchain-message`. |
| Validator identity keypair | Readable by the user running the commands (often under the `sol` user). |
| ≥1 SOL on the identity | Passport / onchain request. |
| GRE (IP proto 47) + BGP | BGP on `169.254.0.0/16` tcp/179. |
| `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` (or distro equivalent). |

The Validator ID is checked against Solana gossip to determine the target IP. A junk ID on the same IP is ignored; only the primary ID in gossip is used.

---

## Steps

### 1. Install the client

Follow [setup](setup.md) if `doublezero` is not installed. Mainnet packages:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

Rocky / RHEL: use `setup.rpm.sh` and `sudo yum install doublezero`.

**Verify:** `sudo systemctl status doublezerod` is active. Back up `~/.config/doublezero/id.json`.

### 2. Confirm the client is on mainnet-beta

Install the Mainnet-Beta packages from [setup](setup.md) (Testnet uses a different repo). Then:

```bash
doublezero status
```

**Pass:** `Network` is `mainnet-beta`. If it is `testnet`, switch with the copy-paste in [troubleshooting](troubleshooting.md#issue-wrong-doublezero-environment).

Wait ~30s, then `doublezero latency` should list mainnet devices.

### 3. Open UDP 44880 on `doublezero0`

```bash
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW: `sudo ufw allow in on doublezero0 to any port 44880 proto udp` and the matching `out` rule. Also allow GRE and BGP as in [setup](setup.md).

### 4. Confirm DoubleZero ID and primary validator

The DoubleZero ID from setup on the **primary** must be on every backup (`~/.config/doublezero/id.json`).

```bash
doublezero address
doublezero-solana passport find-validator -u mainnet-beta
```

Expect the primary: in gossip, in the leader schedule, “can connect as a primary”. On backups, run the same `find-validator`; they should **not** be leader-scheduled.

One machine only: omit `--backup-validator-ids` / `backup_ids=` from later commands.

### 5. Prepare the access message (primary)

On the primary (active stake, identity in gossip):

```bash
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address <DOUBLEZERO_ADDRESS> \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4>
```

Drop `--backup-validator-ids` if there are no backups (max 3). Copy the `solana sign-offchain-message …` line from the output.

### 6. Sign with the validator identity key

On the primary, run the printed command (identity keypair, **not** only the DoubleZero key):

```bash
solana sign-offchain-message \
   service_key=<DOUBLEZERO_ADDRESS>,backup_ids=<ID2>,<ID3>,<ID4> \
   -k <identity-keypair-file.json>
```

**Produces:** a signature string. Carry it into the next step.

### 7. Request validator access

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

Wait for Sentinel to validate and create the access pass. Optional: the agent can call **`check_edge_access`** with `pubkey` (`doublezero address`) and the host public IP until the pass is present.

### 8. Connect IBRL

```bash
doublezero connect ibrl
```

Wait ~1 minute for GRE. Until then, status may be `down` / `Unknown`.

```bash
doublezero status
```

**Pass:** `up`, User Type `IBRL`, Network `mainnet-beta`, tunnel typically `doublezero0`.

```bash
ip route
```

Expect BGP-learned routes via `doublezero0`.

---

## Gotchas

1. **Wrong env.** Testnet packages will not land on mainnet-beta. Confirm with `doublezero status`; switch using [troubleshooting](troubleshooting.md#issue-wrong-doublezero-environment).
2. **Identity not in gossip.** Junk IDs on the same IP cannot register the machine.
3. **Backups must share the primary DoubleZero ID.** Copy `id.json`; do not keygen a second identity.
4. **Sign with the validator identity**, not the DoubleZero key.
5. **Status down for ~1 minute** after `connect ibrl` is normal while GRE comes up.

---

## See also

- [Validator Mainnet-Beta Connection](DZ Mainnet-beta Connection.md)
- [Setup](setup.md)
- Next: [Publish shreds (Edge)](solana-shreds-publisher-runbook.md)
