---
description: LLM-oriented runbook — buy an Edge shreds seat and receive Solana shred multicast on doublezero1. Served to the MCP via GitHub raw; not published on the docs site.
---

# Subscribe to shreds (Edge) — runbook

This page is for the DoubleZero MCP (`get_onboarding_runbook`) via GitHub raw. It is
not published on the docs site.

1. Connect the [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Tell it the Linux host that will **receive** shreds (or SSH), the wallet/keypair for `doublezero-solana`, and which feed (leader vs retransmit).
3. Walk the steps below in order. Human guide: [Edge Subscriber Connection](Edge Subscriber Connection.md).

**What success looks like:** seat allocated for the current epoch, `doublezero status` shows the tunnel up, UDP shreds on `doublezero1` port `7733` (leader group `233.84.178.1`).

By connecting, the user agrees to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol). Data is for internal use and may not be retransmitted.

---

## Prerequisites

| Need | Notes |
|------|--------|
| Linux/amd64 host | Public IPv4, no NAT. On AWS: disable ENI source/dest check. |
| Solana CLI + `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` |
| Wallet | `~/.config/solana/id.json` (or `--keypair`). Needs **SOL** (fees) + **USDC** (seat escrow). |
| USDC mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Firewall | GRE, BGP (`169.254.0.0/16` tcp/179), PIM, UDP `7733` on `doublezero1`, UDP `44880` on `doublezero0`. |

---

## Steps

### 1. Install client + packages

Follow [setup](setup.md), then:

```bash
sudo apt update && sudo apt install doublezero-solana
```

Back up `~/.config/doublezero/id.json`.

### 2. Firewall

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW variants: human guide.

### 3. Enable the reconciler

Required so seats auto-provision the tunnel.

```bash
doublezero enable
```

### 4. Wallet

```bash
solana-keygen new    # if needed — writes ~/.config/solana/id.json; back it up
solana address
```

Fund SOL and USDC.

### 5. Pick device + price

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

Note lowest-latency **device code** and epoch price (base + premium). Prefer funding **>1 epoch**. Pricing UI: [devices](https://data.doublezero.xyz/dz/shreds/devices).

### 6. Buy a seat (blocking)

On the receiving host:

```bash
curl -4 -s ifconfig.me; echo
```

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

`--client-ip` must be the public IPv4 of the machine that will receive shreds. `--amount` is USDC decimal (e.g. `100`) and must meet the epoch price.

If less than 10% of the epoch remains, the CLI warns. `--accept-partial-epoch` takes the remainder now; otherwise wait. Underfunded escrow at settlement → seat gone, tunnel torn down, **tenure lost**.

Once allocated, the daemon brings the GRE tunnel up.

```bash
doublezero status
doublezero-solana shreds list
```

### 7. Confirm shreds

Leader shreds: `233.84.178.1:7733` on `doublezero1`. Discover groups with `doublezero multicast group list`.

| Feed | Group | Address |
|------|-------|---------|
| Leader | `edge-solana-shreds` | `233.84.178.1:7733` |
| Root | `edge-solana-root` | `233.84.178.16:7733` |
| Retransmit EU | `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| Retransmit APAC | `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| Retransmit AMER | `edge-solana-retrans-amer` | `233.84.178.14:7733` |

Port `5765` is a publisher heartbeat — not shreds. Traffic is GRE-encapsulated; some pipelines (XDP deshredders) must strip GRE.

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.1 and udp port 7733
```

---

## Gotchas

1. **Reconciler off.** Without `doublezero enable`, paying does not bring the tunnel up.
2. **`--client-ip` ≠ daemon IP.** Auto-discovery must match the seat.
3. **`Multicast user already exists`.** Disconnect first: `doublezero disconnect`, then retry `shreds pay`.
4. **Amount below current price.** Re-check `shreds price` and increase `--amount`.
5. **Seat not allocated after pay.** Late epoch (next epoch), device full (higher tenure), or withdraw before settlement.
6. **Keep escrow funded.** Top up with another `shreds pay`; do not let balance drop below epoch price.

---

## See also

- [Edge Subscriber Connection](Edge Subscriber Connection.md)
- [Support](support.md)
- Scoreboard / seats: [data.doublezero.xyz](https://data.doublezero.xyz/dz/shreds/scoreboard)
