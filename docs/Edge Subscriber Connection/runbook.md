---
description: Runbook to buy an Edge shreds seat and receive DoubleZero Edge shred multicast on doublezero1.
---

# Subscribe to shreds (Edge)

**Goal:** Seat allocated, tunnel up, UDP shreds on `doublezero1` port `7733` (e.g. `233.84.178.1`).

**Prereq:** [Install client](../setup/runbook.md)  
**Full guide:** [Subscribe to shreds (Edge)](../Edge%20Subscriber%20Connection.md)

Also need: Solana CLI, `doublezero-solana`, wallet with **SOL** + **USDC**, public IPv4, GRE/BGP/PIM allowed. On AWS: disable ENI source/destination check.

---

## 1 — Setup + packages

Follow [install-client](../setup/runbook.md). Then:

```bash
sudo apt update && sudo apt install doublezero-solana   # or equivalent
```

Back up `~/.config/doublezero/id.json`.

---

## 2 — Firewall

```bash
# iptables (core)
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW variants: [full guide](../Edge%20Subscriber%20Connection.md).

---

## 3 — Enable reconciler

```bash
doublezero enable
```

Required so seats auto-provision the tunnel.

---

## 4 — Wallet

```bash
solana-keygen new    # if needed — writes ~/.config/solana/id.json; back it up
solana address
```

Fund with SOL (fees) and USDC (seat escrow, mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

---

## 5 — Pick device + price

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

Note lowest-latency **device code** and epoch price. Prefer funding **>1 epoch**.

---

## 6 — Buy seat (blocking)

```bash
curl -4 -s ifconfig.me; echo   # receiving public IP

doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <PUBLIC_IP> \
  --amount <USDC_AMOUNT>
```

`--client-ip` must be this host’s public IPv4. Do not proceed until seat is allocated for the epoch.

```bash
doublezero-solana shreds list
doublezero status
```

---

## 7 — Confirm shreds

```bash
ip a s doublezero1
sudo tcpdump -ni doublezero1 udp port 7733
```

| Feed | Address |
|------|---------|
| Leader | `233.84.178.1:7733` |
| Root | `233.84.178.16:7733` (if listed) |
| Retrans EU / APAC / AMER | `233.84.178.12` / `.13` / `.14` `:7733` |

```bash
doublezero multicast group list
```

---

## 8 — Keep escrow funded

If escrow &lt; epoch price at settlement → seat lost, tunnel down, tenure reset. Top up with `shreds pay` again.

Issues → [troubleshoot-edge](../troubleshooting/runbook.md).
